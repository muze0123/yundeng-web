const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = __dirname;
const FONT = "PingFang SC,Microsoft YaHei,Noto Sans CJK SC,Arial,sans-serif";
const C = {
  ink: '#172033', muted: '#59647A', line: '#AEB8CC', bg: '#F5F7FB', white: '#FFFFFF',
  blue: '#3157E8', blueLite: '#EAF0FF', cyan: '#167E8A', cyanLite: '#E7F7F8',
  green: '#287A52', greenLite: '#EAF7EF', amber: '#9B6400', amberLite: '#FFF5DC',
  violet: '#6B4ACB', violetLite: '#F1ECFF', red: '#A83D4D', redLite: '#FDECEF',
  grayLite: '#EEF1F5', gray: '#667085'
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrap(text, max = 20) {
  const chars = [...String(text)];
  const lines = [];
  for (let i = 0; i < chars.length; i += max) lines.push(chars.slice(i, i + max).join(''));
  return lines.length ? lines : [''];
}

function rect(x, y, w, h, fill = C.white, stroke = C.line, rx = 8, sw = 2, dash = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}

function line(x1, y1, x2, y2, opts = {}) {
  const { color = C.line, width = 3, dash = '', arrow = true } = opts;
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}${arrow ? ' marker-end="url(#arrow)"' : ''}/>`;
}

function poly(points, opts = {}) {
  const { color = C.line, width = 3, dash = '', arrow = true } = opts;
  const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ');
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}${arrow ? ' marker-end="url(#arrow)"' : ''}/>`;
}

function text(x, y, lines, opts = {}) {
  const { size = 24, color = C.ink, weight = 400, anchor = 'start', lh = Math.round(size * 1.45) } = opts;
  const content = (Array.isArray(lines) ? lines : [lines])
    .map((s, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(s)}</tspan>`).join('');
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${content}</text>`;
}

function pill(x, y, label, fill, color, w = 126) {
  return `${rect(x, y, w, 38, fill, fill, 6, 0)}${text(x + w / 2, y + 27, label, { size: 19, color, weight: 600, anchor: 'middle' })}`;
}

function card(x, y, w, h, title, lines, opts = {}) {
  const { accent = C.blue, fill = C.white, stroke = C.line, tag = '', dashed = false, titleSize = 29, bodySize = 22 } = opts;
  let s = rect(x, y, w, h, fill, stroke, 8, 2, dashed ? '10 8' : '');
  s += `<rect x="${x}" y="${y}" width="10" height="${h}" rx="5" fill="${accent}"/>`;
  s += text(x + 28, y + 45, title, { size: titleSize, weight: 700, color: C.ink });
  if (tag) s += pill(x + w - 140, y + 18, tag, dashed ? C.grayLite : C.blueLite, dashed ? C.gray : C.blue, 116);
  let yy = y + 88;
  for (const raw of lines) {
    const isMuted = raw.startsWith('※');
    const lineText = isMuted ? raw.slice(1) : raw;
    const chunks = wrap(lineText, Math.max(16, Math.floor((w - 58) / (bodySize * 1.02))));
    s += text(x + 30, yy, chunks.map((v, i) => `${i ? '  ' : '• '}${v}`), {
      size: bodySize, color: isMuted ? C.muted : C.ink, lh: Math.round(bodySize * 1.45)
    });
    yy += chunks.length * Math.round(bodySize * 1.45) + 15;
  }
  return s;
}

function base(width, height, title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,8 L11,4 z" fill="${C.line}"/></marker>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#18243A" flood-opacity="0.10"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="${C.bg}"/>
  ${text(70, 74, title, { size: 43, weight: 760 })}
  ${text(70, 116, subtitle, { size: 22, color: C.muted })}
  ${pill(width - 470, 54, 'F1 页面事实', C.greenLite, C.green, 150)}
  ${pill(width - 305, 54, 'I 架构判断', C.amberLite, C.amber, 160)}
  ${pill(width - 130, 54, 'U 待核实', C.grayLite, C.gray, 120)}
  <path d="M70 145 H${width - 70}" stroke="#D7DDE8" stroke-width="2"/>`;
}

function finish() { return '</svg>'; }

function pageOverview() {
  const W = 2500, H = 1640;
  let s = base(W, H, 'EaseGlobal Browser 产品结构总图', '口径：页面/界面容器为骨架；表达关键功能、信息、状态与跳转｜版本 V1.0｜2026-08-14');

  s += card(70, 210, 500, 300, 'P-W01～P-W05 公开站点', [
    '官网首页：价值、下载、注册入口', '活动/广告/咨询/反馈弹窗', '帮助中心：8 板块、88 节点', '协议、隐私与客户端下载', '状态：正常/弹窗/校验失败/移动越界'
  ], { accent: C.cyan, fill: C.cyanLite, tag: 'F1' });
  s += card(665, 210, 500, 300, 'P-A01～P-A05 身份入口', [
    '手机号/账号登录与注册', '短信校验、协议确认', '创建或选择团队', '客户端安装与更新', '状态：待验证/受限/无团队/更新中'
  ], { accent: C.blue, fill: C.blueLite, tag: 'F1' });
  s += card(1260, 210, 520, 300, 'P-S01 应用外壳', [
    '管理 / 插件 / Agent 三主入口', '顶部：余额、消息、账号、团队', '底部：更新、反馈、客服、帮助', '全局：团队切换、账号管理、退出', '跳转到管理工作台或扩展域'
  ], { accent: C.violet, fill: C.violetLite, tag: 'F1' });
  s += card(1875, 210, 550, 300, 'P-R01 隔离店铺窗口', [
    '打开第三方平台并恢复标签页', '使用绑定设备/IP 与店铺缓存', '自动回填密码/OTP/Passkey', '承载插件、翻译、文件和书签', '状态：访问中/策略拦截/并发超限/异常'
  ], { accent: C.green, fill: C.greenLite, tag: 'F1+I' });

  s += line(570, 360, 665, 360);
  s += line(1165, 360, 1260, 360);
  s += line(1780, 360, 1875, 360);

  s += card(70, 690, 720, 520, 'P-M 管理工作台', [
    '首页：最近店铺、热门设备、使用指南', '店铺：列表、待绑定、平台、附加账号、转让、标签', '设备：可用/即将到期/已过期、购买、自有设备', '团队：成员/部门/角色、风控、安全、监控、日志', '费用：充值、余额、订单/发票、卡券', '核心跳转：建店→购设备→绑定→启动→治理→续费'
  ], { accent: C.blue, fill: C.white, tag: '详见分域图' });
  s += card(890, 690, 720, 520, 'P-X 插件中心', [
    '插件列表与空状态', 'Chrome 应用商店获取插件', '上传自研 .crx / .zip', '查看权限并确认风险', '自动分配或按店铺/成员分配', '状态：未添加/已添加/待重启生效/待手动更新'
  ], { accent: C.cyan, fill: C.white, tag: 'F1' });
  s += card(1710, 690, 720, 520, 'P-G Agent 工作台', [
    '应用中心：多店巡检、选品、复盘、履约、客服、营销', '自动化、技能中心、内容库', '任务列表、任务输入与执行入口', '定制需求弹窗与免费版/Token 入口', '状态：空任务/执行中/结果/失败的完整口径待核实', '※Agent 仍处早期，可见入口不等于稳定闭环'
  ], { accent: C.violet, fill: C.white, tag: 'F1+U', dashed: true });

  s += poly([[1520, 510], [1520, 610], [430, 610], [430, 690]], { arrow: true });
  s += poly([[1520, 510], [1520, 610], [1250, 610], [1250, 690]], { arrow: true });
  s += poly([[1520, 510], [1520, 610], [2070, 610], [2070, 690]], { arrow: true });
  s += poly([[430, 1210], [430, 1330], [2160, 1330], [2160, 1210]], { color: C.green, dash: '10 8', arrow: true });
  s += text(1295, 1368, '店铺、成员与设备作为上下文进入插件/Agent；实际 Agent 执行关系待核实', { size: 21, color: C.muted, anchor: 'middle' });

  s += card(70, 1430, 2360, 120, '关键返回与异常路径', [
    '登录受限→申请/拒绝；建店无设备→待绑定；支付成功→待交付；设备过期→不可启动；策略命中→拦截/记录；支持问题→反馈/客服/临时授权。'
  ], { accent: C.red, fill: C.redLite, tag: '生命周期' });
  return s + finish();
}

function managementDetail() {
  const W = 2750, H = 2040;
  let s = base(W, H, 'EaseGlobal Browser 产品结构：管理工作台分域图', '范围：登录后“管理”入口；页面 ID 与正文映射表一致｜弹窗/抽屉使用虚线｜2026-08-14');
  s += card(920, 180, 910, 170, 'P-S01 管理应用外壳', [
    '顶部导航：首页 / 店铺管理 / 设备管理 / 团队管理 / 费用管理', '全局：余额、通知、账号、团队切换；侧栏切换插件与 Agent'
  ], { accent: C.violet, fill: C.violetLite, tag: 'F1' });

  const xs = [55, 595, 1135, 1675, 2215];
  const w = 480;
  const cards = [
    ['P-M01 首页', C.cyan, C.cyanLite, [
      '最近访问店铺', '热门设备及价格', '使用指南', '购买设备 / 添加店铺', '新手任务与引导弹窗', '空态：无最近店铺 / 无设备'
    ]],
    ['P-M10 店铺管理', C.blue, C.blueLite, [
      'P-M11 全部店铺', 'P-M12 待绑定店铺', 'P-M13 专属平台分类', 'P-M14 附加账号', 'P-M15 转让店铺', 'P-M16 店铺标签', '筛选 / 搜索 / 排序 / 批量操作', '状态：未绑定 / 可访问 / 受限 / 不可访问'
    ]],
    ['P-M20 设备管理', C.green, C.greenLite, [
      'P-M21 设备导览 / 热门设备', 'P-M22 可用设备', 'P-M23 即将过期', 'P-M24 已过期', 'P-M25 购买设备向导', 'P-M26 添加自有设备', '详情 / 检测 / 绑定 / 续费 / 自动续费 / 更换', '状态：待交付 / 可用 / 已绑定 / 过期 / 移除'
    ]],
    ['P-M30 团队管理', C.violet, C.violetLite, [
      'P-M31 成员 / 部门 / 角色', 'P-M32 登录控制 / 登录申请 / 二步验证', 'P-M33 访问策略 / 通用策略 / 访问日志', 'P-M34 监控店铺 / 监控日志', 'P-M35 登录日志 / 操作日志', '角色 + 数据范围 + 对象授权 + 动态策略', '状态：待激活 / 正常 / 暂停 / 删除'
    ]],
    ['P-M40 费用管理', C.amber, C.amberLite, [
      'P-M41 账户充值', 'P-M42 余额明细', 'P-M43 订单列表', 'P-M44 发票管理', 'P-M45 我的卡券', '微信 / 支付宝 / 对公转账', '状态：待支付 / 已支付 / 已取消 / 开票中', '余额不足与续费失败恢复待核实'
    ]]
  ];

  for (let i = 0; i < cards.length; i++) {
    const [title, accent, fill, lines] = cards[i];
    s += poly([[1375, 350], [1375, 430], [xs[i] + w / 2, 430], [xs[i] + w / 2, 500]], { arrow: true });
    s += card(xs[i], 500, w, 710, title, lines, { accent, fill, tag: '页面域' });
  }

  const modals = [
    ['M-01 引导/全局浮层', ['新手任务', '消息/更新', '账号菜单', '帮助/反馈/客服']],
    ['M-10 店铺操作容器', ['添加/批量导入', '编辑/复制/转让', '授权/绑定设备', '清缓存/删除确认']],
    ['M-20 设备交易容器', ['地区/供应商/SKU', '时长/数量/优惠', '确认订单/支付', '换 IP/续费/绑定']],
    ['M-30 权限策略容器', ['添加成员/部门/角色', '授权店铺/附加账号', '编辑登录/访问策略', '监控配置/回放']],
    ['M-40 资金与票据容器', ['充值支付', '取消订单', '发票申请/查看', '自动续费设置']]
  ];
  for (let i = 0; i < modals.length; i++) {
    s += line(xs[i] + w / 2, 1210, xs[i] + w / 2, 1320, { dash: '10 8' });
    s += card(xs[i], 1320, w, 330, modals[i][0], modals[i][1], {
      accent: C.gray, fill: C.grayLite, stroke: C.gray, tag: '弹窗/抽屉', dashed: true, bodySize: 21
    });
  }

  s += card(55, 1770, 2640, 170, '核心页面跳转闭环', [
    '首页/店铺列表 → 添加店铺 → 待绑定店铺 → 购买或添加设备 → 待交付/检测 → 绑定店铺 → 启动隔离窗口 → 成员授权与策略 → 监控/日志 → 续费/换 IP/扩容。',
    '异常：登录受限、库存不足、支付失败、交付等待、设备过期、并发超限、策略命中、权限不足分别保留独立状态，不以“操作成功”笼统覆盖。'
  ], { accent: C.red, fill: C.redLite, tag: '关键旅程' });
  return s + finish();
}

function functionStructure() {
  const W = 2750, H = 2050;
  let s = base(W, H, 'EaseGlobal Browser 产品功能结构图', '口径：按业务能力回答“能做什么”，不按页面导航归类，不展开字段｜L0-L3｜2026-08-14');
  s += card(930, 175, 890, 160, 'F0 跨境店铺运营能力体系', [
    '以店铺为主资产，以设备为使用前提，以团队治理和商业续费维持长期运营'
  ], { accent: C.blue, fill: C.blueLite, tag: 'L0' });

  const cols = [55, 735, 1415, 2095];
  const rows = [450, 1190];
  const specs = [
    ['F1 身份与租户进入', C.cyan, C.cyanLite, [
      '注册账号 / 登录账号', '校验短信与协议', '创建团队 / 切换团队', '维护密码与手机号', '安装客户端 / 更新版本', '处理登录限制与申请'
    ]],
    ['F2 管理店铺环境', C.blue, C.blueLite, [
      '创建 / 批量导入店铺', '编辑 / 复制 / 转让店铺', '筛选 / 标签 / 排序店铺', '配置内核、UA 与启动方式', '导入 Cookie / 清理缓存', '限制店铺并发人数', '启动 / 关闭 / 删除店铺'
    ]],
    ['F3 管理网络设备', C.green, C.greenLite, [
      '筛选并购买平台设备', '添加 / 批量导入自有设备', '检测网络与平台可达性', '绑定 / 解绑店铺', '续费 / 开启自动续费', '更换 IP 并承接绑定', '处理交付、到期与移除'
    ]],
    ['F4 协作与分配权限', C.violet, C.violetLite, [
      '创建部门 / 维护层级', '添加 / 激活 / 暂停成员', '创建角色 / 分配功能权限', '配置部门数据范围', '授权店铺 / 附加账号', '回收权限 / 删除成员', '预览最终权限（当前缺口）'
    ]],
    ['F5 治理访问与审计', C.red, C.redLite, [
      '限制登录时间、终端与地区', '审批受限登录申请', '限制 URL 与页面元素', '限制密码、F12 与打印', '配置屏幕水印', '开启店铺录像 / 查看回放', '查询登录、操作与命中日志'
    ]],
    ['F6 管理凭证与运营工具', C.cyan, C.cyanLite, [
      '托管账号与密码', '导入 / 同步 Cookie', '配置 / 授权 OTP', '绑定 / 解绑 Passkey', '管理附加账号', '分发书签与隔离文件', '翻译页面 / 支持视频认证'
    ]],
    ['F7 完成计费与服务闭环', C.amber, C.amberLite, [
      '充值团队余额', '选择支付方式 / 对公汇款', '使用优惠券', '查询余额与订单', '取消待支付订单', '申请 / 查询发票', '反馈问题 / 临时授权排障'
    ]],
    ['F8 扩展插件与自动化', C.violet, C.violetLite, [
      '获取 Chrome 商店插件', '上传 / 更新自研插件', '确认插件权限与风险', '按店铺 / 成员分配插件', '选择 Agent 应用与技能', '创建 / 查询 Agent 任务', '处理执行结果与人工接管（待核实）'
    ]]
  ];
  for (let i = 0; i < specs.length; i++) {
    const row = Math.floor(i / 4), col = i % 4;
    const x = cols[col], y = rows[row];
    const [title, accent, fill, lines] = specs[i];
    if (row === 0) s += poly([[1375, 335], [1375, 390], [x + 300, 390], [x + 300, 450]], { arrow: true });
    s += card(x, y, 600, 600, title, lines, { accent, fill, tag: i === 7 ? 'L1 / 含U' : 'L1', dashed: i === 7 });
  }
  s += text(1375, 1128, '第二行能力同属 F0；为控制连线交叉省略重复父线', { size: 21, color: C.muted, anchor: 'middle' });
  s += card(55, 1840, 2640, 150, '跨域公共规则', ['搜索/筛选/批量、权限校验、空态/错误/禁用、确认与撤销、提醒与日志、帮助与客服。'], { accent: C.gray, fill: C.grayLite, tag: '公共能力', bodySize: 20 });
  return s + finish();
}

function informationStructure() {
  const W = 2850, H = 2150;
  let s = base(W, H, 'EaseGlobal Browser 产品信息结构图', '口径：按业务对象归一字段、关系与状态；不是数据库 ER 图，不代表技术实现｜2026-08-14');

  // Draw relations first so cards stay visually above lines.
  s += line(400, 345, 780, 345); // account-team
  s += line(1050, 500, 1050, 680); // team-store
  s += line(780, 410, 520, 730); // team-member
  s += line(400, 920, 520, 820); // org-member
  s += line(710, 790, 820, 820); // member-auth
  s += line(1080, 870, 1080, 680, { arrow: false });
  s += poly([[1080, 870], [1080, 1110], [1450, 1110]], { arrow: true }); // store-device
  s += line(1380, 830, 1660, 830); // store-env
  s += poly([[1220, 920], [1380, 920], [1380, 1300], [2220, 1300]], { arrow: true }); // store-credential
  s += poly([[1050, 1000], [1050, 1350], [820, 1350]], { arrow: true }); // store-policy
  s += poly([[600, 1350], [600, 1690], [980, 1690]], { arrow: true }); // policy-audit
  s += poly([[650, 870], [650, 1570], [980, 1690]], { color: C.line, dash: '10 8', arrow: true });
  s += line(2190, 350, 2470, 350); // wallet-order
  s += poly([[2300, 500], [2300, 1100], [2120, 1100]], { arrow: true }); // order-device sku
  s += poly([[1180, 500], [1180, 580], [2320, 580], [2320, 500]], { arrow: true }); // team-order
  s += poly([[1380, 920], [1520, 920], [1520, 1710], [1960, 1710]], { color: C.violet, dash: '10 8', arrow: true }); // store-agent/plugin
  s += poly([[1200, 500], [1200, 610], [2500, 610], [2500, 1540]], { color: C.violet, arrow: true }); // team-plugin

  s += text(590, 320, '创建/加入', { size: 18, color: C.muted, anchor: 'middle' });
  s += text(1065, 610, '1:N', { size: 18, color: C.muted });
  s += text(1400, 1086, '绑定 N:1', { size: 18, color: C.muted, anchor: 'middle' });
  s += text(1520, 800, '1:1 配置', { size: 18, color: C.muted, anchor: 'middle' });
  s += text(1820, 1275, '1:N 托管', { size: 18, color: C.muted, anchor: 'middle' });
  s += text(805, 790, 'N:M 授权', { size: 18, color: C.muted, anchor: 'middle' });
  s += text(2325, 1015, '订单行→SKU/设备', { size: 18, color: C.muted, anchor: 'middle' });
  s += text(1765, 1665, '扩展上下文（Agent 关系待核实）', { size: 18, color: C.muted, anchor: 'middle' });

  s += card(60, 220, 340, 250, 'O-ACC 账号', ['账号标识/手机号', '昵称/密码状态', '团队成员关系', '状态：待验证/正常/受限'], { accent: C.cyan, fill: C.cyanLite, tag: 'F1', bodySize: 19, titleSize: 25 });
  s += card(780, 200, 600, 300, 'O-TEAM 团队', ['团队ID/名称/创建者', '余额/成员/资产汇总', '关联：部门、角色、店铺、设备', '状态：正常；转移/解散规则待核实'], { accent: C.blue, fill: C.blueLite, tag: '核心对象', bodySize: 20, titleSize: 27 });
  s += card(60, 710, 340, 300, 'O-ORG 组织', ['部门ID/父部门', '角色ID/名称/类型', '功能权限/数据范围', '状态：启用/删除'], { accent: C.violet, fill: C.violetLite, tag: 'F1', bodySize: 19, titleSize: 25 });
  s += card(520, 680, 320, 350, 'O-MEM 成员', ['成员ID/账号/名称', '部门/角色', '授权店铺数', '登录终端/时间', '状态：待激活/正常/暂停/删除'], { accent: C.violet, fill: C.violetLite, tag: 'F1', bodySize: 18, titleSize: 25 });
  s += card(820, 760, 260, 240, 'O-AUTH 授权', ['成员/店铺', '附加账号范围', '凭证使用范围', '生效/冻结/回收'], { accent: C.amber, fill: C.amberLite, tag: '关系对象', bodySize: 17, titleSize: 23 });
  s += card(1080, 680, 300, 320, 'O-STORE 店铺', ['店铺ID/名称', '平台/站点/账号', '标签/并发数', '设备/成员/最近登录', '状态：待绑定/可访问/受限/中断'], { accent: C.blue, fill: C.blueLite, tag: '中心对象', bodySize: 18, titleSize: 25 });
  s += card(1660, 680, 360, 340, 'O-ENV 环境配置', ['内核/UA/OS标识', '打开方式/缓存策略', 'Cookie同步方式', '本地/云端缓存状态', '具体指纹字段未完整核实'], { accent: C.cyan, fill: C.cyanLite, tag: 'F1+U', bodySize: 19, titleSize: 25 });
  s += card(2220, 920, 500, 430, 'O-CRED 凭证集合', ['账号/密码', 'Cookie', 'OTP密钥/授权', 'Passkey密钥/绑定', '附加账号', '状态：有效/失效/解绑/权限受限'], { accent: C.red, fill: C.redLite, tag: '敏感', bodySize: 19, titleSize: 25 });
  s += card(1450, 1050, 360, 400, 'O-DEV 设备/IP', ['设备ID/名称/IP', '地区/供应商/线路', '协议/认证/库存', '绑定店铺/到期时间', '状态：待交付/可用/已绑定/临期/过期/移除'], { accent: C.green, fill: C.greenLite, tag: '付费资源', bodySize: 18, titleSize: 25 });
  s += card(60, 1220, 760, 310, 'O-POL 策略', ['策略ID/类型/适用成员/适用店铺', '登录时间/终端/地区；URL/页面元素；密码/F12/打印；水印', '状态：草稿口径未见；可确认启用/停用/命中'], { accent: C.red, fill: C.redLite, tag: '治理对象', bodySize: 20, titleSize: 26 });
  s += card(980, 1580, 600, 350, 'O-AUDIT 监控与日志', ['录像：店铺/成员/时间/URL/动作/截图', '登录日志：成员/终端/IP/时间/结果', '操作日志：操作者/对象/动作/结果', '访问命中：策略/页面/时间/处置', '录像帮助口径：近30天'], { accent: C.red, fill: C.redLite, tag: '留痕', bodySize: 19, titleSize: 26 });
  s += card(1960, 1560, 780, 400, 'O-EXT 插件与 Agent', ['插件：名称/版本/来源/权限/分配方式/更新状态', 'Agent应用：名称/场景/标签/任务数量', 'Agent任务：输入/状态/结果/Token（字段与状态未完整核实）', '插件与店铺/成员存在分配关系；Agent执行上下文属于架构判断'], { accent: C.violet, fill: C.violetLite, tag: '含U', dashed: true, bodySize: 20, titleSize: 26 });
  s += card(1880, 200, 310, 300, 'O-WAL 余额', ['团队余额', '充值/消费/退款', '支付渠道', '明细时间/类型'], { accent: C.amber, fill: C.amberLite, tag: 'F1', bodySize: 18, titleSize: 24 });
  s += card(2470, 180, 320, 360, 'O-ORD 订单/票据', ['订单号/类型/金额', '原价/折扣/实付', '时长/数量/优惠券', '支付方式/状态', '发票抬头/收件/状态', '自动续费设置'], { accent: C.amber, fill: C.amberLite, tag: '商业对象', bodySize: 18, titleSize: 24 });

  s += card(60, 2020, 2730, 70, '关系边界', ['实线为页面/帮助中心可支持的对象关系；紫色虚线为 Agent 上下文等架构判断；本图不声明数据库表、主外键、加密实现或服务端判定顺序。'], { accent: C.gray, fill: C.grayLite, tag: '说明', bodySize: 19 });
  return s + finish();
}

const diagrams = [
  ['EaseGlobal Browser产品结构总图', pageOverview()],
  ['EaseGlobal Browser产品结构-管理工作台分域图', managementDetail()],
  ['EaseGlobal Browser产品功能结构图', functionStructure()],
  ['EaseGlobal Browser产品信息结构图', informationStructure()]
];

(async () => {
  for (const [name, svg] of diagrams) {
    const svgPath = path.join(OUT, `${name}.svg`);
    const pngPath = path.join(OUT, `${name}.png`);
    fs.writeFileSync(svgPath, svg, 'utf8');
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(pngPath);
    const meta = await sharp(pngPath).metadata();
    process.stdout.write(`${name}: ${meta.width}x${meta.height}\n`);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
