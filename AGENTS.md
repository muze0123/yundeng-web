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
**每个页面的交付标准**：一个自包含、可通过统一系统框架预览、响应式、带真实感 mock 数据、带基础交互、带交互标注的 `.html` 文件。业务模块文件直接双击时必须自动回到系统框架，不得以第二套 App Shell 独立运行。

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

**每个页面 = 一个独立** `.html`，无需构建或本地服务器；但后台业务模块的运行入口统一为 `Prototype/系统框架.html?page=<key>`。直接双击业务模块文件时，应使用相对路径自动回到对应的系统框架 URL，再由 Router Outlet 加载该模块，因此“可独立预览”不等于“可独立创建 App Shell”。

- CSS：Tailwind CDN + 页面内 `<style>`；允许按页面需要引用 `Prototype/公共导航.css`、`Prototype/分页器.css`、`Prototype/筛选布局.css`，以及共享字体源 `src/styles/global.css`（后台页由公共导航层统一引入，独立页直接引用）；
- JS：页面内 `<script>`；允许按页面需要引用 `Prototype/公共导航.js`、`Prototype/分页器.js`、`Prototype/标注交互.js`；旧的 `Prototype/侧栏交互.js` 已废弃，不得新增引用；
- 数据：mock data 内联（见第六章）；
- 图片：用占位（色块/图标/`https://placehold.co`），不依赖本地图片。
**禁止**：白名单以外的本地 `.css`/`.js`/图片依赖、构建工具、模块 import。公共层文件属于单文件自包含规则的唯一例外，必须使用项目列明的文件名并统一缓存参数；不得复制其实现到页面内形成分叉。

### 4.1 SystemFrame 与模块运行模式（强制）

- `系统框架.html` 是唯一顶层运行外壳（SystemFrame），独占 BrowserChrome、TopBar、Sidebar、全局智能助手、全局 Toast / Popover / Dialog / Drawer 和全局标注开关；
- 除 `index.html`、`设计系统.html`、`登录.html` 外，所有后台业务文件都作为 Router Outlet 的 iframe 子文档加载，标准地址为 `系统框架.html?page=<key>`；
- 业务模块只负责业务内容、业务弹层、业务 Mock 数据与业务标注，不得再次创建 BrowserChrome、TopBar、Sidebar、全局助手或全局弹层；
- `公共导航.js` 在顶层 SystemFrame 中负责壳层和路由；检测到页面处于 iframe 嵌入模式时，只保留模块所需的公共样式、图标、分页等增强，不得调用 `ensureShell()`、`setupBrowserFrame()`、`setupTopbar()`、`setupAssistant()` 或生成任何全局壳层节点；
- 所有后台业务模块必须在 `</head>` 前按“`公共导航.css` 在前、`公共导航.js` 在后”的顺序直接引用同一缓存版本。公共脚本负责在首帧完成直开跳转或嵌入适配后再显示页面，禁止把这两个公共资源移回 `<body>` 底部造成旧壳闪现；
- 业务文件被顶层直接打开时，必须将自身映射为 `<key>` 并跳转到相邻的 `系统框架.html?page=<key>`；处于目标 SystemFrame iframe 内时不得再次跳转，避免重定向循环；
- 相对路径、查询参数解析和 iframe `src` 必须兼容 `file://`。验收以直接双击 `系统框架.html` 或任一业务模块文件均可进入正确模块为准，不得把本地服务器作为必要前提。

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



## 七、交互标注系统 — Portal 独立图层（强制，本项目特色）

**核心思路**：标注徽标与页面 DOM 完全解耦——页面元素只需标记 `data-anno="N"`，徽标通过 `getBoundingClientRect()` 动态计算位置，统一渲染在 `<body>` 级独立图层。彻底解决 `overflow:hidden` 裁剪、Flex/Grid 布局错位、z-index 嵌套等问题。

> SystemFrame 与每个 ModuleFrame 文档各自维护独立的 Portal 标注层（`#annoLayer` + `#annoPopup` + `renderAnnoBadges()`）。新增业务页面时只接入模块级标注能力：① 在业务功能元素上加 `data-anno`；② 在模块自己的 `annotations` 对象中填说明；不得为此复制 SystemFrame 壳层。



### 7.1 页面模块标记（零污染）

在需要标注的功能元素上直接添加 `data-anno="N"` 属性：

```html
<!-- ✅ 正确：标记在具体功能元素上（按钮、标题、输入框等） -->
<h2 data-anno="1">数据概览</h2>
<button data-anno="2" class="btn btn-primary">添加</button>
<input data-anno="3" type="text" placeholder="搜索">
<!-- ❌ 错误：标记在全宽容器 div 上（徽标会定位到容器右边缘而非功能元素） -->
<div class="flex justify-between mb-4" data-anno="1">
  <h2>标题</h2><button>按钮</button>
</div>
```



### 7.2 标注说明定义

```js
var annotations = {
  1: { title: "数据概览卡片", desc: [
    "触发：页面加载时渲染",
    "响应：展示4个KPI统计指标",
    "规则：数字用 mono 字体，趋势用语义色"
  ]},
  // 每个功能点一条，编号页面内唯一、按阅读顺序
};
```



### 7.3 Portal 图层结构（框架内置）

```html
<!-- 标注徽标层（body 直属，fixed 定位，完全脱离页面文档流） -->
<div id="annoLayer" style="position:fixed;inset:0;pointer-events:none;z-index:9998;"></div>
<!-- 可长按拖拽的浮动开关（固定吸附页面右侧） -->
<button id="annoToggle" class="fixed z-[9997]" style="right:8px;top:120px;cursor:grab;" ...>
  <i data-lucide="tags"></i><span>显示标注</span>
</button>
<!-- 说明弹窗（居中，有遮罩，点击遮罩关闭） -->
<div id="annoPopup" class="hidden fixed inset-0 z-[9999]" ...>...</div>
```



### 7.4 核心 JS（框架内置，无需修改）


| 函数 | 作用 |
| --- | --- |
| `renderAnnoBadges()` | 遍历当前业务标注范围内的 `[data-anno]`（栈非空时仅查询栈顶业务容器），`getBoundingClientRect()` 计算元素右上角坐标，生成徽标到 `#annoLayer` |
| `showAnnoPopup(id)` | 根据 `annotations[id]` 渲染说明弹窗，每次打开自动居中 |
| `closeAnnoPopup()` | 关闭弹窗 |
| `pushAnnoScope(el)` | 将标注范围限定在 `el` 容器内（压栈 + 重渲染），打开抽屉/弹窗时调用 |
| `popAnnoScope(el)` | 从栈中移除 `el`（出栈 + 重渲染），关闭抽屉/弹窗时调用 |
| 浮动开关 | 标注默认隐藏（`annoVisible=false`），图标后默认显示“显示标注”；点击后显示标注并切换为“隐藏标注”，再次点击恢复默认隐藏状态；长按 350ms 后可沿页面右侧上下拖拽，拖拽时不触发切换 |
| **弹窗拖拽** | 标题栏 `grip-horizontal` 图标 + 标题区域可拖拽移动弹窗位置 |


- 徽标视觉：`20×20px` 圆形，primary 底白字，`box-shadow` 浮起，hover 放大；
- 徽标定位：元素 `getBoundingClientRect().top - 10` / `.right - 10`（精确对齐右上角）；
- **重算机制**：`mainContent` 滚动事件 + `window.resize` 事件自动触发 `renderAnnoBadges()`；
- 说明文字：正文 14px，标题 16px，`leading-relaxed`。
- 浮动开关视觉：高度 32px、左右内边距 12px、图标与文字间距 6px、胶囊圆角；始终吸附页面右侧 8px。
- 浮动开关拖拽：只调整纵向位置，限制在视口安全区内；松手后保存位置，同一浏览器再次打开时恢复。



### 7.5 覆盖要求

每个**有交互或有业务规则**的功能点都要标注：筛选、按钮、状态、弹窗触发、表单、跳转和特殊业务规则。纯静态展示可不标。复用系统框架的模块页面只标注模块业务内容与本页操作栏，不为侧栏、TopBar、系统通知、语言、账号菜单和智能助手生成编号。

### 7.6 标注同步维护（强制）

> 标注编号与页面功能一一对应。增删功能时必须同步维护标注。
> 模块页面编号必须从 1 开始连续排列，禁止先为系统框架预留编号后再整体偏移业务编号。
>
>
> | 场景          | 操作                                                           |
> | ----------- | ------------------------------------------------------------ |
> | **删除功能/区块** | 同步删除对应的 `data-anno` 属性、`annotations` 条目，剩余编号**重新连续排列**（不留空号） |
> | **新增功能/区块** | 按当前最大编号 +1 追加，或插入后重新编号                                       |
> | **调整功能顺序**  | 按页面阅读顺序（上→下、左→右）重新编号，保证视觉扫描连贯                                |
> | **模态/弹窗标注** | `data-anno` 标在 modal/dialog 的**内部容器**上；打开模态时调用 `pushAnnoScope(containerEl)` 将标注范围限定在弹窗内（页面级徽标自动隐藏），关闭时调用 `popAnnoScope(containerEl)` 恢复。详见 §7.9 |
| **抽屉/侧滑面板标注** | 同模态：打开时 `pushAnnoScope(panelEl)`，关闭时 `popAnnoScope(panelEl)` |
>

```js
// ❌ 错误：删了 #3 功能但留着空号
annotations = { 1:{...}, 2:{...}, 4:{...}, 5:{...} }

// ✅ 正确：删除后重新编号为连续
annotations = { 1:{...}, 2:{...}, 3:{...}, 4:{...} }
```



### 7.7 标注对齐红线（强制）

> `getBoundingClientRect()` 返回的是元素物理宽度。若 `data-anno` 标在全宽 `div` 上，徽标会定位到屏幕最右侧而非功能元素右上角。
>
>
> | 规则                     | 说明                                                                                          |
> | ---------------------- | ------------------------------------------------------------------------------------------- |
> | **禁止标全宽容器**            | 不得将 `data-anno` 挂在外层全宽 `div` 上                                                              |
> | **标在核心元素上**            | 必须将 `data-anno` 挂在具体功能元素上（标题 h2、按钮 button、输入框 input 等）                                      |
> | **块级标题设 inline-block** | 若标注目标是 `h1`–`h6`（块级元素），需添加 `class="inline-block"` 使其 `getBoundingClientRect().width` 紧贴文字宽度 |
> | **智能回退**               | JS 内置 `resolveAnnoTarget()`：若标记元素宽度 >800px 或 >70% 视口，自动向下查找第一个 h1-h6/button/input 作为定位目标    |
>

```html
<!-- ❌ 错误：标在外层全宽容器上 -->
<div data-anno="1" class="w-full bg-white p-4">
  <h2>智能储物柜选区</h2>
</div>
<!-- ✅ 正确：标在具体元素上，块级标题加 inline-block -->
<div class="w-full bg-white p-4">
  <h2 data-anno="1" class="inline-block text-[18px] font-bold">智能储物柜选区</h2>
</div>
<!-- ✅ 正确：标在按钮/输入框等 inline 元素上 -->
<button data-anno="2" class="btn btn-primary">添加</button>
<input data-anno="3" type="text" placeholder="搜索">
```



### 7.8 新页面接入步骤

1. 从现有模块页面或公共标注脚本接入模块级 Portal 图层与 JS（含智能定位 `resolveAnnoTarget`），不复制 BrowserChrome、TopBar、Sidebar 等壳层 DOM
2. 在**具体业务功能元素**上添加 `data-anno="N"`，块级元素加 `inline-block`
3. 在模块自己的 `annotations` 对象中填入对应标题和说明，编号从 1 连续排列
4. 在 iframe 内验证徽标准确定位、业务弹层作用域正常，且不与父级 SystemFrame 全局标注混用

### 7.9 抽屉/弹窗标注作用域（强制，红线）

> **核心问题**：`#annoLayer` 的 `z-index: 9998` 高于所有抽屉/弹窗。若不做作用域隔离，打开抽屉/弹窗时页面级标注徽标会浮在抽屉上方，造成视觉混淆。

**解决方案**：`annoScopeStack` 栈机制——打开抽屉/弹窗时将标注范围限定在其内部，关闭后恢复。

```js
// 框架内置的栈机制（每个页面 JS 中已包含）
var annoScopeStack = [];

function pushAnnoScope(el) {
  // 去重后压入栈顶，renderAnnoBadges() 自动只用栈顶元素作为查询容器
  var idx = annoScopeStack.indexOf(el);
  if (idx >= 0) annoScopeStack.splice(idx, 1);
  annoScopeStack.push(el);
  renderAnnoBadges();
}

function popAnnoScope(el) {
  var idx = annoScopeStack.indexOf(el);
  if (idx >= 0) annoScopeStack.splice(idx, 1);
  renderAnnoBadges(); // 恢复到上一级作用域（栈为空 = 全页面）
}
```


| 规则 | 说明 |
|------|------|
| **打开抽屉/弹窗时** | 必须在 `classList.remove('hidden')` 之后调用 `pushAnnoScope(containerEl)`，将标注范围限定在该容器内 |
| **关闭抽屉/弹窗时** | 必须在 `classList.add('hidden')` 之后调用 `popAnnoScope(containerEl)`，恢复上一级标注范围 |
| **支持嵌套** | 抽屉内打开弹窗 → push 弹窗；弹窗关闭 → pop 回抽屉；抽屉关闭 → pop 回全页面 |
| **标注元素位置** | 抽屉/弹窗内的 `data-anno` 必须标在弹窗**内部容器**上（如 `.drawer-panel`、`.modal-box`），不能标在遮罩层上 |
| **容器引用** | 传入的 `el` 必须是稳定的 DOM 元素引用（如 `document.getElementById('roleDrawerPanel')`），确保 push 和 pop 使用同一引用 |

**典型接入示例**：

```js
// 打开抽屉
function openDrawer() {
  document.getElementById('myDrawerOverlay').classList.remove('hidden');
  // ... 填充表单数据 ...
  pushAnnoScope(document.getElementById('myDrawerPanel'));
}

// 关闭抽屉
function closeDrawer() {
  document.getElementById('myDrawerOverlay').classList.add('hidden');
  popAnnoScope(document.getElementById('myDrawerPanel'));
}

// 打开弹窗（可能从抽屉内触发，支持嵌套）
function openModal() {
  document.getElementById('myModal').classList.remove('hidden');
  pushAnnoScope(document.getElementById('myModal'));
}

// 关闭弹窗
function closeModal() {
  document.getElementById('myModal').classList.add('hidden');
  popAnnoScope(document.getElementById('myModal'));
}
```

> **注意**：`renderAnnoBadges()` 已内置栈感知——栈非空时 `querySelectorAll('[data-anno]')` 仅查询栈顶容器内的元素，页面级徽标自动不渲染。无需额外过滤逻辑。

### 7.10 SystemFrame 与 iframe 标注边界（强制）

- SystemFrame 的 BrowserChrome、TopBar、Sidebar、全局助手和全局弹层只由顶层文档标注；模块 iframe 不重复标注这些元素，也不向父文档复制全局编号；
- iframe 内只保留业务标注，编号从 1 开始连续排列；业务弹层打开时只在 iframe 内执行 `pushAnnoScope`，不得触碰父文档的 `#annoLayer`；
- 父文档切换 `?page=<key>`、前进、后退、刷新或恢复菜单高亮时，应等待 iframe 加载完成后重新计算当前模块的业务标注；iframe 重载不得让全局标注开关、助手或壳层节点重复生成；
- 业务模块需要请求外层路由时，通过约定的父子消息/路由回调传递 `<key>`，不得在 iframe 内嵌套另一个 `系统框架.html`；`file://` 下校验消息来源时不得硬编码非空 origin。

### 7.11 标注自动化执行顺序（强制）

1. 从目标模块 PRD 提取所有交互点与业务规则，按页面阅读顺序排列；不得用主观补全替代 PRD。
2. 修改已有页面前，完整盘点现有 `data-anno`、`annotations`、`annoScopeStack` 及弹窗/抽屉作用域，确认新增、删除和重排的影响范围。
3. 按 §7.7 将编号挂在具体功能元素上；一个功能点对应一个标注，不得为了省事让多个独立功能共用同一个标注。
4. `annotations` 统一使用 `{ title, desc: ["触发：...", "响应：...", "规则：..."] }` 结构，内容转写自 PRD；不可避免的推断必须明确标记。
5. 逐一检查弹窗与抽屉的打开、关闭路径，确保使用同一个稳定 DOM 引用成对调用 `pushAnnoScope()` / `popAnnoScope()`。
6. 修改后逐项比对 DOM 编号与 `annotations` 键，保证一一对应、从 1 连续排列，并验证嵌套作用域恢复正确。
7. 批量修改 page key、缓存版本或公共资源引用后，必须复核 Portal 节点、标注引擎与作用域逻辑未被误删或破坏。

---



## 八、多页面组织与导航（强制）



### 8.1 文件组织

```
/Prototype
  ├─ index.html            ← 入口/导航页（汇总所有原型，必做）
  ├─ 登录.html              ← 登录页（独立页面，无侧边栏）
  ├─ 设计系统.html          ← 设计规范页（独立展示，不进入业务壳）
  ├─ 系统框架.html           ← **唯一系统框架模板**（所有模块页面的结构基准）
  ├─ 成员管理.html           ← 成员管理
  ├─ 部门管理.html           ← 部门管理
  ├─ 角色管理.html           ← 角色管理
  ├─ 账号信息.html           ← 账号信息
  ├─ 消息设置.html           ← 消息设置
  ├─ 消息中心.html           ← 消息中心
  ├─ 任务中心.html           ← 任务列表
  └─ ...
```

**页面布局（强制）**：`Prototype/系统框架.html` 是云登平台所有模块页面的唯一运行外壳。除 `index.html`、`设计系统.html` 和 `登录.html` 外，所有后台页面都只提供 iframe 业务文档；用户访问 `系统框架.html?page=<key>` 时由 Router Outlet 加载模块，直接访问业务文件时自动回到该 URL。业务文件不得自行重建或分叉系统壳层。

- **顶栏**（56px）：左侧 Logo + 系统名（点击回首页），右侧任务列表/消息中心（红色角标）/账号信息图标
- **侧边栏**（220px）：可展开菜单，当前页高亮（`active-l1` 蓝色字+图标 / `active-l2` 蓝底蓝字），移动端可折叠。菜单交互见下方「侧边栏菜单交互规范」
- **主内容区**（flex-1，`bg-page` 背景）：SystemFrame 只提供无边框、无额外圆角和外层内边距的 iframe Router Outlet；模块在自身文档内按 `design.md` 组织筛选区、数据区、表格、表单控件与业务弹层
- 文件名用**中文语义化命名**（如 `成员管理.html`、`订单看板.html`），并在公共路由表中登记稳定的 `<key>`；
- 左侧菜单只由 SystemFrame 渲染，叶子菜单更新 `系统框架.html?page=<key>`，不得在业务 iframe 内再渲染侧栏或直接打开另一套后台壳；
- 当前高亮、BrowserChrome 标签标题与 iframe `src` 必须由同一个 `<key>` 派生；TopBar 不显示功能模块名称、面包屑或品牌后分隔线，业务页不能自行修改顶层高亮。



### 8.1.1 SystemFrame 路由与侧边栏交互规范（强制）

> `Prototype/系统框架.html` 是唯一壳层宿主；`Prototype/公共导航.js` 与 `Prototype/公共导航.css` 提供统一路由注册、壳层交互和嵌入模式增强。所有 HTML 统一引用同一缓存版本；业务页面只声明业务主体，不得复制或另行修改公共导航行为。
>
>
> | 操作 | 行为 |
> | --- | --- |
> | 点击无子菜单的一级菜单 | 收起全部二级菜单，更新顶层 `?page=<key>` 并写入浏览器历史，加载 iframe，选中高亮（`active-l1`） |
> | 点击有子菜单的一级菜单 | 展开/收起子菜单（仅切换，不导航） |
> | 已展开的一级菜单再次点击 | 收起子菜单 |
> | 点击二级菜单 | 同组切换时保持所属分组和其他手动展开分组；跨分组切换时收起原分组、仅保留目标分组展开；然后更新 `?page=<key>`、加载 iframe，二级菜单 + 所属一级菜单双高亮 |
> | 点击已选中的二级菜单 | 重新进入当前 SystemFrame 路由，不创建第二层壳 |
> | 展开其他一级菜单 | 仅点击分组标题时，团队与自动化可临时同时展开；同一分组再次点击时仅收起自身；同组二级切换保留手动展开状态，跨组或进入一级叶子时按目标收起无关分组 |
> | 浏览器前进 / 后退 | 通过顶层浏览器历史恢复 iframe、标签标题和唯一菜单高亮，并按恢复后的当前路由归一化分组展开状态 |
> | 刷新 SystemFrame | 重新解析当前 `?page=<key>` 并恢复同一模块及对应分组展开状态；无效 key 回退默认模块并替换为有效顶层 URL |

- 一级叶子菜单和二级菜单都必须绑定稳定的 `data-page="<key>"`；有子菜单的一级分组只绑定分组标识，不绑定业务文件路径；
- 公共路由表必须维护 `<key> → 文件名 / 标题 / 所属分组` 映射。SystemFrame 根据 key 设置 iframe `src`，业务文件名和中文标签不得直接充当可变状态；
- 菜单点击、模块内跨页请求和 `index.html` 卡片统一进入 `系统框架.html?page=<key>`，禁止使用 `系统框架.html#模块`，也禁止让 iframe 内的普通链接把另一个完整业务文件嵌套进当前模块；
- SystemFrame 的有效模块切换必须形成顶层浏览器历史记录；首次载入、前进、后退和刷新都从当前 `?page=<key>` 恢复模块及唯一高亮，无效 key 使用默认模块替换当前历史项，不得留下 URL、高亮和内容不一致的状态；
- 模块内部自己的筛选 query/hash 由模块文档管理，不得覆盖外层 `page` 参数；需要刷新恢复时通过父子消息协议同步为外层 `moduleSearch` / `moduleHash` 命名空间，SystemFrame 只替换当前历史项，不重新加载模块。



### 8.1.2 路由注册与全局同步（强制，红线）

> **核心规则**：`Prototype/公共导航.js` 中的路由/菜单配置是 `<key> → 模块文件` 的唯一基准，`Prototype/系统框架.html` 是唯一运行外壳。新增、改名、删除模块或调整菜单结构时，必须同步更新公共路由表、SystemFrame、`index.html` 与业务文件的直开回框架映射；不再把侧栏 HTML 批量复制到每个业务页面。

| 变更场景 | 同步范围 | 操作 |
|----------|----------|------|
| **新建 HTML 原型页面** | 公共路由表 + `系统框架.html` + `index.html` + 新模块文件 | ① 分配稳定 key 与文件映射；② 添加菜单项；③ `index.html` 卡片链接到 `系统框架.html?page=<key>`；④ 模块直开可回框架 |
| **修改模块名或 HTML 文件名** | 公共路由表 + `系统框架.html` + `index.html` + 跨模块链接 | 更新 key 映射、标题、iframe 文件名和所有 SystemFrame URL；稳定 key 非必要不得变化 |
| **删除模块或 HTML 原型页面** | 公共路由表 + `系统框架.html` + `index.html` + 跨模块链接 | 移除路由与菜单，清理失效 URL，并为历史中的旧 key 提供默认模块回退 |
| **调整菜单层级/结构** | 公共路由表 + `系统框架.html` | 更新分组、唯一高亮、展开恢复与权限树；业务模块文件不复制侧栏结构 |

**同步检查清单**（每次变更后必过）：

- [ ] `Prototype/系统框架.html` — iframe Router Outlet、历史恢复、无效 key 回退与唯一高亮正常
- [ ] 所有业务 `.html` — iframe 内不创建壳层；顶层直开自动回 `系统框架.html?page=<key>`
- [ ] `index.html` — 后台卡片与侧边栏菜单一一对应，链接使用 SystemFrame URL
- [ ] 全局搜索旧文件名/旧 key/直接业务页跳转 → 零失效引用
- [ ] 前进、后退、刷新后 iframe `src`、BrowserChrome 标题和菜单高亮一致；TopBar 始终不显示模块名称
- [ ] `file://` 直接双击 SystemFrame 与业务文件均可预览，不要求本地服务器
- [ ] 权限树、快捷入口等硬编码菜单引用已更新

> **执行方式**：路由或文件名变更使用脚本批量更新 URL 与 key 引用，不再批量复制侧栏 DOM。替换后运行全局搜索验证旧标识零残留。

### 8.2 index.html 导航页（必做）

- 汇总所有原型页面，分组（后台系统 / 用户端）；
- 每页一张卡片：页面名 + 简述 + 图标 + "打开"链接；后台模块统一链接 `系统框架.html?page=<key>`，特殊页仍直接链接自身；
- 作为交付预览总入口。

---



## 九、响应式（强制）

- 后台面向桌面（≥1280px），必须优雅适配到平板（768px）：侧边栏可折叠、表格 `overflow-x-auto` 横向滚动、不溢出不挤压；
- 用 Tailwind 断点（sm/md/lg/xl）；布局用 Flex/Grid，避免固定像素宽度溢出。

---



## 十、代码质量（交付给开发，须规范）

- **语义化标签**：`<header><nav><main><table><form>` 等，不滥用 `<div>`；
- **结构注释**：区块用注释分隔（`<!-- 筛选区 -->`、`<!-- 订单表格 -->`）；
- **类名规范**：语义化、一致（功能命名/BEM 风格）；
- **JS 组织**：mock data / 渲染 / 交互 / 标注分区，函数拆分，命名清晰，关键逻辑注释；
- **无报错**：控制台无 error，`lucide.createIcons()` 正确初始化；
- **可读可复用**：开发能看懂结构、复用组件片段。

---



## 十一、固定工作流程（每页必守）

1. **加载上下文**：读取 `AGENTS.md`、`design.md`、目标模块 PRD，并按任务范围核对 `Prototype/系统框架.html`、公共路由与相关共享资源。
2. **盘点差异**：修改已有页面前完整读取目标文件，识别现有业务结构、用户改动、`data-anno`、`annotations`、`annoScopeStack`、弹层和路由依赖，禁止覆盖无关改动。
3. **确定所有权并搭结构**：SystemFrame 只承载唯一 App Shell；后台模块只承载 iframe 内业务结构与业务弹层；用户端按对应 PRD 使用独立容器。
4. **套用规范**：注入 `design.md` 的 Tailwind config，按页面类型使用已有筛选区、数据区、表格、分页器、表单和 Dialog 规范；数字、订单号、金额与时间戳使用 mono 字体。
5. **填充 Mock 数据**：内联真实感数据并由 JS 渲染，覆盖足够条数和多种业务状态。
6. **实现交互**：用原生 JS 完成 Tab、弹窗/抽屉、表单校验与字符计数、hover、筛选、分页和跳转，并覆盖空态、错误态与边界状态。
7. **接入标注**：按 §7.11 从 PRD 转写 `annotations`，添加连续编号、Portal 图层及弹层作用域；不得把多个功能合并到一个标注。
8. **接入导航**：登记稳定 page key，接入 `系统框架.html?page=<key>`，验证直开回框架、前进、后退、刷新与菜单高亮一致。
9. **同步文档**：业务逻辑或交互变化同步模块 PRD；可复用视觉规则同步 `design.md` 与 `Prototype/设计系统.html`；工程流程变化只在 `AGENTS.md` 维护，若需兼容 `claude.md` 则从本文件同步，不得在镜像中新增独立规则。
10. **验证与交付**：修复任务范围内已知问题，对照第十二章逐项自检；优先用真实浏览器验证 `file://`、交互和控制台，确认生成物完整且业务 iframe 无重复壳层。Git 或部署动作仅在用户明确要求时执行。

### 11.1 编辑与验证纪律

- 编辑范围必须与任务一致，采用可审查的增量 Diff；遇到工作区已有改动时保留并兼容，不得擅自回滚、覆盖或顺手重构无关内容。
- 批量替换后必须复核路由 key、公共资源缓存参数、Portal 节点与作用域逻辑，并全局检索旧标识和失效引用。
- 能运行浏览器时必须做真实页面、关键交互和控制台验证；无法运行时执行静态结构、脚本语法与引用检查，并在交付说明中明确未覆盖的运行时风险。
- 未获得真实运行证据时，不得把静态检查描述为“控制台零报错”或“交互已通过”。
- 交付物本身必须完整，禁止用“其余代码不变”、`// ...` 等省略占位代替应存在的 HTML、CSS 或 JS；无需在回复中重复粘贴整个文件。

---



## 十二、交付前自检清单（每页必过）

- [ ] 修改已有页面前已完整读取目标文件，并盘点现有标注编号、作用域、弹层、路由依赖与用户改动
- [ ] `file://` 双击可预览；业务文件直开自动回 SystemFrame；仅按需引用项目公共层白名单文件，且缓存参数与全站一致
- [ ] Tailwind CDN + Lucide，未引入禁用库（无 Vue/React/jQuery）
- [ ] 色值/字号/圆角/间距全部引用 design.md，无自造值
- [ ] 语义色用途正确（primary/success/warning/danger/info）
- [ ] 响应式：桌面正常，平板不溢出，表格可横向滚动
- [ ] Mock data 真实可信、覆盖多状态、≥8 条、数字用 mono
- [ ] 适用的列表页遵循 `design.md` 的页面区块、筛选栅格、标签冒号、表格左对齐与分页器归属规则；跳页输入框默认值为 1
- [ ] 数字、订单号、金额和时间戳使用 mono；表单、字符计数与 Dialog 类型符合 `design.md` 和模块 PRD
- [ ] 基础交互可用：tab/弹窗/表单校验/hover/筛选/跳转
- [ ] **交互标注完整**：每个交互/规则点有徽标，点击弹说明，全局可显隐
- [ ] SystemFrame 独占 BrowserChrome / TopBar / Sidebar / 全局助手 / 全局弹层；业务 iframe 仅显示业务内容、业务弹层及从 1 连续编号的业务标注
- [ ] 标注内容转写自对应模块 PRD；DOM `data-anno` 与 `annotations` 一一对应、编号连续，独立功能不共用标注
- [ ] 每条标注说明包含“触发 / 响应 / 规则”，弹窗与抽屉所有开关路径均成对维护标注作用域
- [ ] 自定义下拉、Popover、菜单展开后父区块自动适配，无裁切、重叠和意外页面跳动
- [ ] 页面业务与视觉调整已同步模块 PRD、design.md 和 HTML 设计系统
- [ ] `index.html` 与模块内跨页入口使用 `系统框架.html?page=<key>`；前进、后退、刷新后 iframe 与侧边栏当前页高亮一致
- [ ] 批量替换未破坏路由、缓存版本、Portal 节点或标注引擎；旧文件名、旧 key 和失效引用已清零
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
- ❌ 让后台模块直接跳转到另一业务 `.html`，绕过 `系统框架.html?page=<key>` 或破坏浏览器历史恢复
- ❌ 用 emoji 代替图标
- ❌ 静态堆数据（不用 mock data 驱动）
- ❌ 交互不可用（纯静态图）
- ❌ 遗漏交互标注系统
- ❌ 多个独立功能共用一个标注，或批量替换误删 Portal 节点、标注引擎和作用域逻辑
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

# [云登pc端] recent context, 2026-08-22 10:28am GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 1 obs (70t read) | 0t work

### Aug 22, 2026
1816 10:15a ✅ DOHOZZ项目部署相关文件清理请求
</claude-mem-context>