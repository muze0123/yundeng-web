# design.md — 视觉设计规范（单一事实来源）

> 本文件是项目视觉规范的**单一事实来源**。所有页面的颜色、字号、圆角、间距、组件外观**必须**引用本文件，不得自造。《设计系统.html》仅同步镜像本文件。视觉如有调整，先改本文件，再同步设计系统页。
> 配套文件：`claude.md`（工程与行为约束）、各模块 `PRD.md`（页面内容与交互）。

---

## 一、颜色

### 1.1 主色

| 角色 | 色值 | 用途 |
|------|------|------|
| primary | `#0066FF` | 主操作、选中、链接、品牌强调 |
| primary-hover | `#0052CC` | 主按钮 hover |
| primary-active | `#0047B3` | 主按钮 active |
| primary-bg | `#E6F0FF` | 主色浅底（选中背景、标签底） |

### 1.2 中性色（文字与线）

| 角色 | 色值 | 用途 |
|------|------|------|
| ink-title | `#1A1D24` | 标题文字 |
| ink-body | `#3A3F4A` | 正文 |
| ink-sub | `#6E7685` | 次要/辅助文字 |
| ink-muted | `#9DA2AC` | 占位/禁用文字 |
| line | `#DFE1E5` | 主分割线/边框 |
| line-light | `#E8EAED` | 浅分割线 |
| line-lighter | `#F0F1F3` | 更浅（表头底等） |
| bg-page | `#F7F8FA` | 页面底色 |
| bg-card | `#FFFFFF` | 卡片底色 |
| bg-hover | `#F3F4F6` | 行/项 hover 底色 |
| block-hover | `#F0F1F3` | 可交互白色内容卡片/业务区块 hover 底色 |

### 1.3 语义色

| 角色 | 主色 | 浅底 | 用途 |
|------|------|------|------|
| success | `#0FC060` | `#E7F9F0` | 成功、进行中、完成正向 |
| warning | `#E7772D` | `#FDF2E9` | 警告、临期、超时提示 |
| danger | `#D9001B` | `#FFE8EB` | 错误、危险、异常、删除 |
| info | `#0091D5` | `#E4F4FB` | 信息、中性提示 |

### 1.4 业务强调色

| 角色 | 色值 | 用途 |
|------|------|------|
| price | `#FE5416` | 商品当前销售价格；仅用于价格数字，不用于错误、警告或操作按钮 |

### 1.5 颜色使用铁律

- 主操作/选中/链接 → **primary**
- 商品当前销售价格 → **price**
- 进行中/完成正向 → **success**
- 临期/超时/警告 → **warning**
- 异常/删除/错误 → **danger**
- 中性信息提示 → **info**
- 状态 Badge 一律"主色字/描边 + 对应浅底"

---

## 二、字体

### 2.1 字体族

| 用途 | 字体 |
|------|------|
| UI 文本（sans） | `-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif` |
| 数字/编号/金额/代码（mono） | `'JetBrains Mono', monospace` |

> 数字、订单号、金额、编码、时间戳等**必须**用 mono 字体，增强数据感与对齐。
> UI 字体由 `src/styles/global.css` 统一定义系统字体回退链，并在 `body` 开启 WebKit 与 macOS Firefox 抗锯齿；后台公共层统一引入，表单控件继承同一字体。
> JetBrains Mono 通过 CDN 引入：`https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap`

### 2.2 字号层级（B 端高信息密度）

| 层级 | 字号 / 字重 | 用途 |
|------|-------------|------|
| 主标题 | 20–30px / 700 | 页面主标题 |
| 区块标题 | 16–19px / 600 | 卡片/区块标题 |
| 正文（主） | 13px / 400–500 | 表格、正文、表单 |
| 正文（次） | 12px / 400 | 密集信息 |
| 辅助 | 11px / 400 | 标签、次要说明 |

### 2.3 界面语言规范

云登后台管理系统的用户界面以简体中文为唯一主展示语言，页面标题、区块标题、卡片标题、字段标签、表头、按钮、状态名称、辅助说明和空/错状态文案必须使用准确、简洁的中文。

- **禁止装饰性英文标题**：不得使用 `DATA GOVERNANCE CONSOLE`、`DELIVERY MAP` 等英文眉题、副标题或氛围文案；此类内容没有独立业务信息时直接删除，不需要中文占位替代。
- **禁止中英双标题或字段翻译**：不得展示“中文标题 / English Title”“负责人（Owner）”“数据结构（Schema）”等并列翻译；统一保留中文名称。
- **英文缩写须中文化**：英文缩写直接充当指标或字段名称时，应改为中文业务名称，例如 `DAU` 显示为“日活跃用户”、`GMV` 显示为“成交金额”、`MTTR` 显示为“平均恢复时长”。
- **允许保留必要技术值**：事件英文名、属性标识、接口参数、事件/会话/请求/链路标识、代码、文件格式、客户端名称、版本号和技术枚举属于数据本身，可按原值展示，并使用等宽字体区分于界面文案。
- **避免重复解释**：技术值已有中文字段标签时，不再额外展示英文标签翻译；需要解释时使用中文帮助文本或 Tooltip。

新增或改版页面必须在视觉验收前执行用户可见文案检查；发现纯英文标题、装饰性英文或中英并列字段时视为不符合设计规范。

---

## 三、圆角与间距

### 3.1 圆角

| 值 | 用途 |
|----|------|
| **4px** | 默认（按钮、输入框、标签、Badge 等小元素） |
| 8px | 卡片、弹窗、模态、大容器 |
| 10px | 大型引导类 Modal；仅在模块 PRD 明确指定时使用 |

> 注：6px 保留可用，用于内嵌小组件（如 KPI 统计小卡），不作为主要层级。

### 3.2 间距

- 基数 **6px**；
- 常用梯度：`4 / 6 / 8 / 10 / 12 / 16 / 20 / 32px`；
- 就近取梯度值，不用非梯度的随意像素。

---

## 四、阴影层次

| 层级 | 用途 | 参考 |
|------|------|------|
| 无/极浅 | 卡片默认（以边框区分为主） | `border: 1px solid line` |
| 轻 | hover 卡片、下拉 | `0 2px 8px rgba(0,0,0,.06)` |
| 中 | 弹窗、抽屉、悬浮层 | `0 6px 24px rgba(0,0,0,.12)` |

> B 端以边框和底色区分层级为主，阴影克制使用，避免过重。

---

## 五、组件外观标准

同类组件全站外观必须一致。以下为视觉标准（行为交互见 `claude.md`）。

### 5.0 页面标准布局

> **核心原则**：所有后台列表/管理页面采用统一的两区块结构。**不设独立的页面主标题区块**（标题整合进数据区标题行）。

**标准结构**：

```
┌─ 区块1：筛选区 ─────────────────────────────┐
│  [状态Tab]（可选）                            │
│  filter-flow（400px 筛选项，最多 4 项/行）       │
│  …… [最后一个条件] [查询] [重置]               │
└────────────────────────────────────────────┘
┌─ 区块2：数据区 ─────────────────────────────┐
│  工单列表（h2, 左）       [操作按钮]（右）      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│  │ KPI │ │ KPI │ │ KPI │ │ KPI │ ← 有则显示  │
│  └─────┘ └─────┘ └─────┘ └─────┘            │
│  ┌─ 表格 ──────────────────────────┐         │
│  │ ...data rows...                 │         │
│  └─────────────────────────────────┘         │
│  分页器（表格右下方）                           │
└────────────────────────────────────────────┘
```

**布局规则**：

| 区域 | 规则 |
|------|------|
| 区块1 筛选区 | `bg-white rounded-lg p-5 md:p-6 mb-4`，App Shell 内不设外描边 |
| 区块2 数据区 | `bg-white rounded-lg p-5 md:p-6`，App Shell 内不设外描边 |
| 数据区标题 | `h2`，`text-[16px]`（有指标卡）或 `text-[18px]`（无指标卡），`font-semibold`，左对齐 |
| 操作按钮 | 与标题同行，右对齐，`flex items-center justify-between flex-wrap gap-3` |
| 数据指标卡 | 有则放在标题行下方、表格上方（`mb-4`），无则不显示 |
| 指标卡样式 | `grid grid-cols-2 lg:grid-cols-4 gap-3`，每卡 `p-3 rounded-md border border-line bg-page` |
| 筛选字段 | 使用可换行的 `filter-flow` 布局；控件基准宽度 400px，单行最多 4 项（见 §5.4） |
| 查询/重置 | 作为末尾操作组紧跟最后一个查询条件，不另起独立按钮行；容器不足时随筛选项整体换行 |

**页面标题处理**：
- ❌ **禁止**设置独立的页面标题卡片（如单独的 `<h1>订单管理</h1>` 卡片区块）
- ✅ 页面标题语义整合到数据区的 `h2` 标题中（如"工单列表"、"订单列表"）
- ✅ 必要的页面级操作按钮（如"标记异常"、"新增"）放在数据区标题行右侧

**区块1 筛选区 HTML 结构参考**：

```html
<div class="bg-white rounded-lg p-5 md:p-6 mb-4">
  <!-- 状态 Tab（按需） -->
  <div class="flex items-center gap-2 mb-4 flex-wrap">
    <span class="text-[13px] text-ink-sub mr-1">状态：</span>
    <div class="flex items-center gap-1 flex-wrap" id="statusTabs">
      <span class="filter-tab active">全部</span>...
    </div>
  </div>
  <!-- filter-flow：筛选项与操作组共用同一换行流 -->
  <div class="filter-flow">
    <div class="filter-item">...</div>
    ...
    <div class="filter-actions">
      <button class="btn btn-primary btn-sm">查询</button>
      <button class="btn btn-default btn-sm">重置</button>
    </div>
  </div>
</div>
```

**区块2 数据区 HTML 结构参考**：

```html
<div class="bg-white rounded-lg p-5 md:p-6">
  <!-- 标题行 -->
  <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
    <h2 class="text-[18px] font-semibold text-ink-title inline-block">数据列表</h2>
    <button class="btn btn-primary"><i ...></i> 操作</button>
  </div>
  <!-- 数据指标卡（有则放，无则跳过） -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">...</div>
  <!-- 表格 -->
  <div class="overflow-x-auto"><table class="data-table">...</table></div>
  <!-- 分页 -->
  <div class="flex items-center justify-end flex-wrap gap-4 pt-5 text-[12px]" id="pagination"></div>
</div>
```

### 5.1 按钮

| 类型 | 外观 |
|------|------|
| 主按钮 | primary 实底 + 白字，圆角 4px，高度 32px（默认）/28px（小） |
| 大按钮 | 高度 40px；仅在模块 PRD 明确指定的重要 CTA 中使用，不替换默认 32px 按钮 |
| 次按钮 | 白底 + line 描边 + ink-body 字 |
| 危险按钮 | danger 实底/描边 |
| 禁用 | 底色/文字置灰（ink-muted），不可点 |
| hover/active | 主按钮用 primary-hover / primary-active |

### 5.2 表格

| 区域 | 样式 |
|------|------|
| 表格整体 | `width:100%; border-collapse:collapse; font-size:13px` |
| 表头 | `line-lighter` 底色（`#F0F1F3`）+ `ink-sub` 字色（`#6E7685`），字重 600，字号 12px，padding `9px 12px`，下边框 `1px solid line`，不换行 |
| 可排序表头 | 字段名与排序图标水平排列，间距 4px；图标固定 `10×14px`，由上下两个 `10×6px` 实心三角组成，中间间距 2px。未排序时字段名与上下三角均用 `ink-sub` / `ink-muted`（`#6E7685` / `#9DA2AC`）；升序时字段名与上三角使用 `primary`（`#0066FF`），下三角保持 `ink-muted`；降序时字段名与下三角使用 `primary`，上三角保持 `ink-muted`。使用原生按钮并在所属 `th` 上同步 `aria-sort="none/ascending/descending"`。字段名与激活方向必须同步高亮，不得只高亮图标。 |
| 数据行 | 字号 13px，`ink-body` 字色，padding `9px 12px`，下边框 `1px solid line-lighter`，行高约 44–52px；**最后一条数据行也必须保留下边框**，不得以 `:last-child`、`border-t` 或容器裁切移除 |
| hover 行 | `bg-hover`（`#F3F4F6`）高亮底色；斑马纹可选 |
| 对齐 | **所有列左对齐**（含数字列）；列头与数据水平 padding 一致，保持上下对齐 |
| 数字列 | 使用 mono 字体（金额、数量、订单号等），与其他列保持左对齐 |
| 响应式 | 表格外层容器 `overflow-x: auto`，窄屏横向滚动 |
| 操作列 | 表头、单元格及操作组均左对齐；操作组使用 `display:flex;align-items:center;justify-content:flex-start;gap:12px;white-space:nowrap`，不得依赖逐个链接的 margin 拼接间距；危险操作（删除）用 danger 色 |

> **实现参考**：所有原型页面中表格使用 `.data-table` 类统一以上样式。新页面从框架模板复制后，表格 CSS 已内置。

### 5.3 状态 Badge

- 圆角标签（4px），主色字/描边 + 对应浅底；
- 进行中 success / 临期超时 warning / 异常 danger / 终态 ink-muted 灰。
- **数据表格状态文本特例**：订单、开票记录及同类高密度业务列表的“状态”列采用语义色纯文本，移除背景、描边、圆角和额外内边距；字号沿用表格正文 13px、字重 500、左对齐。独立详情页、汇总卡片等需要强化识别的低密度场景仍使用上述 Badge。

### 5.4 筛选区

> 筛选区统一采用“定宽筛选项 + 流式换行”的响应式布局。查询控件基准宽度固定为 400px，单行最多展示 4 个查询条件；可用宽度不足时按 4→3→2→1 项自然换行，不产生页面级横向滚动。

**容器 `.filter-flow`**：`display:flex; flex-wrap:wrap; align-items:flex-end; gap:16px 24px;`。横向间距 24px 用于区分不同查询维度，纵向间距 16px 用于保持换行后的扫描节奏。

**筛选项 `.filter-item`**：`flex:0 0 400px; width:400px; display:flex; flex-direction:column; gap:6px;`。

**标签 `.filter-label`**：标签位于控件上方，左对齐，`font-size:13px; line-height:18px; color:#3A3F4A;`，不追加中文冒号。

**控件 `.control`**：`width:400px; max-width:100%;`

- 内部 `input` / `select`：`width:100%; height:32px; font-size:14px; padding:0 8px; border-radius:4px; border:1px solid #DFE1E5; color:#3A3F4A; outline:none; font-family:inherit; background:#fff;`
- placeholder 样式：`color:#9DA2AC; font-size:14px;`
- focus 态：`border-color:#0066FF; box-shadow:0 0 0 2px rgba(0,102,255,.12);`
- select 下拉箭头使用内联 SVG background-image 替代浏览器默认样式，`padding-right:24px;`

**日期范围 `.date-range`**：`display:flex; align-items:center; gap:4px;`（通用默认，仅适用于模块 PRD 未指定自定义日期面板的场景）。

- 分隔符 `.date-sep`：`font-size:14px; color:#9DA2AC; flex-shrink:0; margin:0 2px;`
- 通用日期输入框使用 `type="text"` + `placeholder` 展示提示文字；需要调用原生日期选择器的模块，可在 focus 时切换 `type="date"`，blur 无值时恢复 `type="text"`。
- 空状态文字色 `#9DA2AC`，有值后切换为 `#3A3F4A`。

**订单管理创建时间范围特例 `.order-date-control-wrap`**：当模块 PRD 要求双月范围下拉时，覆盖通用日期输入规则，不使用浏览器原生日期输入。

- 触发器为一个连续的 `300px × 32px` 组合控件：外层 `background:#FFFFFF`、`border:1px solid #DFE1E5`、`border-radius:4px`、左右内边距 `12px/10px`；内部显示“开始时间 `~` 结束时间”，不得出现两个独立可见边框。空状态使用 `#9DA2AC`，已选日期使用 `#3A3F4A` 与 JetBrains Mono；右侧只放一个 `calendar-days` 线性图标，尺寸 `16×16px`。
- hover 使用 `#F3F4F6`；focus-visible 使用 `border-color:#0066FF` 与 `#E6F0FF` 双像素聚焦环；逆序或无效范围使用 `#D9001B` 与 `#FFE8EB`。标签与触发器仍遵循订单页横向筛选特例，字段内部 `column-gap:0`。
- 下拉面板宽 `620px`、最大宽度 `calc(100vw - 32px)`，白底、`1px #DFE1E5` 边框、`8px` 圆角、`0 6px 24px rgba(0,0,0,.12)` 阴影、内边距 `16px`。面板并列展示当前月和相邻月，月栏之间使用 `1px #E8EAED` 竖向分隔线与 `16px` 内侧间距。
- 每个月标题与导航同一行，两个标题始终居中：左侧月份外侧依次放 `28×28px` 的 `chevrons-left`（上一年，`<<`）与 `chevron-left`（上个月，`<`）；右侧月份外侧依次放 `chevron-right`（下个月，`>`）与 `chevrons-right`（下一年，`>>`）。两个月内侧不显示可操作按钮，但保留等宽占位，避免标题跳动。星期行使用 `12px` `#9DA2AC`，日期格为 `30×30px`，日期数字使用 JetBrains Mono。
- 非当前月日期使用 `#C7CAD1`；范围内日期使用 `#E6F0FF` 连续浅底；起止日期使用 `#0066FF` 白字，端点圆角保持连续范围视觉。参考图中的珊瑚色不直接复用商品价格色，业务页面统一遵循本系统 primary 语义色。
- 交互保留“清空 / 取消 / 确定”操作：首次选择为开始日期，第二次为结束日期（含边界）；允许单侧日期；开始晚于结束时就地标红并阻止确定与查询；点击外部或 `Esc` 按取消处理。面板打开前保存已应用值，取消不得写回草稿。
- 响应式：宽度不足时面板在触发器左侧对齐，`480px` 以下两个月纵向堆叠并移除月间竖线；触发器仍不超过筛选项可用宽度，页面不得出现横向滚动。

**横向标签筛选特例**：仅在模块 PRD 明确指定标签与控件同排时使用。横向筛选项采用 `display:flex; align-items:flex-start; column-gap:0px;`，字段名称后的中文全角冒号紧贴控件，不在标签列与控件之间追加留白；标签列固定右对齐，普通控件宽度保持模块 PRD 规定值。筛选项之间仍由外层筛选流的 `column-gap:24px` 分隔，字段换行的 `row-gap` 仍为 16px。`column-gap:0px` 只描述单个字段内部的“标签—控件”间距，不得误用于不同筛选项之间。

**查询/重置按钮**使用 `.filter-actions` 作为一个不可拆分的末尾操作组，紧跟最后一个查询条件右侧；按钮间距 12px，高度 32px。操作组不得通过绝对定位或空标签占位实现，容器不足时应整体换行。

**筛选字段顺序建议**：搜索框放第一位，日期范围合并为一个字段（`创建时间：[开始时间 - 结束时间]`），其余按业务优先级排列。单行最多 4 个查询条件，超过 4 个从下一行继续；查询/重置始终位于全部条件之后。

**响应式降级**：当筛选区可用宽度小于 720px 时，`.filter-item` 与 `.control` 均切换为 `width:100%`，操作组保持左对齐并整组换行。桌面及大屏保持 400px 基准宽度，由 Flex 容器依据实际可用宽度决定每行展示数量。

**搜索框清空按钮**：搜索输入框在有内容时，右侧显示清空按钮 `✕`（位于搜索图标对面），点击后清空输入内容并保持焦点；无内容时按钮隐藏。清空按钮样式：`position:absolute;right:8px;top:50%;transform:translateY(-50%);width:16px;height:16px;font-size:12px;color:#9DA2AC;cursor:pointer`，hover 时颜色变深 `#6E7685`。

### 5.5 分页

> 本节是分页器视觉规则，设计系统页中的分页器示例必须同步镜像本节。

**容器**：`display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:16px;font-size:12px`。

**位置**：分页器放在数据表格所在区块（`.bg-white.rounded-lg`，App Shell 内无外描边）内部，位于表格（`.overflow-x-auto`）的右下方，通过 `pt-5`（20px）与上方表格区域保持间距。该 20px 从**最后一条数据行的下边框底部**量到分页器区域顶部；禁止使用 `pt-4`（16px）、额外 margin 或移除末行边框来制造视觉间距。分页器**不是**独立区块，而应与表格同属数据区。表格和分页控件自身的边线仍保留。

**布局（三区，居右）**：

| 位置 | 内容 | 说明 |
|------|------|------|
| 左 | 页码导航 `#pg-nav` | `display:flex;gap:4px` — `‹` + 页码按钮 + 省略号 `…` + `›` |
| 中 | 条/页选择 | `.pg-select-wrap` 包裹 `<select>`，`::after` 自定义下拉箭头 |
| 右 | 跳页 + 统计 | 跳至 `[input(value=1)]` 页 + `共 N 条记录　第 a/b 页` |

**页码按钮 `.pg-btn`**：`min-width:30px;height:30px;padding:0 8px;font:500 12px inherit;color:#3A3F4A;background:#fff;border:1px solid #DFE1E5;border-radius:4px;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;justify-content:center`
- hover（非当前页、非禁用）：`color:primary;border-color:primary`
- 当前页 `.pg-current`：`background:primary;border-color:primary;color:#fff`
- 禁用（首页 `‹` / 末页 `›`）：`color:#C7CAD1;background:#F7F8FA;cursor:not-allowed;border-color:#DFE1E5`

**省略号 `.pg-ellipsis`**：`min-width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;color:#9DA2AC;font-size:13px`

**条/页下拉 `.pg-select`**：`font:12px inherit;height:30px;padding:0 28px 0 8px;border-radius:4px;border:1px solid #DFE1E5;color:#3A3F4A;background:#fff;cursor:pointer;appearance:none;-webkit-appearance:none`
- `.pg-select-wrap`：`position:relative;display:inline-flex;align-items:center`
- `.pg-select-wrap::after`：`content:'▼';position:absolute;right:8px;font-size:8px;color:#9DA2AC;pointer-events:none`

**跳页输入框 `.pg-jump-input`**：`font:12px inherit;width:44px;height:30px;text-align:center;border-radius:4px;border:1px solid #DFE1E5;color:#3A3F4A;outline:none`
- focus：`border-color:primary;box-shadow:0 0 0 2px rgba(0,102,255,.12)`
- **默认值**：`value="1"`，输入框始终不为空；跳页成功后重置为 `1`（不清空）

**统计文字 `.pg-stats`**：`color:#9DA2AC;white-space:nowrap`

**页码逻辑**：≤7 页全显示；>7 页时始终显示首页和末页，当前页 ±1 范围显示，其余用 `…` 折叠。

### 5.6 弹窗 Modal

- 居中；遮罩 `rgba(0,0,0,.3)`；通用 Modal 圆角 8px；宽度 **760px**（`max-width:92vw` 响应式）；
- 大型引导类 Modal 经模块 PRD 明确指定时可使用 10px 圆角；移动端全屏展示时圆角为 0px；
- 结构：标题栏（16px/600）+ 关闭 ×（20px，ink-muted，右上角）+ 内容区（padding 32px 24px）+ 底部操作区（border-top 分隔，按钮居右）；
- 表单字段：label 90px 右对齐（标签文字末尾带中文冒号 `：`）+ 控件 400px 宽 30px 高（`border-radius:4px;border:1px solid line`）；字段区块在弹窗内容区居中。
- 换绑代理等表单型弹窗：字段标签列可放宽至 112px；下拉框、输入框、分段控件等表单组件统一宽度 **400px**；字段垂直间距 18px，标签与控件横向间距 14px；筛选项在弹窗内按 400px 单列纵向排列，避免挤压表格区域。

### 5.7 抽屉 Drawer

- 右侧滑出；用于详情展示；宽度 **800px**（`max-width:100%` 响应式）；
- 遮罩 `rgba(0,0,0,.3)`；阴影 `-4px 0 24px rgba(0,0,0,.1)`；入场动画 `ds-drawer-in .22s ease`；
- 结构：标题栏（16px/600 + 关闭 ×）+ 内容区（`overflow-y:auto`）+ 底部按钮。
- 默认业务 Drawer 仍由 ModuleFrame 在 iframe 视口内渲染。仅当模块 PRD 明确要求遮罩整个 App Shell 时，允许使用 SystemFrame 的受信全局 Drawer Portal：ModuleFrame 只传结构化视图模型，SystemFrame 校验消息来源与业务白名单后用受控 DOM 渲染，禁止传递原始 HTML 或直接操作父文档。
- 全局业务 Drawer 的蒙版与 Drawer 面板均从 BrowserChrome 底部开始，覆盖 TopBar、Sidebar 与 MainContent，并贴合视口底部，使面板与网页可用高度齐平且顶部不留空；桌面宽 800px，小于 768px 时占满可用宽度。打开时背景必须 `inert` 并锁定滚动，关闭后恢复焦点、滚动及原有可交互状态。

**标准业务详情 Drawer（以订单详情为基准）**：

- ModuleFrame 内默认使用 `position:fixed;inset:0` 的本地遮罩，遮罩本身不留内边距；面板贴右、贴顶、满高，`width:800px;max-width:100%`，采用纵向 Flex 布局。不得改造成居中 Modal，也不得在面板外再套卡片边框。
- 标题栏固定高 `56px`，左右内边距 `24px`，白底，可使用 `line-light` 下分隔线；标题为 16px/600，关闭按钮为 `32×32px`，图标使用 `x`、18px、`ink-sub`。
- 内容区使用 `flex:1;overflow-y:auto;padding:16px;background:page`。详情分区为白底、8px 圆角、16px 内边距、无外描边，分区之间保持 16px 垂直间距；分区标题为 16px/600，标题下间距 16px。
- 信息项默认两列网格，列间距 24px、行间距 12px；每项内部标签列宽 96px、右对齐且带中文冒号，值沿用正文色。小于 768px 时降为单列。金额、编号、账号、时间使用 mono 字体。
- 分区内的明细表格允许横向滚动，并继续保留表头底色、行分隔线等表格自身边线；“无外描边”仅指详情分区容器。
- 可选底部操作栏固定高 `64px`，白底、`line-light` 上分隔线、左右内边距 `24px`，按钮组居右并保持 12px 间距；无业务操作时可省略底部栏。
- 八列及以上的数据维护型 Drawer 可使用 `1200px` 宽屏规格（`max-width:100vw`）；表格继续在内容区横向滚动，操作列必须 `position:sticky;right:0` 固定在右侧，并为表头、普通行和 hover 行分别补齐对应背景色，避免滚动内容透出。该宽屏规格仅用于多字段维护清单，普通详情 Drawer 仍保持 800px。
- 打开后必须锁定背景滚动、将焦点移入面板并约束 Tab；支持关闭按钮、点击遮罩和 `Escape` 关闭，关闭后恢复触发控件焦点。业务标注必须以同一个稳定面板引用成对调用 `pushAnnoScope()` / `popAnnoScope()`。

### 5.7.1 在线客服会话窗 Chat Panel

- 适用于不打断当前业务的即时咨询，不使用遮罩，不按 Drawer 处理；仅在模块 PRD 明确指定时使用。
- 桌面标准宽度 360px，最大高度 600px，固定于业务视口右下角；圆角 8px，边框 `line`，阴影使用中层 `0 6px 24px rgba(0,0,0,.12)`。
- 标题栏高 60px、使用 `primary` 背景和白色文字；内容区使用 `page` 背景并独立滚动；输入区固定在底部，以 `line-light` 分隔。
- 客服气泡使用 `card`，用户气泡使用 `primary`；气泡最大宽度 78%，正文 13px/20px，时间使用 11px 等宽字体。
- 小于 768px 时左右各留 12px、底部预留 72px，最大高度 560px；具体右下角避让值由模块 PRD 根据 App Shell 悬浮入口确定。
- 同一页面只允许一个会话窗；关闭按钮和 `Escape` 均可关闭并恢复触发入口焦点。打开期间标注作用域必须限定在会话窗内部。
- 输入区不展示实时字数计数；模块可保留内部长度校验。会话消息区使用 `role=log` 仅追加新消息，并区分客服与用户消息语义。工具栏评价入口使用 Lucide `star` 图标，打开客服窗内嵌套评价层，不增加页面级遮罩。
- 评价层沿用 `card`、8px 圆角和中层阴影，提供四档 `frown / meh / smile / heart` Lucide 图标、可选意见输入和 `success` 提交按钮；选项使用 `aria-pressed` 表达互斥状态，打开评价层时标注作用域切换至评价层内部。

### 5.7.2 大型资源看板 Modal

- 数据总览类弹窗经模块 PRD 明确指定时可突破通用 Modal 的 760px 宽度；首页资源看板桌面设计尺寸为 1140×760px，并使用 `min()` 在视口四周至少保留 16px；圆角仍为 8px，使用标准 `rgba(0,0,0,.3)` 遮罩和中层阴影。
- 标题栏固定，内容区使用 `page` 背景并独立纵向滚动；首页资源看板主内容使用 `2fr / 1fr` 双列，列间距 16px并纵向拉伸。左列“活动图 + 版本更新 / 快速访问”和右列“代理 + 套餐”组合上下边缘对齐、整体等高。
- 活动图使用 1410:472 稳定比例、8px 圆角和 `object-fit:cover`；图片只承载活动视觉，不作为价格、库存或优惠规则的数据源。内部信息块使用 `card` 和 8px 圆角，不在卡片内继续嵌套装饰卡片。
- 小于 768px 时转为全屏、圆角 0；必须支持关闭按钮、遮罩关闭、`Escape`、焦点约束与关闭后焦点恢复。

### 5.8 信息提示弹窗 Dialog

> 本节是 Dialog 视觉规则，设计系统页中的 Dialog 示例必须同步镜像本节。Dialog 用于信息提示、操作确认（如删除确认）等轻量场景，与 Modal（表单弹窗）区分。

**容器**：`position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:1200;display:flex;align-items:center;justify-content:center`

**弹窗本体**：`width:600px;max-width:92vw;height:250px;background:#fff;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.12);display:flex;flex-direction:column;position:relative;animation:ds-modal-in .15s ease`

**结构**：

| 区域 | 样式 |
|------|------|
| 关闭 × | `position:absolute;top:14px;right:18px;font-size:20px;color:#9DA2AC;cursor:pointer;z-index:1`（纯文本 `×`，非 Lucide 图标） |
| 内容区 | `flex:1;display:flex;align-items:center;padding:0 24px` |
| ICO | `width:20px;height:20px;border-radius:50%;flex-shrink:0` 圆形图标，颜色随 Dialog 类型变化 |
| 标题 | `font-size:16px;font-weight:600;color:#1A1D24` |
| 副标题 | `font-size:14px;color:#6E7685;margin-top:6px` |
| 底部按钮区 | `padding:0 24px 20px;display:flex;justify-content:flex-end;gap:12px` |
| 取消按钮 | `font:500 13px inherit;padding:6px 20px;border-radius:4px;background:#fff;color:#3A3F4A;border:1px solid #DFE1E5;cursor:pointer` |
| 确定按钮 | `font:500 13px inherit;padding:6px 20px;border-radius:4px;border:1px solid transparent;cursor:pointer;background:primary;color:#fff` |

**6 种 Dialog 类型**：

| 类型 | ICO | 图标色 | 底色 | 用途 |
|------|-----|--------|------|------|
| info | `i` | `#0091D5` | `#E4F4FB` | 信息提示 |
| success | `✓` | `#0FC060` | `#E7F9F0` | 操作成功 |
| warning | `!` | `#E7772D` | `#FDF2E9` | 警告提示 |
| danger | `✕` | `#D9001B` | `#FFE8EB` | 错误提示（操作失败、系统异常等已发生的错误） |
| confirm | `?` | `#E7772D` | `#FDF2E9` | 操作确认（删除确认、标记异常等需用户二次确认的操作） |
| system | `ⓘ` | `#0091D5` | `#E4F4FB` | 系统通知 |

> **删除确认**使用 `confirm` 类型（ICO `?`），因为本质是"确认是否执行"的询问，而非已发生的错误。确定按钮可使用 `danger` 红底强调破坏性操作。

### 5.8.1 轻量提示 Toast

- Toast 用于无需用户决策的即时反馈；默认由 SystemFrame 的全局 Toast 承载，ModuleFrame 无法调用全局能力时可在当前 iframe 内按同一规范降级渲染。
- 固定于业务视口顶部 24px 水平居中：`left:50%;transform:translateX(-50%)`；宽度自适应，`min-width:320px;max-width:min(480px,calc(100vw - 32px));min-height:44px`。
- 白底、8px 圆角、无描边，阴影 `0 6px 24px rgba(0,0,0,.12)`；内容区使用 `padding:10px 14px`、水平 Flex、10px 间距，正文 13px、`ink-body`。禁止使用黑色实底胶囊作为默认 Toast。
- 左侧使用 18px Lucide 语义图标：成功 `circle-check / success`、信息 `info / info`、警告 `triangle-alert / warning`、错误 `circle-x / danger`；同一条提示只使用一种语义色，正文保持 `ink-body`。
- 默认展示 3000ms；连续触发时更新文案并重新计时。入场使用 150ms 的淡入与轻微下移复位，离场使用 180ms 淡出；`prefers-reduced-motion` 时关闭位移动画。
- 成功/信息提示使用 `role="status"` 与 `aria-live="polite"`，错误提示使用 `role="alert"`；展示时不得强制转移焦点。Toast 层级高于普通业务弹层，但低于交互标注说明弹窗。

### 5.9 表单

- label + 控件；配置型表单标签默认不显示中文冒号；必填标识 `*`（danger 色）位于标签文字**左侧**（即 `* 字段名`）；
- 通用控件默认宽度 400px、高度 30px；配置型表单控件宽度 500px、高度 32px；圆角 4px；边框 1px solid line；
- 校验错误：控件描边转 danger + 下方 danger 字提示。

**配置型长表单（编辑浏览器等页面）**：

| 项目 | 规范 |
|---|---|
| 字段布局 | 一个字段占一行，不使用双栏字段栅格 |
| 标签列 | 桌面端宽 120px，右对齐；移动端移至控件上方并左对齐 |
| 控件区 | 标准宽 500px，最大宽度不超过可用空间 |
| 组合控件 | 同一字段内多个输入框、下拉框的总宽度为 500px；操作按钮、帮助提示不计入控件宽度 |
| 字段间距 | 垂直 16px；不得依赖会被全局规则覆盖的临时 margin 类 |
| 字段分隔 | 默认不使用字段行分割线，尤其是偏好设置等连续分段控件 |
| 区块开合 | 下拉面板或菜单参与文档流时，父区块必须自动增高/收回，后续字段不得重叠或被裁切 |

**字段语义图标**：安全项与风险项均使用 `16×16px`、`1.5px` 描边圆形图标；安全项为绿色描边 `✓`，风险项为红色描边 `!`。页面顶部图例必须复用字段旁同一套尺寸、线宽和颜色，必填项继续使用 danger 色 `*`。

**字段帮助入口**：文本帮助使用灰色文字与虚线下划线，hover/focus 是否变蓝由业务语义决定；低优先级问号使用 `18×18px` 低对比度灰色圆形图标。Popover 必须支持 hover 与键盘 focus，用户移入 Popover 后不得立即关闭；帮助中心链接使用 primary 蓝色。

**插件分组选择器**：触发器宽 500px；展开面板宽 500px、高 280px，左侧范围导航宽 200px，右侧为内容区；空集合显示“暂无数据”。面板在配置区块内展开并参与高度计算。全局插件快捷菜单宽 210px，菜单文字不换行；与分组面板互斥打开。

**字符计数器 `x/y`**（全局适用）：

| 控件类型 | 计数器位置 | 说明 |
|---------|-----------|------|
| 单行文本输入框 `<input>` | 控件内**右侧** | `x` 为当前已输入字符数，`y` 为最大字符数（`maxlength`），输入时实时更新 |
| 多行文本域 `<textarea>` | 控件外**右下侧** | 同上，位于文本域下方、右对齐 |

- 计数器样式：字号 12px，颜色 `ink-muted`（`#9DA2AC`），格式 `x/y`（如 `0/20`、`15/200`）；
- 单行输入框：计数器 `position:absolute` 定位在输入框内右侧，输入框 `padding-right` 预留 48px 空间，避免输入文字与计数器重叠；
- 多行文本域：计数器独立一行，`text-align:right`，宽度与文本域一致；
- 计数逻辑：以 `input.value.length` 为准，maxlength 由 `input` 属性直接提供或隐式声明。

**Toggle 开关**：

- 尺寸 40×22px，圆角 11px；圆钮 18px 白色；过渡 `.2s`；
- 关闭态：底色 `#C7CAD1`，圆钮居左（`left:2px`）；
- **开启态：底色 primary `#0066FF`**（非 success 绿），圆钮居右（`translateX(18px)`）。

### 5.10 卡片

- 通用数据卡片：`bg-card` + `line` 边框 + 圆角 8px + 内边距 16–20px；
- App Shell 路由承载卡片和配置页主要业务区块：使用 `bg-card`、圆角与留白分层，默认不使用外描边；内部标题/内容分隔可继续使用 `line-lighter`；
- 可交互的白色内容卡片/业务区块 hover 使用 `block-hover`（`#F0F1F3`），必须与页面底色 `bg-page`（`#F7F8FA`）保持可感知区分；表格行、菜单和按钮继续使用各自的 hover token；
- 强调型配置命令区可使用浅主色背景与 `1px` 浅蓝描边，但同一页面只保留一个此类强调容器。

### 5.11 图标

- Lucide 图标；尺寸随文本（14–16px 常用）；颜色随语义。

### 5.12 空状态 / 加载态

- 空状态：图标 + 说明文案 +（可选）操作引导；
- 加载态：骨架屏或 loading 指示。

### 5.13 交互标注徽标（Portal 图层）

> 标注徽标通过 Portal 独立图层渲染，与页面 DOM 完全解耦。详见 `claude.md` §7。

| 属性 | 值 |
|------|----|
| 尺寸 | 20×20px 圆形 |
| 底色 | primary `#0066FF` |
| 文字 | 白色，11px，700 |
| 阴影 | `0 2px 6px rgba(0,0,0,.15)` |
| z-index | 9998（图层）/ 9999（弹窗） |
| hover | `transform: scale(1.2)` |
| 定位 | `position: fixed`，动态计算目标元素右上角坐标（`rect.top - 10`, `rect.right - 10`） |

**标准悬浮开关**：使用“tags 图标 + 状态文案”的 32px 高胶囊按钮，右侧间距 8px。标注默认隐藏，开关默认文案为“显示标注”；单击后显示标注并将文案切换为“隐藏标注”，再次单击恢复默认隐藏状态。长按 350ms 后可沿页面右侧上下拖拽，位置限制在视口安全区并持久化。拖拽完成不得误触发显隐切换。全局 Modal/Drawer 承载模块业务内容时，开关挂载于 SystemFrame 顶层视口右侧且必须位于面板之外；全局 Drawer 打开期间固定在 BrowserChrome 下方、Drawer 左侧的遮罩区域内并暂停拖拽，关闭后恢复原位置。窄视口无外侧空间时可收敛为右缘图标按钮。

**业务页面标注隔离**：复用 App Shell 的业务页面只渲染当前业务内容区及该页面固定操作栏的标注，侧栏、顶部导航和系统级浮层不显示编号。编号从 1 开始，按上→下、左→右连续排列；折叠区或子流程编号仅在对应内容可见时显示。任何会改变文档流高度的控件开合后必须重新计算标注位置。

---

## 六、布局规范

### 6.1 后台（Web 管理系统）

浏览器外壳 + 平台导航 + 业务工作区布局：

```
浏览器外壳 BrowserChrome（84px，全宽置顶）
├─ 标签行（32px）：标签页 / 关闭标签 / 紧跟标签页右侧的新增标签页
├─ 工具行（52px）：后退 / 前进 / 刷新 / 搜索框或地址框 / 扩展程序 / 下载 / 更多
平台导航 TopBar（56px，全宽；Logo + 平台名 / 全局操作）
└─ 业务工作区 Workspace（height: calc(100dvh - 140px)）
    ├─ 侧边导航 Sidebar（220px 完整态 / 68px 紧凑态，当前页高亮）
    │   ├─ 一级菜单：36px 高，16px 图标，模块名称 14px
    │   └─ 二级菜单：36px 高、14px，无图标、无左侧竖线，文字起始 48px
    └─ 主内容区 MainContent（flex-1，min-width:0，bg-page 背景，自适应宽度）
        └─ Router Outlet iframe（width/height:100%，display:block，border:0）
            ├─ 模块业务内容：bg-page 背景，四边 padding 固定 16px（p-4）；筛选区/数据区使用 bg-white rounded-lg p-5 md:p-6
            ├─ 单区块：卡片最小高度 = iframe 可用高度 − 16px，内容超过时由模块文档滚动
            ├─ 多区块（≥2）：卡片高度由内容决定，垂直堆叠，间距 16px（mb-4）
            └─ 无重复面包屑或模块级 App Shell；页面标题内嵌于首张业务卡片中
```

**BrowserChrome 尺寸与 token**：

| 元素 | 规格 |
|---|---|
| 外壳 | 总高 84px；标签行 32px、工具行 52px；标签行、工具行与平台导航直接相邻；横跨视口；底部 `1px line-lighter` |
| 标签行 | `primary-light` 背景；左右内边距 8px；标签间距 4px；标签高 28px、宽 160–240px；活动标签 `bg-card`，非活动标签 `bg-page`（`#F7F8FA`），hover 使用 `bg-hover`（`#F3F4F6`），顶部圆角 8px；新增标签按钮紧跟当前标签列表右侧，不占据行尾独立区域 |
| 标签控件 | 关闭按钮 22×22px；新增标签、后退、前进、刷新、扩展程序、下载、更多均为 28×28px 图标按钮；Lucide 14–16px |
| 工具行 | 高 52px、`bg-card`；左右内边距 8px；组内间距 4px、组间距 8px；与平台导航直接相邻 |
| 搜索框/地址框 | 高 32px、`flex:1`、`min-width:160px`、最大圆角胶囊（`9999px`）、左 12px/右 4px 内边距、Mono 12px；右侧提供 24×24px `star` 书签按钮，hover/focus 显示“为此标签页添加书签”气泡；`bg-page` + `line-lighter` |
| 面板 | 扩展程序面板宽 320px，包含权限说明、扩展条目、固定/更多操作和管理入口；下载面板宽 300px，空状态不伪造任务；更多面板宽 260px，按 Chrome 分组展示标签、历史、下载、书签、缩放、打印、查找、更多工具和插件管理 |
| 溢出 | 标签列表横向滚动且隐藏滚动条外观；关闭按钮与新增按钮不参与压缩；地址框先收缩至 160px，再按断点隐藏次要导航按钮 |

工具行右侧操作顺序固定为扩展程序（Lucide `puzzle`）、下载（`download`）、更多（`ellipsis-vertical`）。面板以 Chrome 风格分组呈现，所有能力仍为本地 Mock：扩展程序的固定/更多、更多菜单的缩放与入口动作只反馈状态，不连接真实浏览器能力；下载面板不伪造任务、进度或历史。点击反馈见 `PRD/系统框架PRD.md`。

**TopBar 与工作区细则**：

- TopBar 高 56px、横跨整个 App Shell；平台品牌位于 TopBar 左侧，使用 28×28px Logo、16px/600 平台名称和 8px 间距；侧栏不得重复品牌或保留空白品牌行；
- TopBar 左右内边距桌面 24px、平板 12px；全局图标按钮 32×32px，按钮内 Lucide 图标统一为 18×18px、2px 描边并继承 `ink-sub` 当前色。新手引导入口使用 Lucide `compass` 保留圆形罗盘语义，与通知 `bell`、界面语言 `languages` 保持相同线性风格和视觉重量；侧栏“帮助”仍使用 `circle-help`；TopBar 不显示功能模块名称、路由文字、面包屑或品牌后分隔线，模块上下文由 BrowserChrome 当前标签、侧栏唯一高亮和业务内容标题共同表达；空间不足时不得压缩品牌 Logo 与右侧操作；
- TopBar 右侧“新手引导、通知、界面语言”等纯图标入口在 hover / focus-visible 时显示对应功能名称气泡。气泡使用 12px 正文、`ink-title` 深色底、白字、4px 圆角、8px 触发间距与轻阴影；鼠标移出或焦点离开后隐藏，入口已打开 Dialog / Popover 时不与弹层同时显示；
- 通知、语言与账号 Popover 采用“触发入口 + 对应面板”联合悬停区域：鼠标离开入口后保留 180ms 过渡时间，进入对应面板则取消关闭，离开入口与面板后关闭；外部点击与 Escape 仍可关闭，键盘焦点行为不得被鼠标规则破坏；
- TopBar 不使用描边，使用 `0 6px 8px -8px rgba(26,29,36,.24)` 仅向下分层；左边缘不得出现独立阴影带，阴影也不得被主内容裁切；
- BrowserChrome + TopBar 固定占高 140px；BrowserChrome 由 32px 标签行和 52px 工具行组成，标签行、工具行与 TopBar 之间不增加额外垂直间距；TopBar 与 Workspace 直接相邻；桌面/平板工作区使用 `height: calc(100dvh - 140px)`。Sidebar 管理菜单滚动，MainContent 使用 `overflow:hidden`，业务滚动只发生在 ModuleFrame 内；页面根节点不得新增多余纵向滚动；
- MainContent 不再直接注入业务 DOM；Router Outlet iframe 无边框、无装饰圆角、占满剩余区域。壳层不为 iframe 外加卡片或第二层内边距，避免“卡片套卡片”和双重 16px 留白；
- ModuleFrame 的业务根容器由公共层统一设置四边 16px 内边距，并保持 `width:100%`、`max-width:none`、`margin:0`；业务根内不得再使用页面级 `max-width` + `mx-auto` 收窄整个页面。表单、上传流程、协议正文等局部内容仍可按业务需要限宽；卡片内部继续使用 20px/24px 内边距，不与页面外层 16px 混用；
- 业务模块在 `<head>` 直接加载同版本 `公共导航.css` 与 `公共导航.js`，公共 CSS 先于公共 JS。模块首帧在直开跳转或 iframe 壳层裁剪完成前保持不可见，适配完成后一次性显示，禁止短暂露出模块自带的旧侧栏或旧 TopBar；
- SystemFrame 独占 BrowserChrome、TopBar、Sidebar、全局助手、全局 Toast / Popover / Dialog / Drawer 与全局标注；这些元素相对顶层视口定位。业务模块默认只渲染业务内容、业务弹层与业务标注，业务弹层相对 iframe 视口定位、不跨越 Sidebar 或 TopBar；模块 PRD 明确要求全局遮罩的业务详情属于受控例外，只能通过结构化消息调用 SystemFrame 的全局 Drawer Portal，不得传 HTML、复制模块 DOM 或直接修改父页面；
- iframe 加载态/失败态由 SystemFrame 覆盖 Router Outlet 展示，使用 `bg-page` + 居中状态组件；模块成功加载后完全移除遮罩。业务数据 Empty 只能在 iframe 内使用模块空状态，不与外层加载失败样式混用；
- 侧栏容器无边框、无阴影；完整态 220px，紧凑态 68px，宽度过渡 220ms，`prefers-reduced-motion` 下取消动画；
- 侧栏折叠把手使用 14×64px、圆角 8px、无边线，默认背景为 `#E5E6ED`，按钮 hover 背景为 `#ACB0BA`；箭头使用 10px 白色实心 Lucide `triangle`，完整态向左、紧凑态向右，并使用极轻暗色投影保证浅灰背景下可辨识。把手绝对定位于右边缘垂直中心；完整态与紧凑态默认透明且不接收鼠标事件，鼠标移入侧栏时以 180ms 线性透明度/位移动画显示并恢复点击，鼠标移出后以同一线性动画隐藏；键盘导航时仅在把手自身 `focus-visible` 时显示；
- 折叠把手不可被侧栏滚动容器的 `overflow` 裁切；紧凑态只显示“新建浏览器”、一级菜单/分组和底部入口图标，隐藏文字、分组箭头与全部二级菜单；
- 一级叶子菜单与可展开分组统一使用 `ink-body`、14px/400、1.5 行高；内容区左右内边距 12px，菜单项水平内边距 8px，16px 图标与文字间距 12px。分组箭头仅作为尾部展开提示，不改变图标和名称的起始位置；二级菜单不渲染图标、不显示左侧竖线，链接左内边距 36px，文字距侧栏左边 48px并与一级文字对齐；
- 侧栏分组标题只切换自身展开状态，允许用户临时同时查看多组二级菜单。同组二级功能之间切换时仅确保所属分组展开，并保留用户手动展开的其他分组；跨分组二级切换时收起无关分组、仅展开目标分组；目标为一级叶子、“新建浏览器”、“设置”或“帮助”时，收起全部二级菜单。首次进入、刷新、前进或后退时按当前路由归一化展开状态；未保存离开确认被取消时，不得提前改变分组展开状态；
- 侧栏一级、二级、可展开分组、“新建浏览器”及底部入口名称统一使用 14px；底部固定入口依次为“设置”（`settings-2`）与“帮助”（`circle-help`），分别进入 `系统框架.html?page=settings` 与 `系统框架.html?page=help`；
- 768–1279px 保留 220/68px 侧栏与横向可滚动标签；新增标签按钮始终跟随在可滚动标签列表右侧。小于 768px 时侧栏改为 220px 遮罩抽屉、不使用 68px 紧凑态，并隐藏窗口控制点；小于 560px 时隐藏后退/前进和平台名称，保留刷新、Logo、地址框、扩展程序、下载与更多；
- 页面底部固定操作栏使用方向相反的向上阴影，正文底部需预留其高度，避免最后一项表单被遮挡；
- 本规则仅适用于后台 App Shell 的顶栏、侧栏与路由内容承载容器。表格、表单控件、弹窗与卡片内部信息分隔仍按各自组件规范使用 `line` 边框。
- 除根 `index.html`、`Prototype/设计系统.html`、`Prototype/登录.html` 外，全部后台模块通过 `Prototype/系统框架.html?page=<key>` 进入唯一 App Shell。菜单、原型导航卡片和跨模块入口不得直接打开业务 HTML；业务 HTML 顶层直开时自动回框架，iframe 嵌入时公共脚本不得再次生成壳层。
- 前进、后退和刷新恢复后，iframe 内容、BrowserChrome 当前标签和菜单高亮必须保持同一状态；模块 query/hash 需要恢复时使用外层 `moduleSearch` / `moduleHash` 命名空间，不得覆盖 `page`。该恢复过程不得产生可见布局跳动。相对 URL 与 iframe 尺寸规则必须在 `file://` 预览下保持一致。

### 6.2 用户端（小程序，如需）

- 移动端竖屏基准宽 375px；页面中居中放"手机外框"容器展示；主色仍用本规范 token。

---

## 七、Tailwind 配置镜像（供实现直接引用）

> 以下为本规范的 Tailwind 映射，实现时内联到页面 `tailwind.config`。**本文件为准，此为镜像。**

```js
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0066FF', hover: '#0052CC', active: '#0047B3', bg: '#E6F0FF' },
        ink:     { title: '#1A1D24', body: '#3A3F4A', sub: '#6E7685', muted: '#9DA2AC' },
        line:    { DEFAULT: '#DFE1E5', light: '#E8EAED', lighter: '#F0F1F3' },
        page:    '#F7F8FA',
        card:    '#FFFFFF',
        hover:   '#F3F4F6',
        'block-hover': '#F0F1F3',
        price:   '#FE5416',
        success: { DEFAULT: '#0FC060', bg: '#E7F9F0' },
        warning: { DEFAULT: '#E7772D', bg: '#FDF2E9' },
        danger:  { DEFAULT: '#D9001B', bg: '#FFE8EB' },
        info:    { DEFAULT: '#0091D5', bg: '#E4F4FB' },
      },
      borderRadius: { DEFAULT: '4px', md: '6px', lg: '8px' },
      fontFamily: {
        sans: ['-apple-system','BlinkMacSystemFont','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Helvetica Neue','Helvetica','Arial','sans-serif'],
        mono: ['JetBrains Mono','monospace'],
      },
    }
  }
}
```

> `page`、`card`、`hover`、`block-hover` 必须作为颜色键直接声明，分别生成 `bg-page`、`bg-card`、`bg-hover`、`bg-block-hover`。禁止写成 `bg: { page, card, hover, block-hover }` 或 `'bg-card'` 等颜色键，否则 Tailwind 会生成 `bg-bg-page` / `bg-bg-card` / `bg-bg-hover` / `bg-bg-block-hover`，导致规范类名不生效。

> 字体实现：后台业务页由 `Prototype/公共导航.css` 导入带当前公共缓存版本的 `src/styles/global.css`；独立页在 `<head>` 中直接引用同版本文件。不要使用构建工具专属的 `@/assets/...` 别名，确保 `file://` 双击预览可加载全局字体规则。

---

**说明**：本文件是唯一视觉事实源。《设计系统.html》只负责可视化镜像本文件中的 token、布局与组件规范，不得反向定义新规则。视觉调整先修改本文件，再同步《设计系统.html》并完成一致性检查。
