# Vercel 部署说明

## 目标与边界

- 部署平台：Vercel，项目名 `yundeng-web`。
- 生产分支：GitHub 仓库 `muze0123/yundeng-web` 的 `main`。
- 站点类型：纯静态原型，无后端、数据库、运行时环境变量或安装步骤。
- 公网入口：根路径 `/` 临时重定向到 `/Prototype/index.html`。
- 生产域名：`https://yundeng-web.vercel.app`。
- 本地能力：原型源码保持原有相对路径，继续支持 `file://` 双击预览。
- 内容边界：PRD、产品分析和工程规范保留在 Git 仓库；公网发布包只包含 `Prototype/`、`src/assets/` 和根目录本地兼容入口 `index.html`，避免内部资料和本机配置泄露。
- 新手引导截图：账号、IP 和代理端点在发布前使用不可逆像素化处理；`scripts/onboarding-asset-hashes.json` 在构建时锁定全部截图，替换或新增素材必须重新审核。

## 自动发布

项目使用 Vercel 原生 Git 集成，不使用 GitHub Actions 和长期 `VERCEL_TOKEN`：

- 向非 `main` 分支推送或创建 Pull Request：生成 Preview Deployment。
- 合并或推送到 `main`：生成 Production Deployment，并更新生产域名。
- 构建命令：`bash scripts/build-static.sh`。
- 输出目录：`dist`。

首次关联项目时执行：

```bash
vercel link --project yundeng-web
vercel git connect https://github.com/muze0123/yundeng-web.git
```

## 发布前验证

```bash
node scripts/verify-static.mjs --source .
bash scripts/build-static.sh
git diff --check
```

重点人工检查：

1. 双击 `Prototype/index.html` 能打开导航页。
2. 双击 `Prototype/系统框架.html` 能加载首页模块。
3. 双击业务模块能回到对应的 SystemFrame 路由，且无循环跳转。
4. 首页卡片、侧栏菜单、前进、后退和刷新后的 iframe、标题与高亮一致。
5. 新手引导截图、公共导航、字体样式与中文路径正常加载。

## 手动预览与生产发布

Git 自动发布之外，可用以下流程做蓝绿验证：

```bash
vercel build --target=preview
vercel deploy --prebuilt --target=preview
```

预览确认后再提升或发布到生产：

```bash
vercel promote <preview-deployment-url>
```

生产域名可执行远程冒烟测试：

```bash
bash scripts/smoke-test.sh https://<production-domain>
```

## 回滚

优先在 Vercel Dashboard 的 Deployments 中选择上一条已验证部署并执行 Promote to Production。代码层随后使用普通 Git revert 提交恢复，禁止重写共享分支历史。

回滚后重新执行线上冒烟测试，并确认根入口、SystemFrame、中文资源、响应头和内部目录 404。

## 故障定位

- 构建失败：先查看构建日志中的 `verify-static.mjs` 错误，通常为本地资源缺失、入口路由回归或未脱敏手机号。
- 页面 404：确认文件已进入 `dist`，并检查中文文件名大小写与 Unicode 形式。
- iframe 空白：确认 `X-Frame-Options` 为 `SAMEORIGIN`，业务模块和 SystemFrame 位于同一域名。
- Git 未触发：确认 Vercel 项目已连接正确仓库，Production Branch 为 `main`。
