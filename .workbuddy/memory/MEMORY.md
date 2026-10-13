# 云登 PC 端原型 · 项目长期约定（精简版，详见 .workbuddy/memory/ 日志）

## 文档授权（最高优先级）
- 默认只改用户点名的 HTML；**禁止自动更新 PRD / design.md / 设计系统.html**，仅用户明确点名时才改。实现前读 PRD + design.md 作依据。
- 用户口头/引号引用按钮名 ≈ 要求改文案：按用户说的词改，用站点词表校准（底部栏一律「取消+确定」）。涉「撤回已有功能」先确认。
- ⚠️ 改导航 label 前必须 grep「按 label 查表」的路由映射（如 环境管理-编辑环境.html 的 shellRoutes[navLabel]），否则点击静默 fallback 到 系统框架.html。文案改前先 grep 全部落点。

## 改名与商城结构（2026-10-13 定稿）
- 文件名已改定：代理管理→设备管理、商城-代理→商城-设备、代理购买须知→设备购买须知、商城-云币充值→费用管理-账户充值、费用管理-云币交易流水→费用管理-交易流水（key：billing-recharge / billing-transactions）。旧文件名与旧 key（store-coin、billing-coin-transactions）在 公共导航.js 的 LEGACY_MODULE_FILE_ALIASES/moduleAliases/allowedModuleFiles/requestedPageAliases 与 index.html systemRouteByFile **保留兼容，禁止清理**。
- **「代理→设备」全站已完成（~940 处）**。永久保护词：代理商充值、代理平台、提取代理、代理API、IP 品类名（动态/静态住宅代理、动态代理、静态代理、住宅代理）、旧文件名兼容键；「代理服务」发票选项已按用户要求删除（非改名）。**「云币」术语（云币余额/云币数/充值弹窗）用户明确不统一改**。
- 商城一级菜单已隐藏（store 为 routeOnly）；设备商城=商城-设备.html 子页面（页签【购买设备】【购物车】，data-tab 内部值 proxy/cart 不变），由设备管理【购买设备】进入；套餐页/计价模拟仅存文件与路由、无入口；账户充值在费用管理二级菜单**首位**，交易流水是其页内页签。9 处页面内联侧栏副本已同步；改菜单需 grep `label:'商城'`、`navItems`。
- 首页资源面板「套餐」入口、团队权限树「商城」节点未动（用户未要求）。
- 设备商城子页页头（返回+页签）=商城-设备/商城-购物车两页**逐字节相同的共用片段**（专属类 `.back-btn`，写死 14px/边框色，因购物车页 body 是 13px、设备页 14px）；改页头两页同步+python 比对。教训：重复 `.btn` 定义的 shorthand 会冲掉早先同特异性规则的子属性；跨页断言用 getComputedStyle。

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

## 已知系统性问题（未擅自改）
- .hidden{display:none!important} 与 Tailwind 响应式类（hidden md:block）冲突 → 永久隐藏；新代码用页面自有类名+媒体查询。环境管理两页 TopBar 账号名 hidden sm:block 不可见。

## 交互标准速记
- 拖拽排序 design.md §5.14，参考部门/角色管理；role="switch" 用 click 委托；焦点环 :focus-visible，错误环写进同一组合选择器防蓝红混色。表格规范真身=环境管理.html .data-table（th 12px/#F0F1F3，td 9px 12px）。浮层在 overflow 祖先内判方向（基准滚动容器 rect）。就地编辑不位移：输入框绝对定位+visibility 隐藏原值（设备管理 td 落地参数见日志 2026-10-13 前）。「一屏塞不下」：临时 style+候选矩阵实测可见态 offsetHeight，留 ≥4px。

## 子页/公共层
- 子页 postMessage({type:'yundeng:route', file, search})；目标页读自身 location.search 的 tab；返回 Toast 走 sessionStorage['yundeng-device-toast']。
- 改 公共导航.js/css 后必须升 ?v= 并同步全部 ~36 文件；新增子页面三步：ROUTE_ONLY + index.html systemRouteByFile + syncIndexTitle 的 subPageTitleByModule。
- 「恢复/还原刚删的东西」：去 /Users/zhangbin/.workbuddy/traces/<id>/trace_*.json 捞 Edit.old_string 原文。

## 验证脚本（持久目录，勿放 /tmp）
- 添加设备页回归脚本在 `.workbuddy/verify/`：`verify-adddevice-spec.js`（jsdom 结构合规，138 断言）/ `verify-adddevice-interaction.js`（jsdom 交互，87 断言）/ `verify-adddevice-dup-dynamic.js`（agent-browser 真浏览器 21 断言）。跑法：`NODE_PATH=/Users/zhangbin/.workbuddy/binaries/node/workspace/node_modules node <脚本>`。
- 「校验重复项」现行口径（2026-10-13 需求 14）：**单个添加的静态与动态都提供**（未选网络属性时隐藏并清空，切换网络属性保留勾选）；静态按 主机:端口、动态按 提取链接，与「自有设备列表」全等比对；批量侧独立勾选项不变。改这块代码后三份脚本都要跑。
