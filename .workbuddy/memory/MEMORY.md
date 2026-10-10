# 云登 PC 端原型 · 项目长期约定

## 环境约束（重要）

- **本机沙箱内无头 Chrome 无法打开真实页面**：`sandbox initialization failed: Operation not permitted`，`--dump-dom` 退出码 133、`--screenshot` 退出码 137/被 SIGTERM，仅 `about:blank` 可用。**不要再用 Chrome 截图/dump-dom 验证页面**。
- 本地 HTTP 服务（127.0.0.1）返回 502，被代理拦截；验证一律走 `file://` 或 jsdom。
- 替代方案：见下方「jsdom 验证配方」。

## jsdom 验证配方（校验单文件原型页面的标准做法）

安装位置：`/Users/zhangbin/.workbuddy/binaries/node/workspace/node_modules`（jsdom 30.x）。
运行方式：`NODE_PATH=<workspace>/node_modules <managed node> script.js`。

必做桩（缺一即报错或结论失真）：

| 桩 | 原因 |
| --- | --- |
| `window.tailwind = {}` | 页面 `tailwind.config = …` 会抛 `tailwind is not defined` |
| `window.structuredClone` 兜底实现 | jsdom 未实现 |
| `HTMLDialogElement.prototype.showModal/close` | jsdom 报 `showModal is not a function`（**内容已写入 `#dialogBody`，可在报错后继续断言**） |
| 内存版 `localStorage`（`Object.defineProperty` 注入） | `file://` 为 opaque origin，jsdom 的 localStorage 抛错，会触发页面兜底 toast「本次修改仅在当前页面保留」污染断言 |
| `getBoundingClientRect` 按需覆盖到被测元素 | jsdom 恒返回 0，拖拽上下半区判定、插入位置无法验证 |

- 页面内 `lucide` 缺失是安全的（`icons()` 用 `window.lucide?.createIcons()`）。
- **测「嵌入态」分支**：`Object.defineProperty(window, 'parent', { configurable:true, value:{ postMessage: m => sent.push(m) } })` 即可让 `window.parent !== window` 成立并捕获消息（jsdom 顶层窗口默认 `parent === window`）。**不要**加载 `公共导航.js`（不配 `resources` 时外链脚本本就不会执行，正好避免它把页面重定向走）。模块内的 `initData(null)` 等顶层函数声明可直接从 `window` 调用，不必等 1500ms 的 `start()` 兜底计时器。
- 断言方式：注入后直接查 DOM（`#dialogBody`、`#results`、`#teamToast`）、派发 `MouseEvent`（注意 NodeList 无 `map`，需 `[...]` 展开）。
- 静态兜底：抽取内联 `<script>` 跑 `node --check`；统计 `<style>` 花括号配平；检查被删类名/函数是否仍有残留引用。
- 页面为 iframe 内业务模块时，`file://` 直开会被 `公共导航.js` 重定向到 `../index.html?page=<key>`；jsdom 中导航未实现，不影响断言。

## 已确立的交互标准

- 列表整行拖拽排序：**`design.md §5.14`**（样式与交互标准）。参考实现：`部门管理.html`、`角色管理.html`。整行可拖、无拖拽手柄列、落点用 2px primary 渐变插入线、非法落点 danger 浅底 + Toast 说明。
- 弹窗内「角色名 / 实体名 + 统计文本」的头部用 `.perm-detail-head.detail-inline`（统计文本紧跟名称，不用 `space-between`）。
- **抽屉覆盖范围**（对齐订单详情抽屉）：业务表单/详情抽屉覆盖**浏览器引擎区域之下整页**（含平台顶部导航与侧栏，顶边 = `#yundeng-browser-frame` 下沿）；**筛选抽屉（480px 白底）与所有居中弹窗仍贴模块视口**。两条可选实现路径：①模块 → SystemFrame 全局抽屉 `#moduleGlobalDrawer`（只接受结构化视图模型，白名单 id，适合 description-list/table/timeline 类详情）；②模块请求「整页视口」`postMessage({type:'yundeng:module-page-overlay', open})`，由 `系统框架.html` 给 `#routeOutlet` 加 `.is-page-overlay`，模块自行渲染遮罩与面板（适合复杂表单/权限树）。选择依据：壳层不承接业务语义。

## 协作注意

- 用户指令常省略「时」等成分，`关闭A提示B` 存在「关闭提示」/「关闭（操作）时提示」两种读法；涉及撤回已有功能时**先确认再改**。
- `design.md` 可能被用户在其 IDE 中并发编辑（本次会话中 §5.4 被扩充 58 行）；编辑前先读当前磁盘内容，改后提示用户注意版本一致。
- 文档授权边界见 `AGENTS.md`：默认只改 HTML；PRD / `design.md` / `设计系统.html` 仅在用户明确点名时修改。
