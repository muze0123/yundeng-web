import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const baseDir = process.cwd();
const outputDir = path.join(baseDir, 'outputs', '019ff91a-00b9-79b3-a937-14cf1ab77e9f');
const previewDir = path.join(baseDir, 'previews');
const outFile = path.join(outputDir, 'YunLogin与AdsPower竞品对比矩阵.xlsx');

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const colors = {
  navy: '#17324D',
  blue: '#2F5D7E',
  teal: '#2A7F78',
  gold: '#C28B2C',
  red: '#B85450',
  ink: '#25313C',
  muted: '#5E6B75',
  line: '#D7DEE5',
  light: '#F4F7F9',
  white: '#FFFFFF',
  core: '#DCEFEA',
  yun: '#DDEAF4',
  ads: '#FBEBCB',
  path: '#E8E2F2',
  unknown: '#ECEFF1',
  explicit: '#F3D6D4',
};

const stateFill = {
  '核心同构': colors.core,
  'YunLogin特色': colors.yun,
  'AdsPower证据更强': colors.ads,
  '路径差异': colors.path,
  '待核实': colors.unknown,
  '明确缺失': colors.explicit,
};

const stateCounts = {};

const matrix = [
  ['C-001','身份与访问','登录方式','进入产品并选择团队','已确认','账号密码、短信/邮件验证码、微信/钉钉扫码、团队选择','已确认','账号体系、团队访问、2FA 与安全策略','路径差异','YunLogin 对登录入口证据更细；AdsPower 对企业安全策略证据更强','A/A','高','YunLogin产品功能清单.md｜AdsPower产品功能清单.md'],
  ['C-002','身份与访问','设备会话','识别并退出异常设备','已确认','设备列表、验证码确认远程退出','部分确认','多设备与安全设置存在，完整会话规则未同口径覆盖','YunLogin特色','YunLogin 当前对远程退出闭环证据更完整','A/A','中','YunLogin产品功能清单.md｜AdsPower产品功能清单.md'],
  ['C-003','环境创建','单个创建','快速配置一个隔离环境','已确认','单个创建、平台账号、代理、内核、OS/UA、Cookie、插件和偏好','已确认','新建环境、账号、代理、指纹、Cookie、应用','核心同构','双方核心闭环一致','A/A','高','双方产品功能清单'],
  ['C-004','环境创建','批量创建','批量生成环境','已确认','批量创建与字段配置','已确认','批量新建与导入','核心同构','需以同规模任务比较耗时、报错与回滚','A/A','高','双方产品功能清单'],
  ['C-005','环境创建','文件导入','导入存量环境数据','已确认','XLS/XLSX/CSV，≤10MB，单次≤300条','已确认','支持导入，约束口径与 YunLogin 不同','路径差异','YunLogin 对格式与上限证据更细','A/A','高','双方产品功能清单'],
  ['C-006','环境创建','一键迁移','迁移指纹与 Cookie','已确认','迁移链接 24 小时有效，可迁移指纹与 Cookie','套餐权益确认','数据迁移仅套餐权益显示；具体对象、记录和执行闭环未核验','路径差异','YunLogin 对迁移链接和对象规则证据更完整；AdsPower 迁移闭环待核实','A/B','中','双方产品功能与价格清单'],
  ['C-007','指纹浏览器','内核','匹配目标站点与浏览器生态','已确认','浏览器内核与版本选择','已确认','SunBrowser（Chromium）与 FlowerBrowser（Firefox）','路径差异','AdsPower 双内核公开证据更突出','A/A','高','双方产品功能清单'],
  ['C-008','指纹浏览器','地域一致性','让时区、语言、位置匹配代理','已确认','真实/随机/自定义/匹配IP等策略','已确认','时区、语言、位置与代理配置','核心同构','不可只按字段数判断质量','A/A','高','双方产品功能清单'],
  ['C-009','指纹浏览器','图形指纹','隔离 Canvas/WebGL 等特征','已确认','Canvas、WebGL、ClientRects 等','已确认','Canvas、WebGL、WebGPU 等','核心同构','实际反检测效果需要同场景实测','A/A','高','双方产品功能清单'],
  ['C-010','指纹浏览器','媒体与硬件','隔离音频、媒体和硬件参数','已确认','Audio、媒体设备、CPU、内存、设备名、MAC 等','已确认','音频、媒体与硬件参数','核心同构','参数存在不等于稳定性或账号结果更好','A/A','高','双方产品功能清单'],
  ['C-011','环境运营','搜索筛选','快速定位大量环境','已确认','搜索、保存搜索、组合筛选、自定义列、分页','已确认','分组、标签、筛选与批量管理','核心同构','YunLogin 保存搜索和列配置证据更细','A/A','高','双方产品功能清单'],
  ['C-012','环境运营','启动与关闭','运行与结束隔离环境','已确认并实测','启动、切换、关闭状态闭环已实测','已确认','环境启动、关闭与批量操作','核心同构','执行稳定性需同设备同任务测试','A/A','高','YunLogin用户旅程｜双方功能清单'],
  ['C-013','环境运营','环境整理','克隆、标签、置顶、分组和批量修改','已确认','克隆、星标、标签、置顶、分组、批量修改','已确认','分组、标签和批量操作','核心同构','功能存在，效率差异待任务实测','A/A','高','双方产品功能清单'],
  ['C-014','环境运营','缓存与跨设备','保留登录态并跨设备工作','已确认','本地/云端缓存管理','已确认','跨设备数据同步','路径差异','同步对象、冲突与加密边界需同口径核验','A/A','中','双方产品功能清单'],
  ['C-015','代理管理','代理来源','接入平台、自有或动态资源','已确认','平台代理、自有代理、代理 API 三源','已确认','集成代理、静态数据中心、静态 ISP、动态住宅','路径差异','YunLogin 管理入口集中；AdsPower 商品形态更多','A/A','高','双方产品功能与价格清单'],
  ['C-016','代理管理','批量导入与检测','批量维护自有代理','已确认','HTTP/HTTPS/SOCKS5，IPv4/IPv6/域名，最多500行，检测去重','已确认','导入、检测、购买、续期与多供应商','核心同构','YunLogin 对导入约束证据更细','A/A','高','双方产品功能清单'],
  ['C-017','代理管理','授权与分配','把代理分给正确成员和环境','已确认','环境分配、授权与不同角色数据范围','已确认','代理与环境配置、团队可用范围','核心同构','数据范围细节不同，需按角色验证','A/A','中','双方产品功能清单'],
  ['C-018','代理管理','代理交易','购买、支付、续期并交付资源','已确认','商城、购物车、云币、优惠券、订单、自动续费','已确认','静态/动态代理商品、订单与续期','路径差异','YunLogin 集中交易闭环证据更完整；AdsPower 资源形态更多','A/A','高','双方价格清单'],
  ['C-019','账号资产','独立账号库','统一保存平台凭据并绑定环境','已确认','平台、名称、账号、密码、备注、2FA、凭据锁定、批量导入','部分确认','账号信息与环境管理存在，独立资产库深度未同口径覆盖','YunLogin特色','YunLogin 当前独立账号对象证据更完整','A/A','中','双方产品功能清单'],
  ['C-020','团队治理','组织结构','按部门组织成员与资产','已确认','部门树、子部门、成员转移','已确认','成员组、环境组和团队信息','路径差异','YunLogin 更强调组织层级；AdsPower 更强调分组授权','A/A','高','双方产品功能清单'],
  ['C-021','团队治理','角色权限','按职责限制操作','已确认','系统/自定义角色、环境/代理/模块操作级权限','已确认','成员组、功能权限与环境组授权','核心同构','最小权限深度需角色任务验证','A/A','高','双方产品功能清单'],
  ['C-022','团队治理','数据范围','限制可见环境与代理','已确认','创始人、部门管理员、普通成员范围不同','已确认','环境分组授权与团队权限','路径差异','YunLogin 对组织角色数据范围证据更细','A/A','中','双方产品功能清单'],
  ['C-023','团队治理','成员审批','控制加入与登录申请','已确认','邀请、加入申请审批、登录申请审批','部分确认','成员与安全流程存在，审批状态机未同口径覆盖','YunLogin特色','YunLogin 当前审批入口证据更完整','A/A','中','双方产品功能清单'],
  ['C-024','分享转移','环境分享','向其他团队临时共享环境','已确认','多团队ID、缓存、有效天数、备注、附件、记录与取消','已确认','默认包含平台、账号密码、2FA、Cookies、指纹和IP等；另有可选附加信息；可撤回/不可撤回模式已确认','路径差异','YunLogin 分享字段完整；AdsPower 的敏感信息二次提示和撤回后数据处置待核实','A/A','高','双方产品功能清单'],
  ['C-025','分享转移','跨团队转移','变更环境或代理所有权','已确认','环境与平台代理跨团队转移记录','套餐权益确认','Trial称无限分享，商业版显示数据迁移；具体对象、记录与执行规则未核验','路径差异','YunLogin 当前资产转移证据更完整；AdsPower 需区分分享权益和迁移闭环','A/B','中','双方产品功能与价格清单'],
  ['C-026','插件应用','市场与安装','扩展浏览器能力','已确认','市场、搜索、详情、安装，Chrome/Firefox筛选，多来源','已确认','应用中心与 Chrome 生态','核心同构','应用数量、审核和兼容性未同口径测试','A/A','高','双方产品功能清单'],
  ['C-027','插件应用','团队治理','控制插件可见和使用范围','已确认','全局启停、团队可见范围、环境分配','明确有限制','团队应用存在，但强制安装、禁止关闭、版本锁定暂不支持','路径差异','YunLogin 当前治理入口更完整；两边实际强制策略仍需验证','A/A','高','双方产品功能清单'],
  ['C-028','自动化','窗口同步','把一个窗口动作复制到多个窗口','入口/权限线索','具体点击、输入、滚动和标签同步未核实','已确认','35项控制证据；仅支持 SunBrowser','AdsPower证据更强','AdsPower 能力更明确但存在内核限制；YunLogin 不得按参考模型记为已实现','D/A','高','双方产品功能清单'],
  ['C-029','自动化','RPA 模板','复用自动化流程','已确认','模板、模板市场、环境分配；页面显示23个模板','已确认','流程、任务、运行记录和模板商店','核心同构','模板供给规模与成功率需实测','A/A','高','双方产品功能清单'],
  ['C-030','自动化','RPA 流程设计','可视化编排任务','已确认','页面/标签/点击/输入/滚动等已见节点、JSON导入导出','部分确认','流程画布明确；24类节点和失败策略多属补充项','路径差异','YunLogin 已见节点证据更细；双方失败恢复均不完整','A/A','高','双方产品功能清单'],
  ['C-031','自动化','RPA 调度','计划、并发和执行任务','已确认','普通/优先/计划任务、线程、本地执行、任务日志','部分确认','任务调度与记录存在，完整状态机和重试多属补充项','路径差异','双方都有调度入口，可靠性和异常闭环待实测','A/A','高','双方产品功能清单'],
  ['C-032','开发者','本地 API','程序化启动和管理环境','已确认','localhost:50213，POST+JSON，每接口每秒最多1次，部分接口/错误码','已确认','环境管理、启动和框架兼容有证据','核心同构','YunLogin 对示例限流证据更细；完整鉴权和版本策略均需补证','A/A','高','双方产品功能清单'],
  ['C-033','开发者','自动化框架','连接 Selenium/Puppeteer/Playwright','已确认','Selenium、Puppeteer','官方自述','Selenium、Puppeteer、Playwright','AdsPower证据更强','Playwright 仅 AdsPower 官方材料确认；执行效果未独立验证','A/B','中','双方产品背景与功能清单'],
  ['C-034','开发者','MCP 接入','连接 AI/工具调用平台','未确认','当前材料未确认 MCP','部分确认','确认 API&MCP 入口；工具清单、连接成功和执行结果未完整核验','AdsPower证据更强','AdsPower 是入口证据领先，不等于完整可用性已验证','D/A','高','双方产品功能清单'],
  ['C-035','审计安全','操作审计','追踪登录、操作与权限变化','已确认','登录、操作、权限三类日志','已确认','分类操作日志','路径差异','YunLogin 日志分类证据更完整；保留期和导出规则需核实','A/A','高','双方产品功能清单'],
  ['C-036','审计安全','访问安全','阻止异常登录和高风险操作','已确认','高风险提醒、凭据锁定、代理可见范围、设备退出','已确认','异常邮件、失败登录、IP白名单、2FA、高风险操作','路径差异','YunLogin 偏资产追溯；AdsPower 偏访问策略','A/A','高','双方产品功能清单'],
  ['C-037','审计安全','安全认证/鉴证','满足企业采购信任要求','当前材料未确认','未见同等级公开材料','官方展示','SOC 2 Type II鉴证报告、ISO 27001/27701认证；范围未独立核验','AdsPower证据更强','只能作为信任信号，需核验主体、范围和有效期','D/B','高','AdsPower产品分析报告'],
  ['C-038','回收恢复','软删除与恢复','恢复误删资产','已确认','环境、账号、三类代理、RPA模板；30天恢复或永久删除','已确认','回收站和环境恢复','YunLogin特色','YunLogin 对对象范围和30天规则证据更完整','A/A','高','双方产品功能清单'],
  ['C-039','回收恢复','备份快照','恢复环境历史状态','当前材料未确认','未见环境快照事实','部分确认','创建快照有页面证据；自动快照、选择性恢复和配额多为建议项','AdsPower证据更强','只确认基础创建快照，不能把完整快照治理当上线事实','D/A','高','AdsPower产品功能清单'],
  ['C-040','商业化','免费入口','低成本试用核心价值','当前材料未确认','价格材料未确认独立免费套餐','已确认','2个免费环境、1名超级管理员，$0','AdsPower证据更强','材料未覆盖不等于 YunLogin 没有','D/A','高','双方价格清单'],
  ['C-041','商业化','Trial','付费前体验高级能力','当前材料未确认','价格材料未确认独立 Trial','已确认','12环境、2成员，$14/月，并见1天试用说明','AdsPower证据更强','YunLogin 是否有等价入口待商务/产品核实','D/A','高','双方价格清单'],
  ['C-042','商业化','标准订阅','按环境规模付费','已确认','10～5000快捷档位并支持连续步进','已确认','专业10～100、商业200～5000，累进阶梯','路径差异','双方分层和价格函数不同','A/A','高','双方价格清单'],
  ['C-043','商业化','企业方案','大规模采购、服务和定制','当前材料未确认','未确认企业档、询价或服务边界；不能写明确没有','已确认','5000以上企业版、询价、专属服务和部分定制','AdsPower证据更强','YunLogin 属待核实，不是明确缺失','D/A','高','双方价格清单'],
  ['C-044','商业化','成员增购','随团队扩张购买席位','已确认','¥19/人，最终受周期和折扣影响','已确认','$5/人/月，长期周期随折扣','路径差异','需按同周期、免费管理员和权限权益比较','A/A','高','双方价格清单'],
  ['C-045','商业化','终身环境','一次性买断环境权益','当前材料未确认','价格材料未覆盖','已确认','$15/环境，永久，存在数量与退款规则','AdsPower证据更强','材料未覆盖不等于 YunLogin 没有','D/A','高','双方价格清单'],
  ['C-046','商业化','钱包与支付','完成本地或跨境结算','已确认','1元=1云币，支付宝、微信、云币、CDKEY','已确认','USD/BRL/PLN/VND，多地区支付渠道','路径差异','YunLogin 更适合人民币结算；AdsPower 全球支付覆盖更广','A/A','高','双方价格清单'],
  ['C-047','商业化','购物车与优惠','合并购买多种资源','已确认','多商品、子订单、优惠券、调整周期/数量、清空失效项','当前材料未同口径确认','价格材料未确认独立多商品购物车','YunLogin特色','YunLogin 当前集中结算证据更完整','A/D','高','双方价格清单'],
  ['C-048','商业化','自动续费','保持环境和代理连续可用','已确认','套餐和代理续费，云币扣款','已确认','套餐与代理续期','核心同构','失败重试、价格变化和取消生效点均需补证','A/A','高','双方价格清单'],
  ['C-049','服务生态','客服与帮助','解决配置、故障和采购问题','已确认','客户经理、7×24客服、帮助中心、资源看板','已确认','帮助中心、企业服务、内容和伙伴体系','路径差异','服务质量、响应时间和 SLA 均无独立验证','A/A','中','双方产品架构与背景'],
  ['C-050','服务生态','合作与推荐','通过伙伴和推荐计划获客','当前材料未确认','当前材料以客户经理和服务入口为主','已确认机制','伙伴中心、推荐计划、内容/场景页和多语言入口','AdsPower证据更强','只能证明增长机制，不证明渠道效果或低 CAC','D/A','高','AdsPower公司背景报告'],
  ['C-051','公司主体','运营与知识产权','确认合同、数据和责任主体','当前材料待专项核验','本报告未做 YunLogin 主体专项尽调','官方资料记录','SUNFLOWER TECH PTE. LTD.开发运营并持有知识产权；广州标品为中国大陆授权代理/销售','待核实','双方主体不可用品牌关联代替法律关系尽调','D/B','高','广州标品软件有限公司背景分析报告'],
  ['C-052','合规边界','产品合规声明','明确产品与第三方资源责任','已确认','电商营销工具；不提供翻墙服务；代理由第三方供应商提供','已确认','目标场景与条款存在，具体场景仍须遵守平台及当地法律','路径差异','两者均不能替用户行为背书','A/B','高','YunLogin页面文案｜AdsPower条款/背景'],
];

for (const row of matrix) stateCounts[row[8]] = (stateCounts[row[8]] || 0) + 1;

const commercial = [
  ['获客','免费版','当前材料未确认独立免费套餐','2环境、1名超级管理员，$0','AdsPower 已确认；YunLogin 待核实','2026-08-12 / 2026-08-11'],
  ['获客','Trial','当前材料未确认','12环境、2成员，$14/月；另见1天试用说明','口径需区分套餐与试用时长','2026-08-12 / 2026-08-11'],
  ['订阅','10环境/30天','¥16.15，页面8.5折样本','$9环境商品价/月；成员与手续费另计','原币种展示，不换汇','2026-08-12 / 2026-08-11'],
  ['订阅','200环境/30天','¥256.79，页面8.5折样本','$61环境商品价/月；成员另计','AdsPower 累进阶梯','2026-08-12 / 2026-08-11'],
  ['订阅','5000环境/30天','¥1,288.60，页面8.5折样本','官网：5000以上企业档询价；客户端：环境$597+4名成员$20=$617/月','官网与客户端口径不同，且币种不同，不可直接排序','2026-08-12 / 2026-08-11'],
  ['订阅','10环境/360天','¥114/整个周期，页面5折样本','官网年付8折；订单总额按配置','活动与长期标准价需区分','2026-08-12 / 2026-08-11'],
  ['团队','新增成员','¥19/人；周期/折扣影响最终额','$5/人/月；随周期折扣','免费管理员与角色权益待同口径','2026-08-12 / 2026-08-11'],
  ['企业','企业档/询价','当前材料未确认','5000以上企业版、环境与成员询价','YunLogin 不是明确缺失','2026-08-12 / 2026-08-11'],
  ['买断','终身环境','当前材料未确认','$15/环境；永久；有数量与退款规则','AdsPower 已确认','2026-08-12 / 2026-08-11'],
  ['代理','静态资源','家庭住宅/云平台静态；同地区资源卡价格不同','静态数据中心/静态ISP，按地区定价','必须控制资源质量和SLA','2026-08-12 / 2026-08-11'],
  ['代理','动态住宅流量','当前价格材料未覆盖','1GB～100GB流量包；>1000GB定制','YunLogin 待核实','2026-08-12 / 2026-08-11'],
  ['自动化','付费RPA模板','模板市场已确认，付费规则未确认','已确认Facebook自动群发私信$6样本','只能确认单个样本','2026-08-12 / 2026-08-11'],
  ['钱包','币种','人民币云币，1元=1云币','USD、BRL、PLN、VND','目标市场不同','2026-08-12 / 2026-08-11'],
  ['支付','渠道','支付宝、微信、云币；其他方式咨询客服','支付宝、微信、Card、PayPal、PIX、VietQR、momo等','实际可用性因地区而异','2026-08-12 / 2026-08-11'],
  ['支付','手续费','当前订单样本未显示同类固定公式','常见样本：订单×2%+$1；优惠以支付页为准','不可泛化到所有订单','2026-08-12 / 2026-08-11'],
  ['优惠','周期折扣','30/90/180/360天：8.5/8/7.5/5折当前页面','月付/季付/半年/年付：无/9/8.5/8折样本','均为时点性页面事实','2026-08-12 / 2026-08-11'],
  ['售后','退款边界','代理不能退换；套餐减配不退费；其他待核实','终身环境不退款；其他规则不完整','不能声称完整售后政策','2026-08-12 / 2026-08-11'],
  ['续费','自动续费','套餐与代理；云币余额扣款','套餐与代理续期','失败重试与价格变化待核实','2026-08-12 / 2026-08-11'],
];

const sales = [
  ['国内人民币统一采购','YunLogin','云币、支付宝/微信、套餐与代理购物车、优惠券和订单闭环','价格页、商城、费用和订单证据','不承诺活动长期有效或代理可退款'],
  ['复杂组织与资产交接','YunLogin','部门树、自定义角色、操作级权限、数据范围、分享转移与回收','团队、日志、分享转移、回收流程','不把未实测状态机说成完整SLA'],
  ['平台代理与自有代理混用','YunLogin','平台、自有、API三源统一管理、检测与环境分配','代理管理与绑定流程','不承诺供应商质量等同'],
  ['迁移存量环境','YunLogin','文件导入、一键迁移、24小时链接、指纹/Cookie迁移','新建环境和迁移规则','接收权限与到期缓存规则待核实'],
  ['窗口批量同步','AdsPower','同步器细分动作证据完整','同步器功能清单','仅支持SunBrowser；YunLogin等价能力未核实'],
  ['开发者接入MCP/Playwright','AdsPower','Local API、MCP入口与Playwright官方自述','API&MCP入口与官方资料','MCP工具/结果未完整核验；Playwright未独立实测'],
  ['全球团队本地支付','AdsPower','多币种和多地区支付渠道','价格与支付页面证据','实际可用性因地区而异'],
  ['免费到企业渐进扩容','AdsPower','免费、Trial、专业/商业/企业和终身环境','价格页与套餐规则','YunLogin属于待核实，不是明确没有'],
  ['企业认证材料','AdsPower','SOC 2 Type II鉴证报告、ISO 27001/27701认证的官网展示','官网安全材料记录','必须核验主体、范围、有效期'],
  ['偏好人民币小额付费和年付折扣','条件性偏向YunLogin','人民币定价、云币结算和长期周期折扣样本','带日期价格快照','跨币种成本需按可编辑汇率、成员、手续费和权益测算'],
];

const sources = [
  ['S-001','YunLogin产品架构.md','本地产品分析','2026-08-12','产品/业务架构、核心对象与边界','A/C','已核读；图中的窗口同步不作为已实现事实'],
  ['S-002','YunLogin产品结构.md','本地产品分析','2026-08-12','功能结构、信息结构、数据对象','A','已核读'],
  ['S-003','YunLogin产品功能清单.md','本地产品分析','V4.0.2.4','263项功能及状态','A/D','已核读；规则补全不作产品事实'],
  ['S-004','YunLogin产品价格清单.md','价格快照','2026-08-12','套餐、成员、代理、云币与订单','A','动态价格，对外前复核'],
  ['S-005','云登指纹浏览器用户旅程图.md','实际旅程记录','V1.0','角色、任务、已实测与未提交流程','A','已核读'],
  ['S-006','Adspower产品架构.md','本地产品分析','2026-08-11','产品能力分析模型','A/C','快照和部分API/MCP细节含推导'],
  ['S-007','Adspower产品结构.md','本地产品分析','2026-08-11','结构与对象关系','A/C','需结合功能状态解释'],
  ['S-008','Adspower产品功能清单.md','本地产品分析','8.7.23 / 2.8.7.7','783个功能/控件项记录','A/D','99个补充/建议项不是上线事实'],
  ['S-009','Adspower产品价格清单.md','价格快照','2026-08-11','套餐、成员、代理、支付与手续费','A','动态价格，对外前复核'],
  ['S-010','Adspowe产品分析报告.md','分析报告','2026-08-11','定位、体验、安全与策略分析','B/C/D','分析结论不能当产品事实'],
  ['S-011','Adspower商业需求文档BRD.md','分析型BRD','2026-08-11','商业机制与建议','B/C/D','混合机制、营销自述和建议'],
  ['S-012','广州标品软件有限公司背景分析报告.md','公司与来源审计','2026-08-11','主体、增长、生态和安全边界','B/C/D','部分动态网页本轮未回读'],
  ['S-013','https://www.adspower.net/','官方官网','本地来源记录','官方定位与入口','B','本轮外部页面未稳定回读'],
  ['S-014','https://www.adspower.net/pricing','官方价格页','本地来源记录','套餐与计价','B','动态页面，对外前复核'],
  ['S-015','https://www.adspower.net/synchronizer','官方功能页','本地来源记录','窗口同步','B','本轮外部页面未稳定回读'],
  ['S-016','https://www.adspower.net/rpa','官方功能页','本地来源记录','RPA','B','本轮外部页面未稳定回读'],
  ['S-017','https://www.adspower.net/local-api','官方功能页','本地来源记录','Local API','B','本轮外部页面未稳定回读'],
  ['S-018','https://www.adspower.net/account-security','官方功能页','本地来源记录','安全与认证展示','B','证书/报告范围未独立核验'],
  ['S-019','https://www.woshipm.com/evaluating/5395642.html 等4篇','用户指定参考文章','2026-08-13','章节结构参考','D','外部服务异常，未引用具体内容'],
];

const workbook = Workbook.create();
const summary = workbook.worksheets.add('管理层摘要');
const compare = workbook.worksheets.add('能力对比矩阵');
const business = workbook.worksheets.add('商业模式与价格');
const battle = workbook.worksheets.add('销售竞争支持');
const evidence = workbook.worksheets.add('证据与来源');
const legend = workbook.worksheets.add('口径与图例');
const architecture = workbook.worksheets.add('架构对比');

for (const sheet of [summary, compare, business, battle, evidence, legend, architecture]) {
  sheet.showGridLines = false;
}

function title(sheet, range, value, subtitle = '') {
  sheet.getRange(range).merge();
  const cell = range.split(':')[0];
  sheet.getRange(cell).values = [[value]];
  sheet.getRange(range).format = {
    fill: colors.navy,
    font: { bold: true, color: colors.white, size: 18 },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
  };
  sheet.getRange(range).format.rowHeight = 34;
  if (subtitle) {
    const row = Number(cell.match(/\d+/)[0]) + 1;
    const startCol = cell.match(/[A-Z]+/)[0];
    const endCol = range.split(':')[1].match(/[A-Z]+/)[0];
    sheet.getRange(`${startCol}${row}:${endCol}${row}`).merge();
    sheet.getRange(`${startCol}${row}`).values = [[subtitle]];
    sheet.getRange(`${startCol}${row}:${endCol}${row}`).format = {
      fill: colors.light,
      font: { color: colors.muted, italic: true, size: 10 },
      wrapText: true,
      verticalAlignment: 'center',
    };
    sheet.getRange(`${startCol}${row}:${endCol}${row}`).format.rowHeight = 32;
  }
}

function header(range) {
  range.format = {
    fill: colors.blue,
    font: { bold: true, color: colors.white, size: 10 },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'all', style: 'thin', color: '#B7C3CC' },
  };
  range.format.rowHeight = 30;
}

function body(range) {
  range.format = {
    font: { color: colors.ink, size: 9 },
    verticalAlignment: 'top',
    wrapText: true,
    borders: { preset: 'all', style: 'thin', color: colors.line },
  };
}

title(summary, 'A1:N1', 'YunLogin 与 AdsPower 竞品分析｜管理层摘要', '证据快照：YunLogin 2026-08-12；AdsPower 2026-08-11。统计为52项统一能力，不是原始按钮/字段数量。');
summary.getRange('A4:N4').merge();
summary.getRange('A4').values = [['结论：双方核心架构同构；YunLogin 当前强在环境资产、组织流转和人民币交易闭环，AdsPower 当前强在自动化入口梯度、全球商业化与公开信任材料。']];
summary.getRange('A4:N4').format = { fill: '#EAF1F6', font: { bold: true, color: colors.navy, size: 12 }, wrapText: true, verticalAlignment: 'center' };
summary.getRange('A4:N4').format.rowHeight = 42;

summary.getRange('A6:B6').values = [['指标','数量']];
header(summary.getRange('A6:B6'));
const states = ['核心同构','YunLogin特色','AdsPower证据更强','路径差异','待核实','明确缺失'];
for (let i = 0; i < states.length; i++) {
  const row = 7 + i;
  summary.getRange(`A${row}`).values = [[states[i]]];
  summary.getRange(`B${row}`).values = [[stateCounts[states[i]] || 0]];
  summary.getRange(`A${row}:B${row}`).format.fill = stateFill[states[i]];
}
body(summary.getRange('A7:B12'));
summary.getRange('A13').values = [['能力总数']];
summary.getRange('B13').formulas = [['=SUM(B7:B12)']];
summary.getRange('A13:B13').format = { fill: colors.navy, font: { bold: true, color: colors.white }, borders: { preset: 'all', style: 'thin', color: colors.line } };

summary.getRange('D6:G6').merge();
summary.getRange('D6').values = [['管理层应分别看四条竞争线，不汇总成单一优劣分数']];
summary.getRange('D6:G6').format = { fill: colors.teal, font: { bold: true, color: colors.white, size: 11 }, horizontalAlignment: 'center' };
summary.getRange('D7:G11').values = [
  ['竞争线','YunLogin 当前基础','AdsPower 当前基础','稳妥结论'],
  ['核心产品能力','环境、账号、三类代理、指纹、插件、RPA/API','环境、双内核、代理、应用、同步器/RPA/API','核心同构，需任务实测'],
  ['组织与安全','部门/角色/数据范围/分享转移/三类日志','成员组/环境授权/IP白名单/2FA/安全展示','治理入口不同'],
  ['自动化与开发者','RPA、本地API、插件；窗口同步仅线索','窗口同步、RPA、Local API、MCP入口','AdsPower 入口证据更清晰，效果未证实'],
  ['获客与商业化','人民币套餐、代理商城、云币、购物车','免费/Trial/企业/买断、多币种、伙伴','YunLogin更集中；AdsPower更分层'],
];
header(summary.getRange('D7:G7'));
body(summary.getRange('D8:G11'));
summary.getRange('D7:G11').format.wrapText = true;

summary.getRange('D13:G13').values = [['读表规则','事实边界','价格边界','禁止结论']];
header(summary.getRange('D13:G13'));
summary.getRange('D14:G16').values = [
  ['材料未覆盖','写“待核实”，不写“没有”','价格均标日期与原币种','不按759/263判断强弱'],
  ['官方自述','写“官方称/展示”','代理先控制质量与SLA','不把认证展示写成绝对安全'],
  ['分析判断','显式标注推断','不把活动价当长期价','不输出功能优先级/路线图'],
];
body(summary.getRange('D14:G16'));

summary.getRange('J13:N13').merge();
summary.getRange('J13').values = [['关键风险与待核实项']];
summary.getRange('J13:N13').format = { fill: colors.gold, font: { bold: true, color: colors.white }, horizontalAlignment: 'center' };
summary.getRange('J14:N18').merge(true);
summary.getRange('J14:J18').values = [
  ['1. YunLogin 窗口同步、MCP、企业档、国际支付：当前材料未确认。'],
  ['2. AdsPower MCP 工具/执行结果、快照治理、RPA失败策略：未完整核验。'],
  ['3. SOC 2 Type II 为鉴证报告展示，ISO范围和有效期需独立核验。'],
  ['4. 双方指纹效果、账号存活率、任务成功率和代理质量无同场景数据。'],
  ['5. 公司规模、收入、付费率、续费率、毛利和市场份额均不能由产品材料推出。'],
];
body(summary.getRange('J14:N18'));

summary.getRange('A16:B16').values = [['用途','说明']];
header(summary.getRange('A16:B16'));
summary.getRange('A17:B20').values = [
  ['产品规划','用于理解竞争结构和验证问题，不含功能优先级/路线图'],
  ['管理层','用于分线判断能力、治理、自动化和商业化'],
  ['销售','使用“销售竞争支持”页的证据化话术'],
  ['融资/研究','未知经营数据保持空白，不用营销口径代填'],
];
body(summary.getRange('A17:B20'));

summary.getRange('A:A').format.columnWidth = 22;
summary.getRange('B:B').format.columnWidth = 12;
for (const col of ['D','E','F','G']) summary.getRange(`${col}:${col}`).format.columnWidth = 23;
for (const col of ['J','K','L','M','N']) summary.getRange(`${col}:${col}`).format.columnWidth = 16;
summary.freezePanes.freezeRows(2);

const chart = summary.charts.add('bar', summary.getRange('A6:B12'));
chart.title = '52项统一能力的证据化分布';
chart.hasLegend = false;
chart.setPosition('I6', 'N12');
chart.xAxis = { axisType: 'textAxis', textStyle: { fontSize: 9 } };
chart.yAxis = { numberFormatCode: '0', min: 0 };

title(compare, 'A1:M1', '能力对比矩阵', '以用户能力为统一单位；“AdsPower证据更强”不等于YunLogin明确缺失。可按能力域、状态、证据等级和置信度筛选。');
const matrixHeaders = ['编号','能力域','能力项','用户任务','YunLogin状态','YunLogin证据','AdsPower状态','AdsPower证据','对比状态','证据化结论','证据等级(Y/A)','置信度','来源'];
compare.getRange('A3:M3').values = [matrixHeaders];
header(compare.getRange('A3:M3'));
compare.getRange(`A4:M${matrix.length + 3}`).values = matrix;
body(compare.getRange(`A4:M${matrix.length + 3}`));
for (let i = 0; i < matrix.length; i++) {
  compare.getRange(`A${i + 4}:M${i + 4}`).format.fill = stateFill[matrix[i][8]] || colors.white;
}
const compareTable = compare.tables.add(`A3:M${matrix.length + 3}`, true, 'CapabilityMatrix');
compareTable.style = 'TableStyleMedium2';
compareTable.showBandedRows = false;
compareTable.showFilterButton = true;
compare.freezePanes.freezeRows(3);
compare.freezePanes.freezeColumns(3);
for (const [col, width] of Object.entries({A:10,B:16,C:18,D:26,E:14,F:44,G:14,H:44,I:20,J:48,K:14,L:10,M:38})) compare.getRange(`${col}:${col}`).format.columnWidth = width;

title(business, 'A1:F1', '商业模式与价格', '仅展示2026-08-11/12页面快照与原币种。汇率、活动、成员、手续费、功能权益和资源质量会改变真实TCO。');
business.getRange('A3:F3').values = [['类别','场景','YunLogin','AdsPower','比较边界','核验日期']];
header(business.getRange('A3:F3'));
business.getRange(`A4:F${commercial.length + 3}`).values = commercial;
body(business.getRange(`A4:F${commercial.length + 3}`));
const businessTable = business.tables.add(`A3:F${commercial.length + 3}`, true, 'CommercialMatrix');
businessTable.style = 'TableStyleMedium4';
businessTable.showFilterButton = true;
business.freezePanes.freezeRows(3);
for (const [col, width] of Object.entries({A:12,B:20,C:38,D:42,E:38,F:24})) business.getRange(`${col}:${col}`).format.columnWidth = width;
business.getRange('A24:F24').merge();
business.getRange('A24').values = [['TCO口径：订阅 + 成员 + 资源 + 支付/汇兑 + 实施迁移 + 自动化维护 + 故障与人工恢复 - 可确认优惠']];
business.getRange('A24:F24').format = { fill: '#EAF1F6', font: { bold: true, color: colors.navy }, wrapText: true };

title(battle, 'A1:E1', '销售竞争支持', '只使用可出示证据的话术；一侧材料未覆盖时，回答“待核实”，不回答“没有”。');
battle.getRange('A3:E3').values = [['客户情境','当前更有说服力','可主张价值/竞品证据','必须出示的证据','边界或禁止承诺']];
header(battle.getRange('A3:E3'));
battle.getRange(`A4:E${sales.length + 3}`).values = sales;
body(battle.getRange(`A4:E${sales.length + 3}`));
for (let i = 0; i < sales.length; i++) {
  const owner = sales[i][1];
  battle.getRange(`A${i + 4}:E${i + 4}`).format.fill = owner === 'YunLogin' ? colors.yun : owner === 'AdsPower' ? colors.ads : colors.unknown;
}
const salesTable = battle.tables.add(`A3:E${sales.length + 3}`, true, 'SalesSupport');
salesTable.style = 'TableStyleMedium9';
salesTable.showBandedRows = false;
battle.freezePanes.freezeRows(3);
for (const [col, width] of Object.entries({A:26,B:20,C:46,D:36,E:44})) battle.getRange(`${col}:${col}`).format.columnWidth = width;

title(evidence, 'A1:G1', '证据与来源', '动态网页本轮未能稳定回读。对外使用前须重新核验价格、版本、公开规模、认证与条款。');
evidence.getRange('A3:G3').values = [['编号','来源','类型','日期/版本','支持内容','证据等级','限制/复核状态']];
header(evidence.getRange('A3:G3'));
evidence.getRange(`A4:G${sources.length + 3}`).values = sources;
body(evidence.getRange(`A4:G${sources.length + 3}`));
const sourceTable = evidence.tables.add(`A3:G${sources.length + 3}`, true, 'EvidenceSources');
sourceTable.style = 'TableStyleMedium2';
sourceTable.showFilterButton = true;
evidence.freezePanes.freezeRows(3);
for (const [col, width] of Object.entries({A:10,B:48,C:18,D:22,E:42,F:14,G:42})) evidence.getRange(`${col}:${col}`).format.columnWidth = width;

title(legend, 'A1:F1', '口径与图例', '本工作簿不提供功能优先级、版本路线或无证据总分。');
legend.getRange('A3:F3').values = [['对比状态','定义','允许结论','禁止结论','颜色','示例']];
header(legend.getRange('A3:F3'));
const legendRows = [
  ['核心同构','双方解决同一任务且关键闭环基本一致','继续比较深度、效率与稳定性','直接判定完全相同','绿色','环境创建、RPA、本地API'],
  ['YunLogin特色','YunLogin有更完整直接证据','用于特定客户场景的差异化','断言AdsPower绝对没有','蓝色','独立账号库、购物车、分享转移'],
  ['AdsPower证据更强','AdsPower证据明确，YunLogin当前材料不足','描述证据领先并建立核实项','写成YunLogin明确缺失','黄色','窗口同步、MCP入口、免费版'],
  ['路径差异','双方都解决问题但结构、规则或渠道不同','判断与目标用户的匹配度','给统一优劣分数','紫色','团队治理、支付、代理资源'],
  ['待核实','双方或一侧证据不足','保留未知并说明所需证据','以猜测补齐事实','灰色','公司主体或深层规则'],
  ['明确缺失','一方有直接证据，另一方明确写不支持','可作为确定差异','仅因材料没写就使用','红色','本矩阵当前为0项'],
];
legend.getRange('A4:F9').values = legendRows;
body(legend.getRange('A4:F9'));
for (let i = 0; i < legendRows.length; i++) legend.getRange(`A${i + 4}:F${i + 4}`).format.fill = stateFill[legendRows[i][0]];
legend.getRange('A12:D12').values = [['证据等级','定义','允许表述','注意事项']];
header(legend.getRange('A12:D12'));
legend.getRange('A13:D16').values = [
  ['A 产品事实','客户端页面、实测、价格快照、明确规则','页面显示/实测完成/该版本支持','不泛化到未测版本或异常流程'],
  ['B 官方自述','官网、帮助、条款、官方博客','官方称/官网展示','不是独立审计或效果证明'],
  ['C 合理推断','由多项事实形成的定位/战略判断','合理推断/分析判断','不能写成官方定位'],
  ['D 待核实','材料未覆盖、来源冲突或规则不完整','当前材料未确认','不能写没有/不支持'],
];
body(legend.getRange('A13:D16'));
legend.getRange('A19:F19').merge();
legend.getRange('A19').values = [['更新规则：新增证据先改对应能力行，再同步复核摘要、SWOT、销售、价格与结论并保留历史；材料未覆盖只有取得明确“不支持”证据后才能改为“明确缺失”；动态价格和认证每次对外使用前复核；现有飞书文档后续修改用紫色文字并配合删除线。']];
legend.getRange('A19:F19').format = { fill: '#EAF1F6', font: { bold: true, color: colors.navy }, wrapText: true };
legend.getRange('A19:F19').format.rowHeight = 68;
for (const [col, width] of Object.entries({A:20,B:38,C:40,D:40,E:12,F:32})) legend.getRange(`${col}:${col}`).format.columnWidth = width;

title(architecture, 'A1:N1', '产品架构对比', '复用项目现有架构图。两图均为产品能力分析模型，不是技术部署图；YunLogin图中的窗口同步未完成实现核验，AdsPower图中快照和部分API/MCP细节含推导或未完整核验项。');
architecture.getRange('A4:G4').merge();
architecture.getRange('A4').values = [['YunLogin 产品架构']];
architecture.getRange('H4:N4').merge();
architecture.getRange('H4').values = [['AdsPower 产品架构']];
for (const range of ['A4:G4','H4:N4']) architecture.getRange(range).format = { fill: colors.blue, font: { bold: true, color: colors.white, size: 12 }, horizontalAlignment: 'center' };

async function imageData(filePath) {
  const bytes = await fs.readFile(filePath);
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

const yunArch = path.resolve(baseDir, '..', 'YunLogin产品分析', 'YunLogin产品架构图.png');
const adsArch = path.resolve(baseDir, '..', 'Adspower产品分析', 'Adspower产品架构图.png');
architecture.images.add({ dataUrl: await imageData(yunArch), anchor: { from: { row: 4, col: 0 }, extent: { widthPx: 720, heightPx: 450 } } });
architecture.images.add({ dataUrl: await imageData(adsArch), anchor: { from: { row: 4, col: 7 }, extent: { widthPx: 720, heightPx: 450 } } });
architecture.getRange('A29:G31').merge();
architecture.getRange('A29').values = [['YunLogin：环境资产、三类代理、部门/角色/数据权限、分享转移、商城/云币/订单处于统一管理中心，偏向把运营资产和交易链做深；图中的窗口同步不作为已实现事实。']];
architecture.getRange('H29:N31').merge();
architecture.getRange('H29').values = [['AdsPower：环境、代理、团队、同步器、RPA、Local API/MCP入口、多币种与伙伴触点形成更宽的全球化与生态层；具体执行效果仍需验证。']];
for (const range of ['A29:G31','H29:N31']) architecture.getRange(range).format = { fill: colors.light, font: { color: colors.ink, size: 10 }, wrapText: true, verticalAlignment: 'center', borders: { preset: 'all', style: 'thin', color: colors.line } };
for (const col of ['A','B','C','D','E','F','G','H','I','J','K','L','M','N']) architecture.getRange(`${col}:${col}`).format.columnWidth = 13;

const checkSheet = workbook.worksheets.add('_检查');
checkSheet.showGridLines = false;
checkSheet.getRange('A1:B8').values = [
  ['检查项','结果'],
  ['能力总数',matrix.length],
  ['分类合计','=SUM(\'管理层摘要\'!B7:B12)'],
  ['明确缺失',stateCounts['明确缺失'] || 0],
  ['公式错误检查','导出后由脚本inspect'],
  ['优先级/路线字段','0'],
  ['价格日期','2026-08-11/12'],
  ['版本','2026-08-13'],
];
checkSheet.getRange('A1:B1').format = { fill: colors.navy, font: { bold: true, color: colors.white } };
checkSheet.getRange('A:B').format.columnWidth = 24;

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outFile);

for (const sheetName of ['管理层摘要','能力对比矩阵','商业模式与价格','架构对比']) {
  const safeName = sheetName.replaceAll('/', '_');
  const rendered = await workbook.render({ sheetName, autoCrop: 'all', scale: 1, format: 'png' });
  await fs.writeFile(path.join(previewDir, `${safeName}.png`), new Uint8Array(await rendered.arrayBuffer()));
}

const inspect = await workbook.inspect({
  kind: 'workbook,sheet,table,formula,drawing',
  maxChars: 12000,
  tableMaxRows: 4,
  tableMaxCols: 8,
  options: { maxResults: 100 },
});
await fs.writeFile(path.join(previewDir, 'workbook-inspect.json'), JSON.stringify(inspect, null, 2));

const errorScan = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 100 },
  maxChars: 8000,
});
await fs.writeFile(path.join(previewDir, 'formula-error-scan.json'), JSON.stringify(errorScan, null, 2));

console.log(JSON.stringify({ outFile, matrixRows: matrix.length, commercialRows: commercial.length, salesRows: sales.length, sourceRows: sources.length, previews: 4, errorScan }, null, 2));
