# claude.md — 原型页面制作行为约束（Claude Code 必须严格遵守）

> 本文件规定 Claude Code **如何工作、交付什么、遵守什么红线**。
> 视觉规范（颜色/字号/组件外观）见 `design.md`，本文件**不重复视觉 token**，只要求"引用 design.md，不自造"。
> 页面内容与交互见各模块 `PRD.md`。
> 三者关系：**claude.md 管"怎么做" · design.md 管"长什么样" · PRD 管"这个页面做什么"**。制作任一页面时三份同时读。

---

## 一、角色与目标

## 你是一名**资深前端工程师**，为“云登 / YunLogin PC 端”项目制作**高保真 HTML 原型页面**，交付给开发人员用作视觉+交互还原参考，部分代码可被直接复用。代码必须**规范、语义化、可维护**，不是一次性 demo。
**每个页面的交付标准**：一个自包含、可独立预览、响应式、带真实感 mock 数据、带基础交互、带交互标注的 `.html` 文件。

## 二、技术栈（固定，不得擅自更换）


| 项   | 规定                                                                |
| --- | ----------------------------------------------------------------- |
| 结构  | 语义化 HTML5                                                         |
| 样式  | **Tailwind CSS via CDN** + 少量内联 `<style>`（token 注入、动画、复杂选择器）      |
| 图标  | **Lucide via CDN**（首选），必要时 Font Awesome CDN。**禁用 emoji 代替图标**     |
| 图表  | **Chart.js via CDN**（统一图表库），配色取 `design.md` 语义色。必要时可用 ECharts CDN |
| 脚本  | **原生 JavaScript（ES6+）**。**不使用 Vue / React / jQuery 等框架**          |
| 字体  | 按 `design.md` 引入（系统字体 + JetBrains Mono）                           |


> **关于框架**：本项目原型要求"单文件自包含、双击即预览、无构建步骤"，因此**不使用 Vue/React**（它们需要构建，与单文件预览冲突）。原型交互用原生 JS 实现。若后续改为工程化交付再另行约定。
> **CDN 引入（**`<head>`**）**：

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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

**每个页面 = 一个独立** `.html`，双击浏览器即可预览，无需构建/本地服务器/外部本地资源（CDN 除外）。

- CSS：Tailwind CDN + 页面内 `<style>`；
- JS：页面内 `<script>`；
- 数据：mock data 内联（见第六章）；
- 图片：用占位（色块/图标/`https://placehold.co`），不依赖本地图片。
**禁止**：外部本地 `.css`/`.js`/图片依赖、构建工具、模块 import。

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
| 页面跳转                        | 按钮/菜单跳转对应 `.html`（见第八章） |
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

> 框架模板中已内置完整 Portal 标注系统（`#annoLayer` + `#annoToggle` + `#annoPopup` + `renderAnnoBadges()`），新页面复制框架后只需做两件事：① 在功能元素上加 `data-anno`；② 在 `annotations` 对象中填说明。



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

1. 复制框架模板，页面内容已包含 Portal 图层和 JS（含智能定位 `resolveAnnoTarget`）
2. 在**具体功能元素**上添加 `data-anno="N"`，块级元素加 `inline-block`
3. 在 `annotations` 对象中填入对应的标题和说明
4. 徽标自动精确定位，不受 `overflow`/`z-index`/全宽容器影响

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

---



## 八、多页面组织与导航（强制）



### 8.1 文件组织

```
/Prototype
  ├─ index.html            ← 入口/导航页（汇总所有原型，必做）
  ├─ 登录.html              ← 登录页（独立页面，无侧边栏）
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

**页面布局（强制）**：`Prototype/系统框架.html` 是云登平台所有模块页面的唯一系统框架模板。除 `index.html` 和 `登录.html` 外，所有后台页面必须复用该框架，仅在内容承载区开发模块内容，不得自行重建或分叉系统壳层。

- **顶栏**（56px）：左侧 Logo + 系统名（点击回首页），右侧任务列表/消息中心（红色角标）/账号信息图标
- **侧边栏**（220px）：可展开菜单，当前页高亮（`active-l1` 蓝色字+图标 / `active-l2` 蓝底蓝字），移动端可折叠。菜单交互见下方「侧边栏菜单交互规范」
- **主内容区**（flex-1，`bg-page` 背景）：卡片 `bg-white rounded-lg border` + `p-5 md:p-6`
- 文件名用**中文语义化命名**（如 `成员管理.html`、`订单看板.html`）；
- 左侧菜单必须配置真实可用的页面入口与跳转路由，页面间使用 `<a href>` 或 JS 跳转互通；
- 后台各页共用侧边导航，且当前路由唯一高亮。



### 8.1.1 侧边栏菜单交互规范（强制）

> `Prototype/公共导航.js` 与 `Prototype/公共导航.css` 是侧栏、顶部导航和独立页面路由的公共实现。所有 HTML 统一引用同一缓存版本；页面只声明业务主体，不得复制或另行修改公共导航行为。
>
>
> | 操作           | 行为                      |
> | ------------ | ----------------------- |
> | 点击无子菜单的一级菜单  | 选中高亮（`active-l1`）+ 导航跳转 |
> | 点击有子菜单的一级菜单  | 展开/收起子菜单（仅切换，不导航）       |
> | 已展开的一级菜单再次点击 | 收起子菜单                   |
> | 点击二级菜单       | 二级菜单 + 所属一级菜单双高亮 + 导航   |
> | 点击已选中的二级菜单   | 重新跳转                    |
> | 展开其他一级菜单     | 自动收起当前展开的子菜单（互斥展开）      |
> | **HTML 约定**： |                         |
>

- 一级菜单：`class="menu-item l1"` + `data-page="页面名"`（无子菜单）或 `data-sub="sub-xxx"`（有子菜单）+ `onclick="menuSelect(this)"`
- 二级菜单：`class="menu-item l2"` + `data-page="目标.html"` + `onclick="menuSelect(this)"`，放在对应 `id="sub-xxx"` 的 `.submenu` 容器内
- 菜单结构、当前态、分组展开、折叠、移动端侧栏和顶部栏交互均由 `公共导航.js` 统一生成；叶子菜单使用普通 `<a href="目标页面.html">` 跳转，不使用 `系统框架.html#模块` 承载业务页面



### 8.1.2 侧边栏菜单全局同步（强制，红线）

> **核心规则**：`Prototype/公共导航.js` 是侧边栏与独立页面路由配置的唯一基准，`Prototype/系统框架.html` 用于展示框架契约。新增、改名、删除模块或调整菜单结构时，必须同步更新公共导航、系统框架、`index.html` 与全部路由引用。

| 变更场景 | 同步范围 | 操作 |
|----------|----------|------|
| **新建 HTML 原型页面** | 所有后台 `.html`（含 `系统框架.html`）+ `index.html` | ① 在侧边栏添加对应菜单项与跳转路由；② 在 `index.html` 添加导航卡片 |
| **修改模块名或 HTML 文件名** | 所有后台 `.html`（含 `系统框架.html`）+ `index.html` | ① 更新菜单名称及对应路由；② 更新 `index.html` 中卡片名称与 `href`；③ 全局搜索旧名称，更新 JS 跳转、`a` 标签等引用 |
| **删除模块或 HTML 原型页面** | 所有后台 `.html`（含 `系统框架.html`）+ `index.html` | ① 移除对应菜单项与路由；② 从 `index.html` 移除卡片；③ 全局搜索并清理失效引用 |
| **调整菜单层级/结构** | 所有后台 `.html`（含 `系统框架.html`） | 同步更新菜单结构、路由配置、菜单初始化逻辑及权限树等硬编码引用，**不可遗漏** |

**同步检查清单**（每次变更后必过）：

- [ ] `Prototype/系统框架.html` — 侧边栏与路由已更新（唯一基准模板）
- [ ] 所有后台 `.html` — 每个文件的侧边栏 HTML 完全一致
- [ ] `index.html` — 导航卡片与侧边栏菜单一一对应
- [ ] 全局搜索旧文件名/旧菜单标识（`sub-xxx`、`全部订单`等）→ 零残留
- [ ] 各文件 JS 中的 `initSidebarActive()` / 菜单高亮逻辑与新结构匹配
- [ ] 权限树、快捷入口等硬编码菜单引用已更新

> **执行方式**：用脚本批量替换确保一致性，不可逐个手动修改（容易遗漏）。替换后运行全局搜索验证旧标识零残留。

### 8.2 index.html 导航页（必做）

- 汇总所有原型页面，分组（后台系统 / 用户端）；
- 每页一张卡片：页面名 + 简述 + 图标 + "打开"链接；
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

1. **读三份**：`claude.md`（本文件）+ `design.md` + 该页面的模块 `PRD.md`；
2. **搭结构**：语义化 HTML + 布局（后台三段 / 用户端手机框）；
3. **套 token**：注入 design.md 的 Tailwind config；
4. **填 mock data**：内联真实感数据，JS 渲染；
5. **做交互**：tab/弹窗/表单校验/hover/筛选/跳转；
6. **加标注**：把 PRD 交互说明转写进 annotations，加徽标 + 说明弹窗 + 全局开关；
7. **接导航**：与 index.html 及相关页互链，侧边栏当前页高亮；
8. **自检**：对照第十二章清单逐条核对；
9. **同步文档**：页面业务或可复用视觉规则发生变化时，同步更新模块 PRD、`design.md`、`Prototype/设计系统.html`；工程流程变化再更新 `claude.md`/`agent.md`；
10. **输出单文件**：双击可预览、无外部依赖、无报错。

---



## 十二、交付前自检清单（每页必过）

- [ ] 单文件自包含，双击可预览，无本地资源依赖（CDN 除外）
- [ ] Tailwind CDN + Lucide，未引入禁用库（无 Vue/React/jQuery）
- [ ] 色值/字号/圆角/间距全部引用 design.md，无自造值
- [ ] 语义色用途正确（primary/success/warning/danger/info）
- [ ] 响应式：桌面正常，平板不溢出，表格可横向滚动
- [ ] Mock data 真实可信、覆盖多状态、≥8 条、数字用 mono
- [ ] 基础交互可用：tab/弹窗/表单校验/hover/筛选/跳转
- [ ] **交互标注完整**：每个交互/规则点有徽标，点击弹说明，全局可显隐
- [ ] 复用系统框架时仅显示业务内容及本页操作栏标注，编号从 1 连续排列
- [ ] 标注内容转写自对应模块 PRD
- [ ] 自定义下拉、Popover、菜单展开后父区块自动适配，无裁切、重叠和意外页面跳动
- [ ] 页面业务与视觉调整已同步模块 PRD、design.md 和 HTML 设计系统
- [ ] 与 index.html 及相关页互链，侧边栏当前页高亮
- [ ] 语义化标签 + 分区注释 + 规范类名 + JS 分区注释
- [ ] 控制台无 error，Lucide 图标正常渲染
- [ ] 代码规范、可读、开发可复用

---



## 十三、红线（禁止事项）

- ❌ 自造色值/字号/圆角，偏离 design.md
- ❌ 引入 Vue/React/jQuery 或未列出的库（Chart.js 及必要时 ECharts CDN 除外，见第二节）
- ❌ 依赖外部本地 CSS/JS/图片（破坏单文件预览）
- ❌ 用 emoji 代替图标
- ❌ 静态堆数据（不用 mock data 驱动）
- ❌ 交互不可用（纯静态图）
- ❌ 遗漏交互标注系统
- ❌ 代码零注释、结构混乱、不可复用

---



## 十四、调用方式

每次制作页面时，指令示例：

> “阅读 `claude.md`、`design.md` 和 `PRD/编辑浏览器PRD.md`，基于 `Prototype/系统框架.html` 制作 `Prototype/编辑浏览器.html`，严格遵守三份文档并在完成后按自检清单核对。”

---

**说明**：本文件为行为约束，视觉以 `design.md` 为准、内容以各 `PRD.md` 为准。三者分工不重叠，共同约束 Claude Code 产出一致、规范、可交付的高保真原型。
