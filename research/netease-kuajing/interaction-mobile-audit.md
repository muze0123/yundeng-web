# 网易跨境浏览器官网：首页交互与移动视口实测

- 实测日期：2026-08-13
- 实测入口：`https://kuajing.163.com/`
- 方法：隔离 `agent-browser` 会话，真实点击后重新读取 URL、DOM/可访问性树和截图
- 边界：未注册账号，未提交反馈，未上传文件，未完成图形验证码，未使用用户真实业务数据。

## 1. 桌面首屏和顶部导航

首屏在 1280 x 720 视口下同时显示：

- 顶部横幅：“跨境电商增长护航计划 无门槛优惠券 限时领取”，“立即领取”链接以新标签打开 `https://kuajing.163.com/register`。
- 导航：首页、核心功能、品牌动态、AI功能、下载、帮助中心、限时活动/分享得¥30、免费注册。
- 右上角浮标：“限时特惠/领取”。
- 右侧工具条：立即体验、购买咨询、问题反馈。
- 底部固定条：“立即注册，限时领取无门槛优惠券”，带手机号、验证码、邀请码、协议和注册按钮。
- 主视觉右侧另有一套嵌入式注册表单。

导航实际路由：

| 入口 | 实际 URL |
| --- | --- |
| 首页 | `https://kuajing.163.com/` |
| 核心功能 | `https://kuajing.163.com/cores` |
| 品牌动态 | `https://kuajing.163.com/brandnews` |
| AI功能 | `https://kuajing.163.com/aifeatures` |
| 下载 | `https://kuajing.163.com/download` |
| 帮助中心 | `https://kuajing.163.com/helpCenter?node=859210024509145105` |
| 限时活动/分享得¥30 | `https://kuajing.163.com/inviteShare` |

“免费注册”不跳转，在当前页打开注册弹窗。

证据：

- `screenshots/desktop-home-initial.png`
- `screenshots/desktop-home-full.png`
- `screenshots/desktop-header-free-register.png`

## 2. 顶部横幅、浮标和底部固定条

### 顶部横幅

- 点击横幅图片：新标签打开 `/register`。
- 点击右上角关闭：横幅 DOM 移除，主导航顶部位置从 `66px` 变为 `0px`。
- 证据：`screenshots/desktop-top-ad-closed.png`。

### 右上“限时特惠”浮标

- 点击图片：不跳转，打开与“免费注册/立即体验”同类的注册弹窗。
- 点击浮标关闭：`.fixed-ad` 从 DOM 移除。
- 证据：`screenshots/desktop-floating-ad-open.png`、`screenshots/desktop-floating-ad-closed.png`。

### 底部固定注册条

- 点击右上角关闭：`.footer-fixed-reg` 从 DOM 移除。
- 证据：`screenshots/desktop-footer-fixed-closed.png`。

## 3. 右侧固定工具条

### 立即体验

- 留在首页，打开 850 x 500 注册弹窗。
- 弹窗左侧展示“10万+ 全球设备”、“100+ 电商平台”、“50ms 低延迟”；右侧为手机号、短信验证码、邀请码、协议勾选和“立即注册”。
- 证据：`screenshots/desktop-side-immediate-experience.png`。

### 购买咨询

- 单击后工具条左侧展开顾问二维码。
- 文案：“扫码添加顾问 / 享受一对一专家服务”。
- 证据：`screenshots/desktop-side-purchase-consult-open.png`。

### 问题反馈

- 跳转 `https://kuajing.163.com/feedback`。
- 问题类型：Bug（默认）、想法、评价、功能建议、视觉风格。
- 反馈文本上限 200 字；图片支持 `.jpg,.jpeg,.png`，可多选；联系电话上限 11 字。
- 空提交时弹出错误 Toast：“请输入您的反馈意见或问题内容”，未向服务端提交。
- 证据：`screenshots/desktop-feedback-empty-submit.png`。

## 4. 注册表单与协议

主视觉表单与注册弹窗的实测校验一致：

- 手机号：最长 11 字符。
- 短信验证码：最长 6 字符。
- 空提交同时显示：“请输入正确的手机号”、“请输入6位验证码”、“请同意《服务协议》和《隐私协议》”。
- “我要填写邀请码”点击后增加“请输入邀请码（选填）”，上限 20 字符。
- 填入无效邀请码后，页面显示“邀请码无效”。
- 在空或明显无效手机号下点击“获取验证码”，仅显示“请输入正确的手机号”。
- 使用非用户的占位格式数值时，页面没有出现可见图形验证码、倒计时或成功提示；未继续尝试短信验证。
- 未点击最终注册提交，未创建账号。

协议链接均以新标签打开：

- 服务协议：`https://kuajing.163.com/richContent?id=serviceAgreement`
- 隐私政策：`https://kuajing.163.com/richContent?id=privatePolicy`

实测阅读到两页底部：

- 服务协议标注生效日期 2025-11-20，共7条：定义、服务内容及规则、双方权利义务、知识产权、责任限制、争议解决、其他。其中明示已出售设备不支持退换，争议交中国国际经济贸易仲裁委员会（浙江分会）仲裁。
- 隐私政策标注生效日期 2025-11-20，共7节，说明收集手机号/验证码、账号信息、IP、操作系统、浏览器类型、访问页面/时间、网络日志以及密码管理器中用户主动存储的账密；个人信息存储在中国境内，用户请求通常在15个工作日内处理。联系方式包含 `400-0886163` 与 `Privacy@service.netease.com`。

证据：

- `screenshots/desktop-hero-form-empty-submit.png`
- `screenshots/desktop-hero-form-invite-expanded.png`
- `screenshots/desktop-hero-invite-invalid.png`
- `screenshots/desktop-service-agreement.png`
- `screenshots/desktop-service-agreement-end.png`
- `screenshots/desktop-privacy-policy.png`
- `screenshots/desktop-privacy-policy-end.png`

## 5. 首页轮播和核心功能菜单

### 首页轮播

- 共2个轮播位，通过底部按钮 1/2 切换。
- 第1屏为“网易跨境浏览器 / Agent 驱动跨境生意全链路自动化”，含嵌入式注册表单。
- 第2屏是纯图片广告，图片内文案为“网易跨境浏览器 / 用科技为跨境店铺保驾护航”、“为跨境店铺打造覆盖全渠道，安全、稳定、统一操作的工作台”、“立即体验”。
- 实际点击第2屏图片没有打开新标签，当前 URL 也未变；其 `<a target="_blank">` 没有 `href`。
- 证据：`screenshots/desktop-home-carousel-slide2.png`。

### 核心功能下拉菜单

桌面端悬停“核心功能”后显示4组12项，实际点击映射如下：

| 功能 | URL |
| --- | --- |
| 纯净的独立环境 | `/cores?ftype=1` |
| 零接触式账密托管 | `/cores?ftype=2` |
| 风险操作熔断机制 | `/cores?ftype=3` |
| 数据防泄漏机制 | `/cores?ftype=10` |
| 事前风险全拦截 | `/cores?ftype=11` |
| 事中全景行为留存 | `/cores?ftype=12` |
| 全链路行为追溯 | `/cores?ftype=7` |
| 毫秒级全球加速 | `/cores?ftype=4` |
| 自动化运营辅助 | `/cores?ftype=5` |
| 颗粒度权限管理 | `/cores?ftype=6` |
| 跨平台无界协同 | `/cores?ftype=8` |
| 云端智能调度 | `/cores?ftype=9` |

证据：`screenshots/desktop-core-menu-expanded.png`。

## 6. 移动视口实测（390 x 844）

已核实的关键差异：

- 页面有 `width=device-width, initial-scale=1` viewport meta，但 `body` 实际保持 1250px 宽，文档横向滚动宽度也是 1250px，不是独立移动布局。
- 顶部横幅、限时特惠浮标、右侧工具条全部保留。
- 顶部导航不折叠为汉堡菜单；仅“首页”完全在 390px 可视区，“核心功能”右半部分及其后菜单项越出视口。
- 移动视口直接点击只显示一部分的“核心功能”仍能跳转 `/cores`。
- 悬停核心功能时，下拉层宽度被压到390px，但内部4列仍按210px列宽并排布局；第2列开始已部分裁切，第3、4列完全越出视口。
- “购买咨询”展开的二维码层在390px视口内完全可见；“问题反馈”仍正常跳转 `/feedback`。
- “立即体验”弹窗仍为 850px 宽，水平居中后范围为 `x=-230..620`。关闭按钮在 `x=586..604`，手机号输入框在 `x=240..570`，提交按钮也在 `x=240..570`，均不能完整出现在390px首屏可视区。
- 点击弹窗遮罩层或按 Escape 不会关闭弹窗。手动横向滚动到右侧后才能接近关闭按钮；这是实际可用性问题。
- 底部固定注册条在移动视口下没有稳定出现：多数干净移动会话等待3秒后 DOM 仍不存在；在一次打开注册弹窗的时序中则延迟出现于底部。因此不将其定性为“移动端必然隐藏”，而是加载/渲染状态不一致。

证据：

- `screenshots/mobile-390-home.png`
- `screenshots/mobile-390-core-menu-hover.png`
- `screenshots/mobile-390-register-dialog.png`
- `screenshots/mobile-390-dialog-horizontal-scroll.png`
- `screenshots/mobile-390-purchase-consult-open2.png`
- `screenshots/mobile-390-footer-fixed.png`

## 7. 结论边界

- 上述是真实浏览器交互事实，不是从截图或源码推测。
- 这份子报告覆盖首页指定交互和移动视口，不等于对全站所有二级页内容的100%阅读。
- 需要手机短信、图形验证码、完成注册、上传或反馈提交的链路停在最终不可逆/对外发送前。
