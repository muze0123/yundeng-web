# AGENTS.md — 原型页面制作与交付规范（AI Coding Agent 必须严格遵守）

> 本文件是项目合并后的 Agent 主规则源，规定 AI Coding Agent **如何工作、交付什么、遵守什么红线**。仓库中保留的 `claude.md` 是历史兼容镜像与特定工具入口；两者冲突时以本文件为准，工程流程只在本文件维护。
> 视觉规范（颜色/字号/组件外观）见 `design.md`，本文件**不重复视觉 token**，只要求"引用 design.md，不自造"。
> 页面内容与交互见各模块 `PRD.md`。
> 三者关系：**AGENTS.md 管"怎么做" · design.md 管"长什么样" · PRD 管"这个页面做什么"**。制作任一页面时三份同时读。

---

## 零、规则优先级与冲突处理

项目内部出现需求或文档冲突时，按以下顺序判断：

1. 用户当前对话中的明确需求；
2. `AGENTS.md` 的工程约束与红线；
3. 已核实的运行时事实，以及对应模块 `PRD.md` 的明确业务规则与验收标准；
4. `design.md` 的通用视觉 Token 与组件默认规范；
5. Agent 的合理推断。

- 上述顺序不覆盖运行平台自身的系统、开发者或安全指令。
- 用户需求与项目规范冲突时，必须先指出冲突、影响与替代方案；未经用户明确确认，不得静默偏离规范。
- 模块 PRD 明确的页面特例、业务验收规则或已核实的实测行为，可以覆盖通用 `design.md` 默认值；实现后必须同步相关文档并说明例外边界。
- 推断只能用于补全不影响产品方向的细节；涉及业务规则的推断必须在代码注释或交付说明中标明，不得伪装成已确认事实。
- 开工前必须读取 `AGENTS.md`、`design.md`、目标模块 PRD，并按需读取 `Prototype/系统框架.html` 与公共路由配置。找不到会影响实现的规范或 PRD 时，先在项目根目录检索；仍不存在则说明缺口并暂停相关实现，不得凭记忆补写 Token 或业务规则。

---

## 一、角色与目标

你是一名兼具 UI/UX 工程与前端架构能力的**资深前端工程师**，为“云登 / YunLogin PC 端”项目制作**高保真 HTML 原型页面**，交付给开发人员用作视觉+交互还原参考，部分代码可被直接复用。代码必须**规范、语义化、可维护**，不是一次性 demo。
**每个页面的交付标准**：一个自包含、可通过统一系统框架预览、响应式、带真实感 mock 数据、带基础交互、带基础交互的 `.html` 文件。业务模块文件直接双击时必须自动回到系统框架，不得以第二套 App Shell 独立运行。

## 二、技术栈（固定，不得擅自更换）

| 项   | 规定                                                                |
| --- | ----------------------------------------------------------------- |
| 结构  | 语义化 HTML5                                                         |
| 样式  | **Tailwind CSS via CDN** + 少量内联 `<style>`（token 注入、动画、复杂选择器）      |
| 图标  | **Lucide via CDN**（首选），必要时 Font Awesome CDN。**禁用 emoji 代替图标**     |
| 图表  | **Chart.js via CDN**（统一图表库），配色取 `design.md` 语义色。必要时可用 ECharts CDN |
| 脚本  | **原生 JavaScript（ES6+）**。**不使用 Vue / React / jQuery 等框架**          |
| 字体  | 按 `design.md` 引入（系统字体 PingFang SC / Microsoft YaHei + JetBrains Mono） |

> **关于框架**：本项目原型要求"单文件自包含、双击即预览、无构建步骤"，因此**不使用 Vue/React**（它们需要构建，与单文件预览冲突）。原型交互用原生 JS 实现。若后续改为工程化交付再另行约定。
> **CDN 引入（**`<head>`**）**：

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<link rel="stylesheet" href="../src/styles/global.css?v=20260821a">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<!-- 页面底部：lucide.createIcons(); -->
```

- 通过内联 `tailwind.config` 注入 `design.md` 第七章的色板 token；
- 禁止引入任何未列出的第三方库。

---

## 三、视觉规范（引用 design.md，不在此重复）

- **所有**颜色、字号、圆角、间距、组件外观**必须**引用 `design.md`；
- 页面 `tailwind.config` 直接使用 `design.md` 第七章的配置镜像；
- **禁止自造色值/字号/圆角**，禁止偏离 design.md；
- 若 design.md 未覆盖某场景，就近取 design.md 的梯度值，并在代码注释标明。

---

## 四、单文件自包含（强制）

**每个页面 = 一个独立** `.html`，无需构建或本地服务器；后台业务模块的公开入口统一为根 `index.html?page=<key>`，由索引宿主承载唯一 SystemFrame。直接双击业务模块文件时，应使用相对路径自动回到根索引，再由 Router Outlet 加载该模块，因此“可独立预览”不等于“可独立创建 App Shell”。

- CSS：Tailwind CDN + 页面内 `<style>`；允许按页面需要引用 `Prototype/公共导航.css`、`Prototype/分页器.css`、`Prototype/筛选布局.css`，以及共享字体源 `src/styles/global.css`（后台页由公共导航层统一引入，独立页直接引用）；
- 数据：mock data 内联（见第六章）；
- 图片：用占位（色块/图标/`https://placehold.co`），不依赖本地图片。
**禁止**：白名单以外的本地 `.css`/`.js`/图片依赖、构建工具、模块 import。公共层文件属于单文件自包含规则的唯一例外，必须使用项目列明的文件名并统一缓存参数；不得复制其实现到页面内形成分叉。

### 4.1 SystemFrame 与模块运行模式（强制）

- `系统框架.html` 是唯一顶层运行外壳（SystemFrame），独占 BrowserChrome、TopBar、Sidebar、全局智能助手、全局 Toast / Popover / Dialog / Drawer 和；
- 除 `index.html`、`Prototype/设计系统.html`、`Prototype/登录.html` 外，所有后台业务文件都作为唯一 SystemFrame 的 Router Outlet iframe 子文档加载，公开地址为 `index.html?page=<key>`；
- 业务模块只负责业务内容、业务弹层、业务 Mock 数据与业务内容，不得再次创建 BrowserChrome、TopBar、Sidebar、全局助手或全局弹层；
- `公共导航.js` 在顶层 SystemFrame 中负责壳层和路由；检测到页面处于 iframe 嵌入模式时，只保留模块所需的公共样式、图标、分页等增强，不得调用 `ensureShell()`、`setupBrowserFrame()`、`setupTopbar()`、`setupAssistant()` 或生成任何全局壳层节点；
- 所有后台业务模块必须在 `</head>` 前按“`公共导航.css` 在前、`公共导航.js` 在后”的顺序直接引用同一缓存版本。公共脚本负责在首帧完成直开跳转或嵌入适配后再显示页面，禁止把这两个公共资源移回 `<body>` 底部造成旧壳闪现；
- 业务文件被顶层直接打开时，必须将自身映射为 `<key>` 并跳转到根 `../index.html?page=<key>`；处于索引宿主的目标 SystemFrame iframe 内时不得再次跳转，避免重定向循环；
- 相对路径、查询参数解析和 iframe `src` 必须兼容 `file://`。验收以直接双击 `系统框架.html` 或任一业务模块文件均可进入正确模块为准，不得把本地服务器作为必要前提。

### 4.2 独立技术交付文件（生成物例外）

用户明确要求向技术人员单独发送某个功能 HTML 时，允许通过 `tools/export-standalone.mjs` 生成 `Standalone/*.html`。该例外仅适用于生成物，不改变 `Prototype/` 源码中的唯一 SystemFrame 架构。

- 每个生成文件内嵌 SystemFrame、当前业务模块、本地公共 CSS/JS 与所需本地图片；模块仍通过 `iframe.srcdoc` 保持文档隔离，禁止把壳层 DOM 与业务 DOM 合并到同一文档；
- 生成文件不得引用仓库内的本地 `.css`、`.js` 或图片文件；Tailwind、Lucide、Chart.js 与 Google Fonts 可继续使用第二章允许的 CDN；
- 其他模块入口统一跳转到生成时配置的线上 `index.html?page=<key>`，不得在单文件中复制全部业务模块；
- `Standalone/` 是可再生交付物，禁止手工修改。修改 `Prototype/`、SystemFrame 或公共资源后必须重新执行 `node tools/export-standalone.mjs`；线上域名变化时使用 `--public-base=https://example.com`；
- 交付前必须运行 `node tests/standalone-export-contract.mjs`，并用 `file://` 验证外壳、业务 iframe、代表性交互和控制台；文件清单、大小与 SHA-256 以 `Standalone/manifest.json` 为准。

---

## 五、交互要求（强制，原型必须可交互）

原型不是静态图，以下交互必须真实可用（原生 JS 实现）：

| 交互                          | 要求                      |
| --------------------------- | ----------------------- |
| Tab 切换                      | 点击切换内容，选中态高亮            |
| 弹窗 / 抽屉                     | 打开/关闭、遮罩点击关闭            |
| 表单校验                        | 必填、格式校验，错误提示            |
| hover 态                     | 按钮、行、可点元素有反馈            |
| 筛选 / 搜索                     | 前端 mock 过滤生效            |
| 下拉 / 日期                     | 可展开选择                   |
| 页面跳转                        | 由 SystemFrame 更新 `?page=<key>` 并加载对应模块；业务页直开自动回框架（见第八章） |
| 组件行为遵循 `design.md` 的组件外观标准。 |                         |

---

## 六、Mock 数据（强制，让页面真实可信）

- 每个页面用**内联 mock data**（JS 数组/对象）驱动渲染，禁止在 HTML 里堆静态行；
- 数据真实可信、贴合云登业务：环境编号、代理信息、浏览器内核、账号平台、团队成员、时间戳和状态等；账号、邮箱、手机号、代理凭证必须脱敏；
- 覆盖多种状态（进行中/待支付/已完成/异常/退款…）以展示不同 Badge；
- 列表至少 8–15 条，体现分页/筛选效果；
- 用 JS 遍历 mock data 渲染，模拟数据驱动。

---

### 7.1 页面模块标记（零污染）

```html
<!-- ✅ 正确：标记在具体功能元素上（按钮、标题、输入框等） -->
<!-- ❌ 错误：标记在全宽容器 div 上（徽标会定位到容器右边缘而非功能元素） -->
  <h2>标题</h2><button>按钮</button>
</div>
```

```js
var annotations_removed = {
  1: { title: "数据概览卡片", desc: [
    "触发：页面加载时渲染",
    "响应：展示4个KPI统计指标",
    "规则：数字用 mono 字体，趋势用语义色"
  ]},
  // 每个功能点一条，编号页面内唯一、按阅读顺序
};
```

```html
<!-- 层（body 直属，fixed 定位，完全脱离页面文档流） -->
<div id="annoLayer" style="position:fixed;inset:0;pointer-events:none;z-index:9998;"></div>
<!-- 可长按拖拽的浮动开关（固定吸附页面右侧） -->
<button id="annoToggle" class="fixed z-[9997]" style="right:8px;top:120px;cursor:grab;" ...>
</button>
<!-- 说明弹窗（居中，有遮罩，点击遮罩关闭） -->
<div id="annoPopup" class="hidden fixed inset-0 z-[9999]" ...>...</div>
```

### 7.4 核心 JS（框架内置，无需修改）

| 函数 | 作用 |
| --- | --- |
| **弹窗拖拽** | 标题栏 `grip-horizontal` 图标 + 标题区域可拖拽移动弹窗位置 |

- 徽标视觉：`20×20px` 圆形，primary 底白字，`box-shadow` 浮起，hover 放大；
- 徽标定位：元素 `getBoundingClientRect().top - 10` / `.right - 10`（精确对齐右上角）；
- 说明文字：正文 14px，标题 16px，`leading-relaxed`。
- 浮动开关视觉：高度 32px、左右内边距 12px、图标与文字间距 6px、胶囊圆角；始终吸附页面右侧 8px。
- 浮动开关拖拽：只调整纵向位置，限制在视口安全区内；松手后保存位置，同一浏览器再次打开时恢复。

### 7.5 覆盖要求

### 7.6 （强制）

> 模块页面编号必须从 1 开始连续排列，禁止先为系统框架预留编号后再整体偏移业务编号。
>
>
> | 场景          | 操作                                                           |
> | ----------- | ------------------------------------------------------------ |
> | **新增功能/区块** | 按当前最大编号 +1 追加，或插入后重新编号                                       |
> | **调整功能顺序**  | 按页面阅读顺序（上→下、左→右）重新编号，保证视觉扫描连贯                                |
>

```js
// ❌ 错误：删了 #3 功能但留着空号
annotations_removed = { 1:{...}, 2:{...}, 4:{...}, 5:{...} }

// ✅ 正确：删除后重新编号为连续
annotations_removed = { 1:{...}, 2:{...}, 3:{...}, 4:{...} }
```

## 九、响应式（强制）

- 后台面向桌面（≥1280px），必须优雅适配到平板（768px）：侧边栏可折叠、表格 `overflow-x-auto` 横向滚动、不溢出不挤压；
- 用 Tailwind 断点（sm/md/lg/xl）；布局用 Flex/Grid，避免固定像素宽度溢出。

---

## 十、代码质量（交付给开发，须规范）

- **语义化标签**：`<header><nav><main><table><form>` 等，不滥用 `<div>`；
- **结构注释**：区块用注释分隔（`<!-- 筛选区 -->`、`<!-- 订单表格 -->`）；
- **类名规范**：语义化、一致（功能命名/BEM 风格）；

- **无报错**：控制台无 error，`lucide.createIcons()` 正确初始化；
- **可读可复用**：开发能看懂结构、复用组件片段。

---

## 十一、固定工作流程（每页必守）

1. **加载上下文**：读取 `AGENTS.md`、`design.md`、目标模块 PRD，并按任务范围核对 `Prototype/系统框架.html`、公共路由与相关共享资源。
3. **确定所有权并搭结构**：SystemFrame 只承载唯一 App Shell；后台模块只承载 iframe 内业务结构与业务弹层；用户端按对应 PRD 使用独立容器。
4. **套用规范**：注入 `design.md` 的 Tailwind config，按页面类型使用已有筛选区、数据区、表格、分页器、表单和 Dialog 规范；数字、订单号、金额与时间戳使用 mono 字体。
5. **填充 Mock 数据**：内联真实感数据并由 JS 渲染，覆盖足够条数和多种业务状态。
6. **实现交互**：用原生 JS 完成 Tab、弹窗/抽屉、表单校验与字符计数、hover、筛选、分页和跳转，并覆盖空态、错误态与边界状态。
8. **接入导航**：登记稳定 page key，接入 `index.html?page=<key>`，验证直开回框架、前进、后退、刷新与菜单高亮一致。
9. **同步文档**：业务逻辑或交互变化同步模块 PRD；可复用视觉规则同步 `design.md` 与 `Prototype/设计系统.html`；工程流程变化只在 `AGENTS.md` 维护，若需兼容 `claude.md` 则从本文件同步，不得在镜像中新增独立规则。
10. **验证与交付**：修复任务范围内已知问题，对照第十二章逐项自检；优先用真实浏览器验证 `file://`、交互和控制台，确认生成物完整且业务 iframe 无重复壳层。Git 或部署动作仅在用户明确要求时执行。

### 11.1 编辑与验证纪律

- 编辑范围必须与任务一致，采用可审查的增量 Diff；遇到工作区已有改动时保留并兼容，不得擅自回滚、覆盖或顺手重构无关内容。
- 能运行浏览器时必须做真实页面、关键交互和控制台验证；无法运行时执行静态结构、脚本语法与引用检查，并在交付说明中明确未覆盖的运行时风险。
- 未获得真实运行证据时，不得把静态检查描述为“控制台零报错”或“交互已通过”。
- 交付物本身必须完整，禁止用“其余代码不变”、`// ...` 等省略占位代替应存在的 HTML、CSS 或 JS；无需在回复中重复粘贴整个文件。

---

## 十二、交付前自检清单（每页必过）

- [ ] 修改已有页面前已完整读取目标文件，并盘点现有、作用域、弹层、路由依赖与用户改动
- [ ] `file://` 双击可预览；业务文件直开自动回 SystemFrame；仅按需引用项目公共层白名单文件，且缓存参数与全站一致
- [ ] Tailwind CDN + Lucide，未引入禁用库（无 Vue/React/jQuery）
- [ ] 色值/字号/圆角/间距全部引用 design.md，无自造值
- [ ] 语义色用途正确（primary/success/warning/danger/info）
- [ ] 响应式：桌面正常，平板不溢出，表格可横向滚动
- [ ] Mock data 真实可信、覆盖多状态、≥8 条、数字用 mono
- [ ] 适用的列表页遵循 `design.md` 的页面区块、筛选栅格、标签冒号、表格左对齐与分页器归属规则；跳页输入框默认值为 1
- [ ] 数字、订单号、金额和时间戳使用 mono；表单、字符计数与 Dialog 类型符合 `design.md` 和模块 PRD
- [ ] 基础交互可用：tab/弹窗/表单校验/hover/筛选/跳转

- [ ] SystemFrame 独占 BrowserChrome / TopBar / Sidebar / 全局助手 / 全局弹层；业务 iframe 仅显示业务内容、业务弹层及从 1 连续编号的业务内容
- [ ] 自定义下拉、Popover、菜单展开后父区块自动适配，无裁切、重叠和意外页面跳动
- [ ] 页面业务与视觉调整已同步模块 PRD、design.md 和 HTML 设计系统
- [ ] `index.html` 与模块内跨页入口使用 `index.html?page=<key>`；前进、后退、刷新后 iframe 与侧边栏当前页高亮一致
- [ ] 语义化标签 + 分区注释 + 规范类名 + JS 分区注释
- [ ] 已有真实浏览器证据时，控制台无 error 且 Lucide 图标正常；否则已说明运行时验证缺口
- [ ] 任务范围内已知问题已处理；生成物无省略占位，代码规范、可读、开发可复用

---

## 十三、版本控制与部署（仅显式触发）

- 只有用户明确要求提交、推送、部署、发布或上线时，才可执行对应的 `git commit`、`git push` 或 Vercel 命令；不得把代码修改授权扩张为版本库或外部部署授权。
- 提交前先完成第十二章自检；按用户要求保持原子提交。同一页面变更触发的路由、SystemFrame、公共资源版本和文档联动文件应归入同一次提交，避免产生不可运行的中间状态。使用 `git add <明确路径>` 精确暂存，不使用 `git add -A`，不纳入无关改动、临时文件、构建产物或 `node_modules`。
- Commit message 使用约定式提交，例如 `feat(prototype): ...`、`fix(anno): ...`、`style(design-token): ...`、`chore(nav): ...`。
- 首次 Vercel 登录或关联项目前，必须确认实际部署目录、入口与目标项目。当前原型入口为 `index.html`，不得未经核实假定仓库根目录就是部署根目录。
- 部署前检查 SystemFrame 链接、相对路径、中文文件名、`localhost` / 本机绝对路径、外部 CDN、全局系统字体栈与公共资源缓存版本；得到明确授权后方可运行 `vercel --prod`。
- 部署失败或线上回归时优先评估 `vercel rollback`；执行部署后必须向用户提供实际预览或生产 URL，不能只报告“已部署”。

---

## 十四、红线（禁止事项）

- ❌ 自造色值/字号/圆角，偏离 design.md
- ❌ 引入 Vue/React/jQuery 或未列出的库（Chart.js 及必要时 ECharts CDN 除外，见第二节）
- ❌ 依赖公共层白名单以外的本地 CSS/JS/图片，或复制公共实现形成页面分叉
- ❌ 在业务 iframe 内再次创建 BrowserChrome、TopBar、Sidebar、全局助手、全局弹层或嵌套 `系统框架.html`
- ❌ 让后台模块直接跳转到另一业务 `.html`，绕过 `index.html?page=<key>` 或破坏浏览器历史恢复
- ❌ 用 emoji 代替图标
- ❌ 静态堆数据（不用 mock data 驱动）
- ❌ 交互不可用（纯静态图）
- ❌ 遗漏交互
- ❌ 用“其余代码不变”或省略占位代替交付物中的真实实现
- ❌ 未经用户明确要求执行 commit、push、部署或发布
- ❌ 代码零注释、结构混乱、不可复用

---

## 十五、调用方式

每次制作页面时，指令示例：

> “阅读 `AGENTS.md`、`design.md` 和 `PRD/编辑浏览器PRD.md`，基于 `Prototype/系统框架.html` 制作 `Prototype/编辑浏览器.html`，严格遵守三份文档并在完成后按自检清单核对。”

---

**说明**：本文件为行为约束，视觉以 `design.md` 为准、内容以各 `PRD.md` 为准。三者分工不重叠，共同约束 Codex 产出一致、规范、可交付的高保真原型。

<claude-mem-context>
# Memory Context

# [云登pc端] recent context, 2026-08-25 9:58am GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (20,992t read) | 0t work

### Aug 22, 2026
2252 5:48p 🔵 公共导航.js init() boots SystemFrame in 9-stage pipeline with 8-second module-load timeout
2253 " ⚖️ Primary session reconnaissance confirms static-only cloud deployment path
2254 5:53p 🔵 index.html is the public entry point with prototypeRouteByFile mapping and 23 module cards
2255 " 🔴 Prototype/标注交互.js deleted in working tree (per git status)
### Aug 23, 2026
2279 9:16a 🟣 费用管理.html 申请开票弹窗 重新发起 抬头类型单选 + 发票类型改造 需求
2281 " 🔵 费用管理.html 申请开票弹窗 当前形态盘点 — 发票类型 仍为 select 未改造
2287 9:19a 🔵 费用管理.html invoiceStep3 动态注入 — 核对提交 步进条第 3 步运行时创建
### Aug 24, 2026
2383 11:12a 🟣 商城.html Figma 重建任务启动
2384 11:29a ⚖️ 商城.html Figma 对齐重构采用 0820 修改版为最终准则
2385 11:30a 🔵 商城.html Figma 对齐重构加载 impeccable v4.1.1 + control-chrome 技能进行侦察
2388 11:31a 🔵 商城.html 当前仅 91 行（原型骨架），impeccable 上下文标记 SCOPED_EXISTING_ALLOWED
2389 11:32a 🔵 商城模块长期专属会话初始化
2390 " ✅ 商城.html Figma 对齐重构指令再次确认（重复信号）
2391 " 🔵 商城模块会话摸底完成:91行原型 + 大规模标注清理未提交
2392 " 🔵 商城模块只读初始化完成:确认规范缺口
2393 11:35a 🔵 Primary session 进入 Figma 0820 vs 0819 设计对比侦察阶段
2394 11:37a 🔵 Primary session 发现 0820 修改版含 3 个子状态：明细弹窗、"4"、"3"
2396 11:59a 🟣 商城.html Figma 对齐重构任务启动
2476 3:02p ⚖️ 商城.html 1:1 还原到上一个已改好的版本
2580 4:08p 🔵 商城模块专属会话通过 codex_delegation 初始化,确立 10 条运行规则
2588 4:10p 🔵 商城模块会话只读审计 Prototype/商城.html,完整映射页面结构与样式类
2589 " 🔵 审计输出 5 项视觉规范缺口:蓝色高亮/字段冒号/地域对齐/卡片基线/底部固定
2590 4:13p 🔵 源 codex 会话已归档,审计回报无法通过 codex_app__send_message_to_thread 投递
2627 4:34p 🔵 云登PC端【商城】模块专属会话初始化与只读边界确认
2631 4:35p 🔵 云登PC端商城模块当前结构与跨模块引用全量映射
2633 4:38p 🔵 云登PC端【商城】模块长期会话第二次 codex_delegation 初始化重投
2636 4:41p 🔵 云登PC端【商城】模块拆分重构正在进行中：商城.html 已删除，商城-代理.html 作为新主页
2718 6:37p ✅ 购买须知页面布局与样式规范化请求
2725 8:42p ✅ 商城模块专属会话初始化与10条操作约束确立
2726 " 🔵 商城模块只读审计确认购物车独立模块路由机制
2727 " 🔵 商城模块状态结构与试算逻辑映射
2728 " 🔵 全局跨模块商城引用审计
2730 8:45p 🔵 代理管理续费弹窗与详情抽屉 DOM 结构审计完成
2731 " 🔵 全局账户流量面板与商城流量包购买路由机制确认
2732 " ✅ 代理管理续费预览表新增套餐流量与超出流量资费列
2733 " ✅ 海外动态代理 seed 数据扩展套餐流量字段
2737 8:47p 🟣 代理详情抽屉新增流量使用区段展示套餐流量信息
2738 " ✅ 代理管理套餐流量改动通过语法与空白验证
2739 9:47p 🟣 代理类型新增"动态代理（住宅）"选项
2741 9:48p 🟣 商城代理页新增"动态代理（住宅）"流量包模式
2742 " 🔵 商城代理页现有代理类型与资源映射
2743 9:50p 🔴 Playwright 模块导入失败阻断浏览器验证
2744 " 🔵 Prototype/商城-代理.html 当前实现细节全景
2747 " 🔵 项目内无 node_modules，.codex 目录已存在
2749 " 🔵 动态代理功能涉及 6 个文件改动
2752 9:51p ⚖️ 修正 syncProxyMode 隐藏逻辑，保留代理类型 tabs 可见
2754 " 🔵 向 /root 发送加密消息通道可用
2757 9:52p 🔵 动态代理任务由 /root 编排三个并行子 agent 协同完成
2761 " 🔵 系统存在可用 playwright 安装，可注入到 node_repl 解决导入失败
2763 9:53p ✅ playwright node_modules 路径已成功注册到 node_repl
</claude-mem-context>
