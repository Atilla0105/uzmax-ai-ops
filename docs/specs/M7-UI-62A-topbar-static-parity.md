# M7-UI-62A Shared Topbar Static Parity v2

## 目标

在 `origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2` 上，重建一版小而可见的共享 AppShell topbar 静态视觉基线，严格对齐 owner 输入（`/Users/atilla/Downloads/运营塔台1.0.html` 与 `unpacked 6`）的上层结构与文案，不进行页面体迁移。

## Owner

Owner 负责最终范围、可接受性决策、owner acceptance、GA/生产/真实业务决策与发布。AI 仅执行该 slice 并产出证据。

## 时间盒

半天。若需改动 DB/API/worker/lock/config 或进行页面级迁移，立即进入失败分支并停工。

## Spec 类型

fix

## 触碰模块/文件

- `docs/specs/M7-UI-62A-topbar-static-parity.md`
- `docs/evidence/M7/M7-UI-62A-topbar-static-parity.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/tests/m7-ui-topbar-static-parity.spec.ts`
- `apps/admin/src/shell/AppShell.css`

## 变更预算与路径分类

- source budget: changed source files <= 1、net source LOC <= 40、new source files <= 0
- test budget: changed test files <= 1
- docs budget: changed docs files <= 4
- generated/lock/config/backend/API/DB/worker/cron/CI: 0
- external API/SDK/provider/adapter basis: 无（仅读取既有 primitives）
- 例外：无

## 文档触发检查

- 结果：`updated`。
- 判断依据：`docs/doc-gates.md`。更新共享 shell 基线与 evidence 索引/ledger。

## 先决条件

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-62a-topbar-static-parity-v2`
- Branch: `codex/m7-ui-62a-topbar-static-parity-v2`
- Base: `origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2` at `8fdae9867aee480dc93653134556e215a3096f37`
- 读文件前置与上下文：
  - `AGENTS.md`
  - `docs/admin-design-system.md`
  - `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
  - `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx`
  - `/Users/atilla/源码/unpacked 6/shell/TenantSwitcher.tsx`
  - `apps/admin/src/shell/AppShell.tsx`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
  - `apps/admin/tests/m7-ui-page-router.spec.ts`

## 实施

1. 仅保留并对齐已有可见 topbar 结构：`52px` topbar、面包屑 + 只读租户胶囊、居中的搜索（`max-width: 440`、placeholder、keycap）、`PRODUCTION`、`68ms`、通知、用户 chip。
2. 将 keycap 从 `Cmd K` 改为 `⌘K`，其余行为（含原生 select 切租户机制）保持不变，不新增自定义 TenantSwitcher 下拉组件。
3. 仅在 AppShell test 上增加 topbar static parity 的 focused 套件：owner HTML 与 React 对照截图、topbar 指标落盘、`⌘K` 断言、320 兜底无横向溢出。
4. 补充 evidence/evidence index / migration ledger 状态与非闭环边界说明。

## 通过条件

- `/design` 打开默认 group 层：
  - topbar 可见；
  - `data-shell-level="group"`、`data-active-page-id="group.overview"`；
  - 搜索占位符为 `搜索会话、客户、订单、工单、知识…`；
  - keycap 显示 `⌘K`；
  - 组件仍显示 `PRODUCTION`、`68ms`、Bell badge `5`、用户 `韩雪` / `运营负责人`。
- 选择 `tenant-b` 进入 tenant 层：
  - `data-shell-level="tenant"`、`data-active-page-id="tenant.conversations"`；
  - 维持同套 topbar 结构和静态尺寸特征。
- 生成 owner HTML 与 React 桌面、tenant/group 状态与 mobile `320px` 截图与指标文件。
- mobile `320px` 下 `document.body.scrollWidth <= 320`。
- 不进行页面迁移、DB/API/后端/CI/lockfile 变更，不 claim owner acceptance/GA/发布。

## 失败分支

- 若出现 owner prototype 仅能靠复杂 custom switcher 或旧半成品才能复现，停止并拆分为后续 `M7-UI-62B`。
- 若测试/构建被环境基础依赖阻断，记录原因与剩余风险，不做 scope 扩张。

## 不做什么

- 不创建/改造自定义 `TenantSwitcher.tsx`；
- 不做 `group/tenant` 体页面迁移；
- 不改 backend/API/DB/worker/cron/CI/lockfile；
- 不把 `PRODUCTION`、静态 topbar 作为 owner acceptance、runtime closure、生产/GA/发布状态。

## 设计判断

- Adopted: 采用 owner static topbar 作为静态校准标准；保留现有可访问租户选择交互（原生 select）以减少行为回归。
- Rejected: 复杂自定义租户菜单、页面体迁移、owner 符合/验收状态的闭环宣告。

## 验证

- `git status --short --branch`
- `git diff --name-only origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2...HEAD`
- `npm run format:check`
- `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2`
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2 --spec docs/specs/M7-UI-62A-topbar-static-parity.md --include-worktree`
- `npm run typecheck`
- `npm run lint`
- `npm run build:admin`
- Playwright focused suite:
  - `apps/admin/tests/m7-ui-topbar-static-parity.spec.ts`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
- `npm run playwright`（如可执行）
- `node ...impeccable/detect.mjs --json apps/admin/src/shell/AppShell.tsx apps/admin/tests/m7-ui-topbar-static-parity.spec.ts`
- `git diff --check`
