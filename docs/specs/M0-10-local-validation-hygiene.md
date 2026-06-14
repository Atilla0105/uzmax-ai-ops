# M0-10 Local Validation Hygiene

## 目标

修复 `main` 在本地运行 `npm run check` 时，Knip 对 Prisma CLI workspace 归属的误差/漂移：`packages/db` 的 `prisma:generate` 脚本调用 `prisma` binary，因此 CLI 依赖必须归属于 `@uzmax/db` workspace，而不是只挂在 root。同步修正 M0 closeout evidence 中 PR #13 后的状态口径，避免本地验证和合并证据不一致。

## Owner

Owner：项目 owner 确认 M0 closeout 仍只代表技术地基闭合，不代表 Gate 1 Go；AI agent 执行依赖归属修复、证据同步、CI/本地验证和分支清理。

## 时间盒

0.25 个工作日。若依赖归属修复导致 CI 或 Prisma generate 异常，则回退到只记录本地/CI 平台差异并另开 infra spec。

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M0-10-local-validation-hygiene.md`
  - `docs/evidence/M0/kickoff-readiness-rollup.md`
  - `docs/evidence/M1/gates/Gate-1-decision.md`
  - `package.json`
  - `package-lock.json`
  - `packages/db/package.json`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只修复 dev tool dependency ownership、lockfile 和 M0/Gate 1 evidence 口径。
  - 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec；更新 root/package workspace dependency；刷新 lockfile；更新 M0/Gate 1 evidence 文案。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `prisma`、`knip`、`prisma:generate`，确认唯一 Prisma CLI 调用在 `packages/db/package.json` 的 workspace script。
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：none
- 判断依据：本 PR 只调整 dev dependency ownership、lockfile 与 evidence 文案，不新增或实质变更 eval/contracts/observability/environment/release 能力路径；`guard:doc-triggers` 必须保持通过。

## 前置条件

- PR #13 已合入 `main`，M0 closeout 与 Gate 1 No-Go evidence 已存在。
- 当前本地 `npm run check` 在 Knip 阶段复现 `prisma` dependency ownership 差异。

## 实施步骤

1. 将 `prisma` CLI devDependency 从 root package 移到 `packages/db/package.json`。
2. 刷新 `package-lock.json`，确保 npm workspace lock 与依赖归属一致。
3. 更新 M0 rollup，记录 PR #13 closeout 已合入，并说明 M0-10 只修复本地验证卫生。
4. 修正 Gate 1 decision 标题，使标题与 No-Go 内容一致。
5. 运行 Knip、Prisma generate、guard、PR shape、diff whitespace，并在 PR/CI 中验证完整 check。

## 通过条件

- `npm run knip` 不再报告 root `prisma` unused 或 `packages/db` unlisted binary。
- `npm run -w @uzmax/db prisma:generate` 仍可成功执行。
- `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M0-10-local-validation-hygiene.md` 通过。
- 本 PR 不改 `apps/`、业务 source、schema、migration、CI workflow、provider、connector 或 adapter。
- Gate 1 仍保持 No-Go / owner inputs pending，不因本地验证修复而放行 M1 实现。

## 失败分支

- 若 workspace-level Prisma CLI 在 CI 不可用：回滚 dependency move，改用 Knip config 显式记录 binary ownership，并在 PR Hygiene 表解释原因。
- 若 lockfile 刷新引入无关依赖 churn：回滚 lockfile 并重新用最小 npm 命令生成。
- 若发现 Gate 1 owner inputs 已补齐：不在本 PR 放行 M1，另开 Gate 1 Go/No-Go spec 复判。

## 不做什么

- 不修改 Prisma schema、migration、RLS SQL 或 spike harness。
- 不实现 M1 schema、API、后台页面、eval runner 或业务能力。
- 不改 CI workflow、GitHub ruleset、Supabase/Render/Vercel/Sentry 配置。
- 不处理真实客户样本或改变 ADR-003 dev-only 限制。

## 验收映射

- K-03：本 PR 有独立 spec。
- K-04：触碰模块清单约束本地验证卫生修复范围。
- J-05：M0 closeout evidence 保持滚动一致，不把验证漂移留到后续阶段。
