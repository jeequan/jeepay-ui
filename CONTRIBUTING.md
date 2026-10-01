# 参与 Jeepay UI

欢迎提交问题、文档、测试和代码。开始前请先阅读 [README](README.md)；一次 PR 尽量只解决一个问题。

## 分支与需求

- `dev` 是日常开发和前后端联调分支。社区功能、修复、文档 PR 默认提交到 `dev`，请从最新 `dev` 创建短期分支。
- `main` 是稳定发布分支，由维护者通过发布 PR 接收已验证的变更；不把尚未发布的分支头当作稳定版本。
- 开发前先检索已有 Issue/PR。功能或较大修改先登记 Issue，写清问题、影响端（运营平台/商户系统/收银台）、修改范围、不做的内容和可验证的验收标准；小修复可直接在 PR 中说明。
- Bug 请给出前后端版本、复现步骤、预期/实际结果和脱敏日志。不要提交密钥、真实支付数据、商户资料或生产配置。

## 开发与回归

与 CI 对齐，使用 Node.js 20.19+ 和 npm 10；提交依赖变更时同步对应 `package-lock.json`，安装使用 `npm ci`。项目当前没有统一的 lint/typecheck 脚本，不要把构建通过等同于全量业务验收。

按影响范围运行检查；跨端、共享部署配置或发布候选变更运行全部检查：

```sh
# 运营平台
(cd jeepay-ui-manager && npm ci && npm run build)

# 商户系统
(cd jeepay-ui-merchant && npm ci && npm run test:merchant-config && npm run build)

# 聚合码收银台
(cd jeepay-ui-cashier && npm ci && npm run test:oauth && npm run build && npx playwright install chromium && npm run test:oauth:browser)
```

Linux 缺少浏览器系统依赖时，使用 `npx playwright install --with-deps chromium`。商户配置测试范围见 [测试说明](jeepay-ui-merchant/tests/README.md)。

- 修复尽量附带能复现原问题的回归测试，先确认旧行为失败、修复后通过。暂不能自动化时，在 PR 说明原因和可重复的人工步骤。
- 涉及页面交互时，记录正常路径、异常返回、重复点击、取消/关闭后重开、前进/后退、刷新和权限差异等受影响场景；UI 变化附脱敏截图。
- 涉及 API、支付渠道或环境变量时，在隔离测试环境与配套后端联调。自动化中的 mock 不代表真实渠道已验证；不要用真实交易补充测试。
- PR 写出实际执行的命令、结果和未覆盖项，不把“未运行”写成“通过”。

## PR 验收与合并

1. 填写 PR 模板，关联 Issue，逐项给出验收证据；标明配套后端 PR、兼容性和升级影响。不确定的方案可先发 Draft。
2. PR 自动执行 `callback`、`manager build`、`merchant build`。这些检查覆盖现有回归、三端构建和管理/商户端构建环境变量泄漏检测，不部署、不发布。
3. 合并前由维护者审查范围、测试、接口兼容性和安全影响，解决审查意见并确认最新提交的检查成功。审批和必需检查需要仓库管理员另行配置分支保护。
4. 合并到 `dev` / `main` 后相同 CI 会再次检查实际合并提交。维护者还需按验收标准做前后端联调回归，失败先修复或回退，不能仅凭 PR CI 通过发布。

## 稳定发布与紧急修复（维护者）

- 从已完成回归的 `dev` 准备面向 `main` 的发布 PR，确认合并提交检查通过后，用明确的版本 Tag（例如 `vX.Y.Z`）和 GitHub Release 固定发布内容。Tag 指向验证过的提交，不移动已有版本 Tag。
- Release 必须记录前端 Tag/提交、配套 [Jeepay 后端](https://github.com/jeequan/jeepay) Tag/提交及已验证的组合；不能因版本号相同就假定兼容。
- 发布说明列出变更、破坏性 API/配置变化、运行环境与依赖要求、升级顺序、需要的后端迁移及回退限制。无额外升级步骤也明确说明；涉及配套后端时链接其升级说明。
- 稳定版紧急修复从受影响的稳定 Tag 或对应 `main` 提交开 `hotfix/*`，以 PR 进入 `main`，补回归、审查和补丁版本 Release；随后通过 PR 将修复同步回 `dev`，关联原修复并重跑回归。适配冲突时保留测试，不覆盖 `dev` 的新功能。

## 安全问题

不要在公开 Issue/PR 发布未修复漏洞的利用细节、密钥或敏感数据。目前没有已验证可用的专用私密报告入口，请等待维护者确认私下接收方式后再发送漏洞详情。

维护者需启用并验证 GitHub Private vulnerability reporting，或公布经确认的专用联系方式，再补充安全政策、处理范围和响应说明。本指南不代表私密报告功能已经启用。
