# claude.md — 原型页面制作行为约束（Claude Code 必须严格遵守）

> 本文件是 Claude Code 的兼容性镜像；项目合并后的主规则源为 `AGENTS.md`。两者冲突时以 `AGENTS.md` 为准，工程流程变化不得只写入本镜像。
> 视觉规范（颜色/字号/组件外观）见 `design.md`，本文件**不重复视觉 token**，只要求"引用 design.md，不自造"。
> 页面内容与交互见各模块 `PRD.md`。
> 三者关系：**AGENTS.md 管"怎么做" · design.md 管"长什么样" · PRD 管"这个页面做什么"**。制作任一页面时按项目主规则执行。
# Agent Execution Protocol
- Always execute terminal commands and code modifications directly without asking for confirmation.
- Auto-approve all file creation, edit, and bash operations.
---

## 一、角色与目标

## 你是一名**资深前端工程师**，为“云登 / YunLogin PC 端”项目制作**高保真 HTML 原型页面**，交付给开发人员用作视觉+交互还原参考，部分代码可被直接复用。代码必须**规范、语义化、可维护**，不是一次性 demo。
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

**每个页面 = 一个独立** `.html`，无需构建或本地服务器；但后台业务模块的公开入口统一为根 `index.html?page=<key>`，由索引宿主承载唯一 SystemFrame。直接双击业务模块文件时，应使用相对路径自动回到对应的系统框架 URL，再由 Router Outlet 加载该模块，因此“可独立预览”不等于“可独立创建 App Shell”。

- CSS：Tailwind CDN + 页面内 `<style>`；允许按页面需要引用 `Prototype/公共导航.css`、`Prototype/分页器.css`、`Prototype/筛选布局.css`，以及共享字体源 `src/styles/global.css`（后台页由公共导航层统一引入，独立页直接引用）；
- 数据：mock data 内联（见第六章）；
- 图片：用占位（色块/图标/`https://placehold.co`），不依赖本地图片。
**禁止**：白名单以外的本地 `.css`/`.js`/图片依赖、构建工具、模块 import。公共层文件属于单文件自包含规则的唯一例外，必须使用项目列明的文件名并统一缓存参数；不得复制其实现到页面内形成分叉。

### 4.1 SystemFrame 与模块运行模式（强制）

- `系统框架.html` 是唯一顶层运行外壳（SystemFrame），独占 BrowserChrome、TopBar、Sidebar、全局智能助手、全局 Toast / Popover / Dialog / Drawer 和；
- 除 `index.html`、`设计系统.html`、`登录.html` 外，所有后台业务文件都作为 Router Outlet 的 iframe 子文档加载，公开地址为 `index.html?page=<key>`，由索引宿主承载唯一 SystemFrame；
- 业务模块只负责业务内容、业务弹层、业务 Mock 数据与业务内容，不得再次创建 BrowserChrome、TopBar、Sidebar、全局助手或全局弹层；
- `公共导航.js` 在顶层 SystemFrame 中负责壳层和路由；检测到页面处于 iframe 嵌入模式时，只保留模块所需的公共样式、图标、分页等增强，不得调用壳层创建逻辑或生成任何全局壳层节点；
- 所有后台业务模块必须在 `</head>` 前按“`公共导航.css` 在前、`公共导航.js` 在后”的顺序直接引用同一缓存版本；公共脚本完成直开跳转或嵌入适配后再显示页面，不得把公共资源移回 `<body>` 底部造成旧壳闪现；
- 业务文件被顶层直接打开时，必须将自身映射为 `<key>` 并跳转到根 `../index.html?page=<key>`；处于目标 SystemFrame iframe 内时不得再次跳转；
- 相对路径、查询参数解析和 iframe `src` 必须兼容 `file://`，不得把本地服务器作为必要前提。

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

1. **读三份**：`claude.md`（本文件）+ `design.md` + 该页面的模块 `PRD.md`；
2. **搭结构**：SystemFrame 搭唯一 App Shell；后台模块只搭 iframe 内业务结构与业务弹层；
3. **套 token**：注入 design.md 的 Tailwind config；
4. **填 mock data**：内联真实感数据，JS 渲染；
5. **做交互**：tab/弹窗/表单校验/hover/筛选/跳转；

7. **接导航**：登记稳定 page key，接入 `index.html?page=<key>`，验证直开回框架、前进后退、刷新与高亮；
8. **自检**：对照第十二章清单逐条核对；
9. **同步文档**：页面业务或可复用视觉规则发生变化时，同步更新模块 PRD、`design.md`、`Prototype/设计系统.html`；工程流程变化统一更新 `AGENTS.md`，不得形成第二套 Agent 规则源；
10. **输出页面**：双击 SystemFrame 或业务文件均可预览；业务 iframe 无重复壳层；只引用公共层白名单中的本地资源且无报错。

---

## 十二、交付前自检清单（每页必过）

- [ ] `file://` 双击可预览；业务文件直开自动回 SystemFrame；公共资源缓存参数与全站一致
- [ ] Tailwind CDN + Lucide，未引入禁用库（无 Vue/React/jQuery）
- [ ] 色值/字号/圆角/间距全部引用 design.md，无自造值
- [ ] 语义色用途正确（primary/success/warning/danger/info）
- [ ] 响应式：桌面正常，平板不溢出，表格可横向滚动
- [ ] Mock data 真实可信、覆盖多状态、≥8 条、数字用 mono
- [ ] 基础交互可用：tab/弹窗/表单校验/hover/筛选/跳转

- [ ] SystemFrame 独占全局壳层与全局弹层；业务 iframe 仅显示业务内容、业务弹层和从 1 开始的业务内容
- [ ] 转写自对应模块 PRD
- [ ] 自定义下拉、Popover、菜单展开后父区块自动适配，无裁切、重叠和意外页面跳动
- [ ] 页面业务与视觉调整已同步模块 PRD、design.md 和 HTML 设计系统
- [ ] 后台跨页入口使用 `index.html?page=<key>`；前进、后退、刷新后 iframe 与当前高亮一致
- [ ] 语义化标签 + 分区注释 + 规范类名 + JS 分区注释
- [ ] 控制台无 error，Lucide 图标正常渲染
- [ ] 代码规范、可读、开发可复用

---

## 十三、红线（禁止事项）

- ❌ 自造色值/字号/圆角，偏离 design.md
- ❌ 引入 Vue/React/jQuery 或未列出的库（Chart.js 及必要时 ECharts CDN 除外，见第二节）
- ❌ 依赖公共层白名单以外的本地 CSS/JS/图片，或复制公共实现形成页面分叉
- ❌ 在业务 iframe 内再次创建 BrowserChrome、TopBar、Sidebar、全局助手、全局弹层或嵌套 SystemFrame
- ❌ 后台模块直接跳转另一业务 `.html`，绕过 `index.html?page=<key>`
- ❌ 用 emoji 代替图标
- ❌ 静态堆数据（不用 mock data 驱动）
- ❌ 交互不可用（纯静态图）
- ❌ 遗漏交互
- ❌ 代码零注释、结构混乱、不可复用

---

## 十四、调用方式

每次制作页面时，指令示例：

> “阅读 `claude.md`、`design.md` 和 `PRD/编辑浏览器PRD.md`，基于 `Prototype/系统框架.html` 制作 `Prototype/编辑浏览器.html`，严格遵守三份文档并在完成后按自检清单核对。”

---

**说明**：本文件为行为约束，视觉以 `design.md` 为准、内容以各 `PRD.md` 为准。三者分工不重叠，共同约束 Claude Code 产出一致、规范、可交付的高保真原型。
