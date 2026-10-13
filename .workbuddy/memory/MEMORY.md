# 云登 PC 端原型 · 项目长期约定（精简版，详见 .workbuddy/memory/ 日志）

## 文档授权（最高优先级）
- 默认只改用户点名的 HTML；**禁止自动更新 PRD / design.md / 设计系统.html**，仅用户明确点名时才改。实现前读 PRD + design.md 作依据。
- PRD 目录现状：**`PRD/设备管理/设备管理-自有设备-添加设备PRD.md` 已于 2026-10-13 建立（v1.0）**，按 `PRD/Vibe Coding产品PRD模版.md` 的 0–12 章结构撰写（同 `PRD/开票管理/03-YunLogin开票管理PRD.md` 的做法）；`PRD/设备管理/设备管理-自有设备PRD.md` 仍是旧文（标题还写着「代理管理」，未同步）。新增/改写 PRD 一律用模版结构，不沿用旧 PRD 的扁平章节。
- 用户口头/引号引用按钮名 ≈ 要求改文案：按用户说的词改，用站点词表校准（底部栏一律「取消+确定」）。涉「撤回已有功能」先确认。
- ⚠️ 改导航 label 前必须 grep「按 label 查表」的路由映射（如 环境管理-编辑环境.html 的 shellRoutes[navLabel]），否则点击静默 fallback 到 系统框架.html。文案改前先 grep 全部落点。

## 改名与商城结构（2026-10-13 定稿）
- 历史改名链（旧名一律保留兼容键）：代理管理→设备管理-自有设备、商城-代理→设备管理-平台设备-购买设备、代理购买须知→设备购买须知、商城-云币充值→费用管理-账户充值（billing-recharge）、费用管理-云币交易流水→费用管理-交易流水/余额明细（billing-balance-details）。旧 key（store-coin、billing-coin-transactions）在 公共导航.js 的 LEGACY_MODULE_FILE_ALIASES/moduleAliases/allowedModuleFiles/requestedPageAliases 与 index.html systemRouteByFile **保留兼容，禁止清理**。
- **「代理→设备」全站已完成（~940 处）**。永久保护词：代理商充值、代理平台、提取代理、代理API、旧文件名兼容键（代理管理.html、商城-代理.html、代理购买须知.html、'代理管理':'proxy'、'商城代理':'store'）；「代理服务」发票选项已按用户要求删除（非改名）。**「云币」术语（云币余额/云币数/充值弹窗）用户明确不统一改**。
  - **2026-10-13 下午补充**：用户明确要求商城模块「所有代理→设备」，原先排除的 IP 品类名已一并改名——商城内已无「代理」：动态代理（住宅）→**动态设备（住宅）**、动态/静态住宅代理→动态/静态住宅设备、东南亚/北美/欧洲…住宅代理→…住宅设备、设备类型行同改。范围：设备管理-平台设备-购物车.html（7 处）+ 设备管理-平台设备-购买设备.html（6 处，含写入购物车的商品名与设备页自身 UI 标签）+ 设备管理-平台设备-购物车PRD.md（9 处）。**凡后续新增商城页面/文案，一律用「设备」，不得再出现「代理」**。
- **2026-10-13 傍晚文件改名定稿（设备管理系列，共 10 个文件）**：
  - Prototype：`设备管理-自有设备.html`（原 设备管理.html）、`设备管理-自有设备-添加设备.html`（原 添加设备.html）、`设备管理-平台设备.html`（原 商城-套餐.html）、`设备管理-平台设备-购买设备.html`（原 商城-设备.html）、`设备管理-平台设备-购物车.html`（原 商城-购物车.html）。
  - PRD 迁入 `PRD/设备管理/`：`设备管理-自有设备PRD.md`、`设备管理-自有设备-添加设备PRD.md`、`设备管理-平台设备PRD.md`、`设备管理-平台设备-购买设备PRD.md`、`设备管理-平台设备-购物车PRD.md`；原 `PRD/商城/` 目录已删除。3 份文档头部已去掉「商城」口径、加「命名说明」。
  - **page key 一律未变**（proxy / store / device-create）；旧文件名在 公共导航.js 的 `allowedModuleFiles` + `moduleAliases` + `LEGACY_MODULE_FILE_ALIASES` 三处保留兼容，**禁止清理**。
  - 未改（如需要须用户确认）：各页 `<title>`、侧栏 label、index.html 模块标题仍为「设备商城 / 设备管理 / 添加设备」。
- 商城一级菜单已隐藏（store 为 routeOnly）；设备商城=设备管理-平台设备-购买设备.html 子页面（页签【购买设备】【购物车】，data-tab 内部值 proxy/cart 不变），由设备管理【购买设备】进入；套餐页/计价模拟仅存文件与路由、无入口；账户充值在费用管理二级菜单**首位**，交易流水是其页内页签。9 处页面内联侧栏副本已同步；改菜单需 grep `label:'商城'`、`navItems`。
- 首页资源面板「套餐」入口、团队权限树「商城」节点未动（用户未要求）。
- 设备商城子页页头（返回+页签）=设备管理-平台设备-购买设备/设备管理-平台设备-购物车两页**逐字节相同的共用片段**（专属类 `.back-btn`，写死 14px/边框色，因购物车页 body 是 13px、设备页 14px）；改页头两页同步+python 比对。教训：重复 `.btn` 定义的 shorthand 会冲掉早先同特异性规则的子属性；跨页断言用 getComputedStyle。

## 验证（agent-browser，首选）
- 起服务→开页→eval→kill 必须同一次 Bash 调用：`python3 -m http.server 8899 & SRV=$!` … `kill $SRV`。
- open "…/index.html?page=<key>&_cb=$(date +%s)" → set viewport 1440 900 → sleep 3。key：设备管理=proxy、设备商城=store、账户充值=billing-recharge、交易流水=billing-transactions。侧栏断言在 #indexRouteFrame.contentDocument 内取 #yundeng-primary-nav（顶层文档无侧栏）。
- ⚠️ 本地服务地址一律用 `http://localhost:8899`（系统代理 127.0.0.1:7890 例外表不含 127.0.0.1，会被 502）；curl 探活加 `--noproxy '*'`；agent-browser 用 `AGENT_BROWSER_SESSION=ydverify` 独立会话且不吞 open 输出（偶发静默失败落 about:blank）。
- ⚠️ 代理变量（2026-10-13 新坑）：会话可能注入 `HTTP_PROXY=http://127.0.0.1:<port>` 且**无 NO_PROXY 豁免**，Chromium 走代理连 localhost 都 502（症状：title="Error response"、body~186B、无 iframe、eval 拿不到 indexRouteFrame）。open 前 `unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy; export NO_PROXY=localhost,127.0.0.1 no_proxy=localhost,127.0.0.1`。
- ⚠️ 服务根目录必须是**项目根**（index.html 在根、模块在 Prototype/）；从 Prototype 起服务 index.html 404。agent-browser eval 的返回是 JSON 编码字符串（外层引号+转义），程序解析需 json.loads 两次。
- 中文 URL 必须 URL 编码，否则静默留上一页。DOM 在两级 iframe：#indexRouteFrame → #yundengModuleFrame；断言/截图前移除 #yundengOnboardingOverlay。模块函数 IIFE 私有，走 UI 驱动 click；重建型 DOM 每次重查节点、监听挂稳定容器委托。带 transition 等 400~700ms 再读。真实 :hover 只能 mouse move 字面坐标。裸 Chrome 沙箱不可用（133/137）。

## jsdom 配方（静态备选）
- /Users/zhangbin/.workbuddy/binaries/node/workspace/node_modules（jsdom 30.x）。必做桩：window.tailwind={}、structuredClone、HTMLDialogElement showModal/close、内存 localStorage。几何恒 0（断言用 compareDocumentPosition&4）；布局交给 agent-browser。语法兜底 node --check；`$` 助手不收 root 会静默查全文档。

## design.md 对齐
- 「无 X」否定约束要显式写进代码（border:0）；结构断言看 <style> 原文；颜色/尺寸看 getComputedStyle；组合选择器 hasDecl 支持逗号拆分。

## PRD 文档规范（按模版重写时）
- 模版：`PRD/Vibe Coding产品PRD模版.md`；3.x 每个「页面/弹窗」固定四段式 **3.x.1 区块与组件清单 / 3.x.2 字段定义 / 3.x.3 操作与交互规则 / 3.x.4 正式文案**；3.0 下先 **3.0.1 整体布局**（含 ASCII 图）再 3.0.2 区域详细布局。两份开票 PRD（03 全量 v1.6 / 一期 V1.5）已按此对齐，可直接当范例。
- ⚠️ Markdown 表格单元格内出现 `|`（如 `invoiceTab=orders|records|titles`）必须写 `\|`，否则列错位。
- ⚠️ 用 Edit 重构大段时，若 new_string 里已包含原尾部内容 → 会残留**重复块**；删重复用 Python 按行号删并先 assert 锚点行首（本项目已踩过 1 次）。
- 改「产品规则/文案」要同步：正文 + Toast 表 + 接口契约 + 错误码表 + 验收 + 变更记录（+ 两份 PRD 与散落的 B-xx / AC-xx / Mock 场景行）。定稿后跑表格校验脚本（列数 + 重复行）确认 0 异常。
- 开票 HTML 事实源：原因弹窗文案取 `invoiceReasonConfig[code].label`（`invoiceReasonMessages` 未被引用，疑似死代码）；记录页工具栏只有「导出」、排序仅 `amount`/`created`（默认 `status` 升序）；「是否启用」是 `toggle-switch` + `role="switch"` 箭头开关；无「加载中/局部失败」文案，只有单一空态。

## 已知系统性问题（未擅自改）
- .hidden{display:none!important} 与 Tailwind 响应式类（hidden md:block）冲突 → 永久隐藏；新代码用页面自有类名+媒体查询。环境管理两页 TopBar 账号名 hidden sm:block 不可见。

## 交互标准速记
- 拖拽排序 design.md §5.14，参考部门/角色管理；role="switch" 用 click 委托；焦点环 :focus-visible，错误环写进同一组合选择器防蓝红混色。表格规范真身=环境管理.html .data-table（th 12px/#F0F1F3，td 9px 12px）。浮层在 overflow 祖先内判方向（基准滚动容器 rect）。就地编辑不位移：输入框绝对定位+visibility 隐藏原值（设备管理 td 落地参数见日志 2026-10-13 前）。「一屏塞不下」：临时 style+候选矩阵实测可见态 offsetHeight，留 ≥4px。

## 子页/公共层
- 子页 postMessage({type:'yundeng:route', file, search})；目标页读自身 location.search 的 tab；返回 Toast 走 sessionStorage['yundeng-device-toast']。
- **store 子页路由（2026-10-13 定稿）**：地址栏一律 `index.html?page=store&tab=cart` / `&tab=proxy`（无中文 module 文件名）；公共导航.js `STORE_TAB_MODULE_FILES` 登记 tab→文件映射（proxy→购买设备、cart→购物车），shellRouteHref/parseShellRoute/redirectStandaloneModule 等 6 处按 tab 反查，可推导时不写 module 参数；旧 `module=设备管理-平台设备-购物车.html` 链接仍兼容。新增 store 子页要同步改这张表。
- 改 公共导航.js/css 后必须升 ?v= 并同步全部 ~36 文件；新增子页面三步：ROUTE_ONLY + index.html systemRouteByFile + syncIndexTitle 的 subPageTitleByModule。
- 「恢复/还原刚删的东西」：去 /Users/zhangbin/.workbuddy/traces/<id>/trace_*.json 捞 Edit.old_string 原文。

## 验证脚本（持久目录，勿放 /tmp）
- 添加设备页回归脚本在 `.workbuddy/verify/`：`verify-adddevice-spec.js`（jsdom 结构合规，138 断言）/ `verify-adddevice-interaction.js`（jsdom 交互，87 断言）/ `verify-adddevice-dup-dynamic.js`（agent-browser 真浏览器 21 断言）。跑法：`NODE_PATH=/Users/zhangbin/.workbuddy/binaries/node/workspace/node_modules node <脚本>`。
- 「校验重复项」现行口径（2026-10-13 需求 14）：**单个添加的静态与动态都提供**（未选网络属性时隐藏并清空，切换网络属性保留勾选）；静态按 主机:端口、动态按 提取链接，与「自有设备列表」全等比对；批量侧独立勾选项不变。改这块代码后三份脚本都要跑。
