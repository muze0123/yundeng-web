# 云登 PC 端产品原型

本仓库包含云登 PC 端高保真静态原型、模块 PRD、产品分析和设计规范。原型不依赖后端或前端构建框架，既可通过 `file://` 双击预览，也可由 Vercel 自动发布。

生产站点：<https://yundeng-web.vercel.app>

## 本地预览

- 双击 `Prototype/index.html` 查看全部原型。
- 双击 `Prototype/系统框架.html` 进入默认首页。
- 双击任一后台业务模块时，页面会自动回到 `系统框架.html?page=<key>`。

根目录的 `index.html` 是部署兼容入口，本地双击时同样会进入 `Prototype/index.html`。

## 发布架构

```text
Git 仓库
├── Prototype/        # 原型运行时
├── src/assets/       # 原型静态资源
├── PRD/              # 保留在源码仓库，不公开发布
├── 产品分析/          # 保留在源码仓库，不公开发布
├── scripts/          # 构建与验证
└── dist/             # 构建生成，禁止提交
```

执行本地发布校验：

```bash
bash scripts/build-static.sh
```

构建只复制 `Prototype/`、`src/assets/` 和根入口到 `dist/`，不会改写原型源码，因此不影响 `file://` 预览。`.vercelignore` 明确排除内部资料与本机配置，Vercel 最终只公开 `dist/`。完整的 Vercel、Git 分支和回滚流程见 [DEPLOYMENT.md](DEPLOYMENT.md)。
