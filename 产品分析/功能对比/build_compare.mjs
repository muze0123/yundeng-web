import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const cwd = process.cwd();
const outputDir = path.join(cwd, 'outputs/yunlogin_adspower_compare');
const adsFile = path.join(cwd, 'Adspower产品分析/Adspower产品功能清单.md');
const yunFile = path.join(cwd, 'YunLogin产品分析/YunLogin产品功能清单.md');

const adsText = await fs.readFile(adsFile, 'utf8');
const yunText = await fs.readFile(yunFile, 'utf8');

function cleanCell(s) {
  return s.trim().replace(/<br\s*\/?\s*>/gi, '；').replace(/`/g, '');
}

function parseAds(text) {
  const rows = [];
  let section = '';
  for (const [idx, line] of text.split(/\r?\n/).entries()) {
    const h = line.match(/^##\s+\d+\.\s+(.+)$/);
    if (h) section = h[1].trim();
    if (!line.startsWith('|')) continue;
    const c = line.split('|').slice(1, -1).map(cleanCell);
    if (c.length < 6 || !/^[A-Z][A-Z0-9-]*-\d{3}$/.test(c[0])) continue;
    rows.push({ id:c[0], section, page:c[1], feature:c[2], control:c[3], rule:c[4], status:c[5], line:idx+1 });
  }
  const byId = new Map();
  for (const row of rows) if (!byId.has(row.id)) byId.set(row.id, row);
  return [...byId.values()];
}

function parseYun(text) {
  const rows = [];
  let section = '';
  for (const [idx, line] of text.split(/\r?\n/).entries()) {
    const h = line.match(/^##\s+\d+\.\s+(.+)$/);
    if (h) section = h[1].trim();
    if (!line.startsWith('|')) continue;
    const c = line.split('|').slice(1, -1).map(cleanCell);
    if (c.length !== 5 || c[0] === '一级模块' || c[0] === '优先级' || /^-+$/.test(c[0])) continue;
    rows.push({ section, level1:c[0], level2:c[1], feature:c[2], rule:c[3], status:c[4], line:idx+1 });
  }
  return rows;
}

const moduleMap = [
  [/应用框架|全局导航|更新中心|任务中心|消息中心/, '全局框架与服务'],
  [/注册|登录|账号恢复/, '身份与访问'],
  [/个人设置|账号安全/, '个人账号与安全'],
  [/新建浏览器/, '环境创建与指纹'],
  [/环境管理|分组管理/, '环境资产管理'],
  [/代理管理|代理商城/, '代理资源'],
  [/应用中心/, '插件与应用生态'],
  [/回收站/, '回收与恢复'],
  [/云手机/, '云手机'],
  [/窗口同步/, '窗口同步'],
  [/RPA/, 'RPA自动化'],
  [/API|MCP/, 'API与开发者生态'],
  [/团队信息|团队管理|成员管理|权限/, '团队与权限'],
  [/操作日志|日志管理/, '日志与审计'],
  [/全局设置|设置/, '全局设置与治理'],
  [/费用|钱包|订单/, '费用与订单'],
  [/免费版|试用|订阅套餐|终身环境/, '套餐与商业化'],
  [/推广奖励/, '推广与增长'],
  [/外部资源|官网服务/, '外部生态与信任'],
];

function canonicalModule(text) {
  for (const [re, name] of moduleMap) if (re.test(text)) return name;
  return text || '其他';
}

const aliases = [
  [/浏览器环境|浏览器/g, '环境'], [/应用中心|应用|扩展/g, '插件'], [/分组管理/g, '分组'],
  [/RPA Plus|RPA流程|RPA任务/g, 'RPA'], [/Local API|API&MCP/g, 'API'],
  [/团队钱包|钱包余额|钱包/g, '云币'], [/代理列表/g, '自有代理'], [/手机号/g, '手机'],
  [/账号平台/g, '平台账号'], [/数据同步/g, '缓存同步'], [/立即更新/g, '更新'],
  [/操作按钮|按钮|菜单项|入口|文本链接|开关|配置|页面/g, ''],
];

function normalize(s) {
  let x = s.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
  for (const [re, val] of aliases) x = x.replace(re, val.toLowerCase());
  return x;
}

function semanticRoot(s) {
  return normalize(s).replace(/(管理中心|管理|中心|入口|页面|列表|信息|状态|设置|配置|操作|功能|模块|按钮|能力)$/g,'');
}

function grams(s) {
  const x = normalize(s);
  const set = new Set();
  for (let i=0;i<x.length;i++) set.add(x[i]);
  for (let i=0;i<x.length-1;i++) set.add(x.slice(i,i+2));
  return set;
}

function similarity(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (!na || !nb) return 0;
  let bonus = 0;
  if (na.includes(nb) || nb.includes(na)) bonus += 0.3;
  const A=grams(na), B=grams(nb);
  let inter=0;
  for (const v of A) if (B.has(v)) inter++;
  const dice = (2*inter)/(A.size+B.size || 1);
  return Math.min(1, dice + bonus);
}

const adsRows = parseAds(adsText);
const yunRows = parseYun(yunText);

function yunModule(y) { return canonicalModule(`${y.section} ${y.level1}`); }

const exactOverrides = {
  'APP-031':'软件与内核更新', 'APP-032':'后台任务', 'APP-033':'消息分类', 'APP-037':'退出',
  'AUTH-020':'忘记密码', 'AUTH-021':'密码重置', 'AUTH-022':'密码重置', 'AUTH-023':'密码重置',
  'USER-002':'绑定邮箱', 'USER-003':'更换手机', 'USER-004':'修改登录密码', 'USER-006':'个人认证',
  'ENV-020':'启动/关闭', 'ENV-021':'启动/关闭', 'ENV-023':'克隆环境', 'ENV-024':'软删除',
  'ENV-026':'自动访问', 'ENV-027':'代理换绑', 'ENV-028':'账号换绑', 'ENV-029':'指纹编辑',
  'ENV-031':'创建执行任务', 'ENV-036':'分享对象', 'ENV-037':'资产动作',
  'PROXY-039':'批量新增', 'PROXY-043':'检测与编辑', 'PROXY-057':'订单计算', 'PROXY-058':'支付方式',
  'APPSTORE-001':'已有插件', 'APPSTORE-010':'全局启用', 'APPSTORE-013':'删除/移除',
  'RECYCLE-017':'自动清除', 'RECYCLE-018':'单个/全部恢复', 'RECYCLE-019':'单个/全部恢复',
  'FLOW-005':'模板列表', 'FLOW-006':'创建执行任务', 'FLOW-008':'模板列表',
  'TASK-013':'执行对象', 'RUN-006':'执行结果', 'TEMPLATE-001':'平台分类',
  'API-002':'环境接口', 'API-003':'框架协同', 'API-004':'控制接口',
  'BILL-001':'余额与流水', 'BILL-003':'在线充值', 'BILL-008':'支付方式', 'BILL-009':'支付方式',
  'BILL-018':'自动续费', 'BILL-022':'列表字段', 'BILL-024':'订单详情',
  'PLAN-025':'环境额度', 'PLAN-026':'额外成员', 'PLAN-028':'订单计算',
  'CENTER-001':'软件与内核更新', 'CENTER-002':'软件与内核更新', 'CENTER-005':'后台任务',
};

function findYunForAds(a) {
  const targetModule = canonicalModule(a.section);
  const forced = exactOverrides[a.id];
  if (forced) {
    const found = yunRows.find(y => y.feature.includes(forced) || y.level2.includes(forced));
    if (found) return {row:found, score:1};
  }
  const candidates = yunRows.filter(y => yunModule(y) === targetModule ||
    (targetModule === '套餐与商业化' && ['商城','费用管理'].includes(y.level1)) ||
    (targetModule === '全局框架与服务' && ['全局导航','设置'].includes(y.level1)) ||
    (targetModule === '个人账号与安全' && ['账号设置','身份访问'].includes(y.level1)) ||
    (targetModule === '插件与应用生态' && y.level1 === '插件管理'));
  let best=null, bestScore=0;
  const aCore = `${a.page} ${a.feature}`;
  for (const y of candidates) {
    let score = similarity(aCore, `${y.level2} ${y.feature}`);
    score += 0.16*similarity(a.rule, y.rule);
    if (a.feature === y.feature) score += 0.35;
    const af=normalize(a.feature), ar=semanticRoot(a.feature), yr=normalize(y.rule), yf=normalize(y.feature), yfr=semanticRoot(y.feature), yl=normalize(`${y.level1}${y.level2}`);
    if (af.length >= 2 && yr.includes(af)) score += 0.58;
    if (ar.length >= 2 && (yr.includes(ar) || yl.includes(ar) || yfr.includes(ar) || ar.includes(yfr))) score += 0.48;
    if (yf.length >= 2 && normalize(`${a.page}${a.feature}${a.rule}`).includes(yf)) score += 0.22;
    if (af.length >= 2 && yl.includes(af)) score += 0.45;
    if (score > bestScore) { bestScore=score; best=y; }
  }
  return {row: bestScore >= 0.34 ? best : null, score:bestScore};
}

const blueKeywords = /第三方登录|第三方注册|浏览器内核|操作系统|代理类型|使用期|购买周期|支付方式|支付渠道|环境价格|套餐价格|环境范围|额外成员|分享|回收对象|认证|自动续|密码规则|协议|充值|币种|钱包|云币/;
const explicitNo = new Set(['PLAN-010']);

function impactFor(module) {
  const map = {
    '身份与访问':'影响注册转化、账号安全与全球用户接入',
    '环境创建与指纹':'影响环境隔离质量、配置效率与平台兼容性',
    '环境资产管理':'影响批量运营效率、资产安全与跨团队协作',
    '代理资源':'影响网络资源供给、稳定性和代理变现',
    '插件与应用生态':'影响能力扩展、生态合作和用户留存',
    '窗口同步':'影响多账号重复操作效率，是规模化运营的核心效率能力',
    'RPA自动化':'影响无人值守运营、任务稳定性与高阶套餐价值',
    'API与开发者生态':'影响系统集成、开发者采用和企业客户扩展',
    '团队与权限':'影响组织扩张、权限治理与企业采购',
    '费用与订单':'影响支付转化、财务管理与售后体验',
    '套餐与商业化':'影响获客门槛、ARPU、续费和大客户变现',
    '推广与增长':'影响低成本获客和渠道裂变',
    '外部生态与信任':'影响品牌可信度、内容获客和合作伙伴增长',
  };
  return map[module] || '影响产品完整性、操作效率或用户体验';
}

function priorityFor(module, diff, adsStatus) {
  if (!['红色：AdsPower有、YunLogin明确没有','黄色：AdsPower有、YunLogin待确认'].includes(diff)) return '-';
  if (adsStatus !== '明确' && adsStatus !== '部分明确') return '-';
  if (['窗口同步','RPA自动化','API与开发者生态','套餐与商业化','环境资产管理'].includes(module)) return 'P0';
  if (['代理资源','团队与权限','插件与应用生态','费用与订单','身份与访问'].includes(module)) return 'P1';
  return 'P2';
}

function recommendation(module, a) {
  if (module === '窗口同步') return '优先补齐 YunLogin 原生控制台、主从窗口、文本/标签页管理、快捷键和异常处理，并以实测验证。';
  if (module === 'API与开发者生态') return '补齐 API Key、接口文档、错误码、调用日志；评估 MCP 接入价值，先从环境查询/启停工具集切入。';
  if (module === 'RPA自动化') return '补齐节点库、任务状态机、失败重试、告警、流程分享及付费模板商业化。';
  if (module === '套餐与商业化') return '验证需求后设计免费体验、长期权益或大规模套餐；不能直接照搬 AdsPower 分档。';
  if (module === '推广与增长') return '评估邀请返佣的获客成本、作弊风险和渠道归因，再决定是否建设推广中心。';
  if (module === '插件与应用生态') return '先完善插件兼容、权限、版本与团队治理，再扩展推荐应用和精选资源。';
  return `核实 YunLogin 是否已有“${a.feature}”；若确认缺失，再结合目标用户场景设计，不直接复制竞品交互。`;
}

const comparison = [];
const matchedYunLines = new Set();
for (const a of adsRows) {
  const module = canonicalModule(a.section);
  const {row:y, score} = findYunForAds(a);
  if (y) matchedYunLines.add(y.line);
  let diff, yunState, rationale;
  if (['建议补充','核心补充','建议方案','未提供'].includes(a.status)) {
    diff = '灰色：AdsPower非确认或不直接可比';
    yunState = y ? y.status : '不适用';
    rationale = `AdsPower来源状态为“${a.status}”，不能作为其已上线能力据此判定YunLogin缺失。`;
  } else if (explicitNo.has(a.id)) {
    diff = '红色：AdsPower有、YunLogin明确没有';
    yunState = '明确没有';
    rationale = 'YunLogin材料已明确不存在套餐企业档；AdsPower明确提供企业版和销售询价。';
  } else if (!y) {
    diff = '黄色：AdsPower有、YunLogin待确认';
    yunState = '材料未覆盖';
    rationale = 'AdsPower能力已确认，但YunLogin现有文档无直接对应证据；证据不足不等于确定没有。';
  } else if (['规则补全','待补充'].includes(y.status)) {
    diff = '黄色：AdsPower有、YunLogin待确认';
    yunState = y.status;
    rationale = `YunLogin对应内容为“${y.status}”，尚不能证明当前版本已实现。`;
  } else if (y.status === '部分') {
    diff = '蓝色：双方均有但实现不同';
    yunState = y.status;
    rationale = '双方存在对应能力，但YunLogin只确认部分流程或字段，能力完整度与AdsPower不同。';
  } else if (blueKeywords.test(`${a.feature}${a.rule}`)) {
    diff = '蓝色：双方均有但实现不同';
    yunState = y.status;
    rationale = '双方均有对应能力，但渠道、字段、计价、范围或业务规则存在明显差异。';
  } else {
    diff = '绿色：双方核心能力一致';
    yunState = y.status;
    rationale = '两套文档均存在直接对应的核心功能，差异主要是命名或界面细节。';
  }
  const priority = priorityFor(module, diff, a.status);
  comparison.push({
    module, adsSection:a.section, adsId:a.id, adsFeature:a.feature, adsDetail:`${a.page}｜${a.control}｜${a.rule}`,
    adsStatus:a.status, yunModule:y ? `${y.level1}/${y.level2}` : '', yunFeature:y?.feature || '',
    yunDetail:y?.rule || '', yunStatus:yunState, diff, rationale, score:Number(Math.min(1, score).toFixed(3)),
    impact:impactFor(module), priority, recommendation:priority==='-'?'—':recommendation(module,a),
    adsSource:`Adspower产品功能清单.md:${a.line}`, yunSource:y?`YunLogin产品功能清单.md:${y.line}`:'未找到直接证据'
  });
}

for (const y of yunRows.filter(r => !matchedYunLines.has(r.line) && !['规则补全','待补充'].includes(r.status))) {
  comparison.push({
    module:yunModule(y), adsSection:'', adsId:'YUN-ONLY', adsFeature:'', adsDetail:'', adsStatus:'未匹配',
    yunModule:`${y.level1}/${y.level2}`, yunFeature:y.feature, yunDetail:y.rule, yunStatus:y.status,
    diff:'灰色：仅YunLogin有或未直接匹配', rationale:'YunLogin文档存在该能力，但AdsPower清单未找到足够明确的直接对应项；不据此断言AdsPower没有。',
    score:0, impact:impactFor(yunModule(y)), priority:'-', recommendation:'—', adsSource:'未找到直接证据', yunSource:`YunLogin产品功能清单.md:${y.line}`
  });
}

const counts = {};
for (const r of comparison) counts[r.diff]=(counts[r.diff]||0)+1;
const moduleGapCounts = {};
for (const r of comparison.filter(r => r.diff.startsWith('红色') || r.diff.startsWith('黄色'))) {
  moduleGapCounts[r.module]=(moduleGapCounts[r.module]||0)+1;
}

const workbook = Workbook.create();
const dash = workbook.worksheets.add('统计看板');
const compare = workbook.worksheets.add('功能对比');
const gaps = workbook.worksheets.add('差距清单');
const legend = workbook.worksheets.add('口径与图例');
for (const sh of [dash,compare,gaps,legend]) sh.showGridLines=false;

const colors = {
  '红色：AdsPower有、YunLogin明确没有':'#F4CCCC',
  '黄色：AdsPower有、YunLogin待确认':'#FFF2CC',
  '绿色：双方核心能力一致':'#D9EAD3',
  '蓝色：双方均有但实现不同':'#CFE2F3',
  '灰色：仅YunLogin有或未直接匹配':'#E7E6E6',
  '灰色：AdsPower非确认或不直接可比':'#E7E6E6',
};
const headerFill='#1F4E78', headerFont='#FFFFFF', titleFill='#D9EAF7';

const headers=['统一能力域','AdsPower模块','AdsPower编号','AdsPower功能点','AdsPower控件与规则','AdsPower证据状态','YunLogin模块','YunLogin功能点','YunLogin规则','YunLogin证据状态','差异类型','判定依据','匹配分','用户/业务影响','优先级','补齐建议','AdsPower来源','YunLogin来源'];
const values=comparison.map(r=>[r.module,r.adsSection,r.adsId,r.adsFeature,r.adsDetail,r.adsStatus,r.yunModule,r.yunFeature,r.yunDetail,r.yunStatus,r.diff,r.rationale,r.score,r.impact,r.priority,r.recommendation,r.adsSource,r.yunSource]);
compare.getRange('A1:R1').merge();
compare.getRange('A1').values=[['YunLogin 与 AdsPower 产品功能逐项对比']];
compare.getRange('A1:R1').format={fill:titleFill,font:{bold:true,size:18,color:'#17365D'},horizontalAlignment:'center',verticalAlignment:'center'};
compare.getRange('A2:R2').merge();
compare.getRange('A2').values=[['口径：红=明确缺失；黄=材料待确认；绿=核心一致；蓝=实现/规则不同；灰=仅YunLogin有、不直接可比或AdsPower非确认。']];
compare.getRange('A2:R2').format={fill:'#F7F9FC',font:{italic:true,color:'#44546A'},wrapText:true};
compare.getRange('A3:R3').values=[headers];
compare.getRange('A3:R3').format={fill:headerFill,font:{bold:true,color:headerFont},wrapText:true,horizontalAlignment:'center',verticalAlignment:'center',borders:{preset:'outside',style:'thin',color:'#9EADBA'}};
compare.getRange(`A4:R${values.length+3}`).values=values;
compare.getRange(`A4:R${values.length+3}`).format={wrapText:true,verticalAlignment:'top',font:{size:9},borders:{insideHorizontal:{style:'thin',color:'#E6E9ED'}}};
for (let i=0;i<comparison.length;i++) {
  const row=i+4, fill=colors[comparison[i].diff]||'#FFFFFF';
  compare.getRange(`A${row}:R${row}`).format.fill=fill;
}
compare.freezePanes.freezeRows(3); compare.freezePanes.freezeColumns(3);
compare.getRange('A:R').format.columnWidth=14;
for (const [col,w] of Object.entries({A:16,B:20,C:14,D:22,E:52,F:14,G:22,H:22,I:48,J:14,K:30,L:44,M:9,N:42,O:9,P:52,Q:26,R:26})) compare.getRange(`${col}:${col}`).format.columnWidth=w;
compare.getRange('1:1').format.rowHeight=32; compare.getRange('2:3').format.rowHeight=32;
const compTable=compare.tables.add(`A3:R${values.length+3}`,true,'FeatureComparison');
compTable.style='TableStyleMedium2'; compTable.showBandedRows=false; compTable.showFilterButton=true;

const priorityOrder={P0:0,P1:1,P2:2,'-':3};
const gapRows=comparison.filter(r=>r.diff.startsWith('红色')||r.diff.startsWith('黄色')).sort((a,b)=>(priorityOrder[a.priority]-priorityOrder[b.priority])||a.module.localeCompare(b.module,'zh-CN'));
const gapHeaders=['优先级','统一能力域','AdsPower编号','AdsPower功能点','AdsPower能力说明','YunLogin状态','差异类型','判定依据','业务影响','补齐建议','AdsPower来源','YunLogin来源'];
const gapValues=gapRows.map(r=>[r.priority,r.module,r.adsId,r.adsFeature,r.adsDetail,r.yunStatus,r.diff,r.rationale,r.impact,r.recommendation,r.adsSource,r.yunSource]);
gaps.getRange('A1:L1').merge(); gaps.getRange('A1').values=[['AdsPower 已有而 YunLogin 明确缺失或待确认的功能清单']];
gaps.getRange('A1:L1').format={fill:titleFill,font:{bold:true,size:18,color:'#17365D'},horizontalAlignment:'center'};
gaps.getRange('A2:L2').values=[gapHeaders]; gaps.getRange('A2:L2').format={fill:headerFill,font:{bold:true,color:headerFont},wrapText:true,horizontalAlignment:'center'};
gaps.getRange(`A3:L${gapValues.length+2}`).values=gapValues;
gaps.getRange(`A3:L${gapValues.length+2}`).format={wrapText:true,verticalAlignment:'top',font:{size:9},borders:{insideHorizontal:{style:'thin',color:'#E6E9ED'}}};
for(let i=0;i<gapRows.length;i++) gaps.getRange(`A${i+3}:L${i+3}`).format.fill=colors[gapRows[i].diff];
gaps.freezePanes.freezeRows(2); gaps.freezePanes.freezeColumns(3);
for (const [col,w] of Object.entries({A:10,B:18,C:14,D:23,E:52,F:14,G:30,H:46,I:42,J:56,K:26,L:26})) gaps.getRange(`${col}:${col}`).format.columnWidth=w;
const gapTable=gaps.tables.add(`A2:L${gapValues.length+2}`,true,'GapList'); gapTable.style='TableStyleMedium2'; gapTable.showBandedRows=false;

const diffOrder=['红色：AdsPower有、YunLogin明确没有','黄色：AdsPower有、YunLogin待确认','绿色：双方核心能力一致','蓝色：双方均有但实现不同','灰色：仅YunLogin有或未直接匹配','灰色：AdsPower非确认或不直接可比'];
dash.getRange('A1:H1').merge(); dash.getRange('A1').values=[['YunLogin 与 AdsPower 产品功能对比看板']];
dash.getRange('A1:H1').format={fill:headerFill,font:{bold:true,size:20,color:'#FFFFFF'},horizontalAlignment:'center'};
dash.getRange('A3:B3').values=[['指标','数量']]; dash.getRange('A3:B3').format={fill:headerFill,font:{bold:true,color:'#FFFFFF'}};
const metricRows=[['AdsPower功能项（去重）',adsRows.length],['YunLogin功能项',yunRows.length],['对比总行数',comparison.length],['差距清单行数',gapRows.length]];
dash.getRange('A4:B7').values=metricRows;
dash.getRange('D3:E3').values=[['差异类型','数量']]; dash.getRange('D3:E3').format={fill:headerFill,font:{bold:true,color:'#FFFFFF'}};
dash.getRange('D4:E9').values=diffOrder.map(x=>[x,counts[x]||0]);
for(let i=0;i<diffOrder.length;i++) dash.getRange(`D${i+4}:E${i+4}`).format.fill=colors[diffOrder[i]];
const moduleEntries=Object.entries(moduleGapCounts).sort((a,b)=>b[1]-a[1]);
dash.getRange('A10:B10').values=[['差距集中能力域','红色+黄色数量']]; dash.getRange('A10:B10').format={fill:headerFill,font:{bold:true,color:'#FFFFFF'}};
if(moduleEntries.length) dash.getRange(`A11:B${moduleEntries.length+10}`).values=moduleEntries;
dash.getRange('A3:E30').format={borders:{insideHorizontal:{style:'thin',color:'#E6E9ED'}},wrapText:true};
dash.getRange('A:A').format.columnWidth=28; dash.getRange('B:B').format.columnWidth=14; dash.getRange('D:D').format.columnWidth=40; dash.getRange('E:E').format.columnWidth=14;
dash.getRange('G3:H3').values=[['使用建议','说明']]; dash.getRange('G3:H3').format={fill:headerFill,font:{bold:true,color:'#FFFFFF'}};
dash.getRange('G4:H8').values=[
  ['先看红色','仅表示已有明确证据证明YunLogin没有。'],['再看黄色','表示AdsPower已确认而YunLogin材料未覆盖，需先核实，不能直接立项。'],
  ['筛选P0','优先核实窗口同步、RPA、API/MCP、套餐商业化和环境效率能力。'],['查看蓝色','适合研究差异化策略，不代表YunLogin更弱。'],['查看灰色','避免把竞品建议项或不可比项误当成熟功能。']
];
dash.getRange('G:H').format.columnWidth=34; dash.getRange('G3:H8').format.wrapText=true;

legend.getRange('A1:D1').merge(); legend.getRange('A1').values=[['对比口径、颜色图例与证据规则']]; legend.getRange('A1:D1').format={fill:headerFill,font:{bold:true,size:18,color:'#FFFFFF'},horizontalAlignment:'center'};
legend.getRange('A3:D3').values=[['颜色','判定','使用条件','行动含义']]; legend.getRange('A3:D3').format={fill:headerFill,font:{bold:true,color:'#FFFFFF'}};
const legendRows=[
  ['红色','AdsPower有、YunLogin明确没有','必须有YunLogin明确不支持/不存在的证据','可进入差距评审，但仍需验证用户价值'],
  ['黄色','AdsPower有、YunLogin待确认','AdsPower证据明确；YunLogin无直接证据或仅规则补全','先补材料或实测，禁止直接视为缺失'],
  ['绿色','双方核心能力一致','双方有直接对应功能且关键目的相同','关注体验、稳定性和性能差异'],
  ['蓝色','双方均有但实现不同','双方有对应能力，但渠道、范围、计价或规则不同','评估差异是否形成优势或成本'],
  ['灰色','仅YunLogin有/不直接可比/AdsPower非确认','单边未匹配，或AdsPower仅为建议/核心补充/未提供','不纳入确定竞品缺口']
];
legend.getRange('A4:D8').values=legendRows;
for(let i=0;i<legendRows.length;i++) legend.getRange(`A${i+4}:D${i+4}`).format.fill=Object.values(colors)[i]||'#E7E6E6';
legend.getRange('A10:D10').values=[['证据层级','AdsPower状态','YunLogin状态','处理原则']]; legend.getRange('A10:D10').format={fill:headerFill,font:{bold:true,color:'#FFFFFF'}};
legend.getRange('A11:D15').values=[
  ['A','明确/部分明确','完整/部分','可做直接比较，部分状态需保留不确定性'],
  ['B','核心补充','任意','AdsPower也不是直接事实，标灰'],['C','建议补充/建议方案','任意','仅作为产品建议，标灰'],
  ['D','未提供','任意','只确认入口或名称，不判断竞品优势'],['E','明确','规则补全/待补充/无匹配','标黄并要求核实']
];
legend.getRange('A3:D15').format={wrapText:true,borders:{preset:'all',style:'thin',color:'#D9E1F2'}};
for(const [col,w] of Object.entries({A:18,B:36,C:52,D:52})) legend.getRange(`${col}:${col}`).format.columnWidth=w;

await fs.mkdir(outputDir,{recursive:true});
await fs.writeFile(path.join(outputDir,'comparison-data.json'),JSON.stringify({comparison,gapRows,counts,moduleGapCounts},null,2));
const xlsx=await SpreadsheetFile.exportXlsx(workbook);
const out=path.join(outputDir,'YunLogin与AdsPower产品功能对比表.xlsx');
await xlsx.save(out);

const previewDir=path.join(outputDir,'previews'); await fs.mkdir(previewDir,{recursive:true});
for (const [name,range] of [['统计看板','A1:H26'],['功能对比','A1:R18'],['差距清单','A1:L18'],['口径与图例','A1:D15']]) {
  const blob=await workbook.render({sheetName:name,range,scale:1});
  await fs.writeFile(path.join(previewDir,`${name}.png`),new Uint8Array(await blob.arrayBuffer()));
}

const inspect=await workbook.inspect({kind:'table',range:'统计看板!A1:H26',include:'values,formulas',tableMaxRows:30,tableMaxCols:8,maxChars:12000});
const errors=await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',options:{useRegex:true,maxResults:100},summary:'formula error scan'});
console.log(JSON.stringify({adsRows:adsRows.length,yunRows:yunRows.length,comparisonRows:comparison.length,gapRows:gapRows.length,counts,moduleGapCounts,output:out,inspect:inspect.ndjson,errorScan:errors.ndjson},null,2));
