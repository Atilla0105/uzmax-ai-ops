# M7-UI-62A Shared Topbar Static Parity v2 Evidence

## Status

`visible_ui_fix_candidate_pending_pr_review_not_accepted_not_runtime_closed`

该 Slice 在 `origin/codex/m7-ui-31-orders-visible-ui` + M7-UI-58/M7-UI-59 clean-stack base 上重放一个独立且可见的共享 topbar 静态对齐，目标是把 owner 输入与 React 可见 topbar 的 `⌘K` keycap、中文搜索 placeholder、`PRODUCTION`、`68ms`、通知计数和用户 chip 文案与布局对齐。
本 Slice 不做页面体迁移，不宣称 owner acceptance、runtime closure、GA-0 或生产/1.0 发布。`PRODUCTION` 仅为视觉静态参考。

## Scope

- Spec: `docs/specs/M7-UI-62A-topbar-static-parity.md`
- Branch: `codex/m7-ui-62a-topbar-static-parity-cleanstack`
- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-62a-topbar-static-parity-cleanstack`
- Base: `origin/codex/m7-ui-31-orders-visible-ui`
- Base SHA: `32ee788f83f3d656dd94133c4b9a810c717875a6`
- 变更范围:
  - `apps/admin/src/shell/AppShell.tsx`
  - `apps/admin/tests/m7-ui-topbar-static-parity.spec.ts`

## Required Reads / Source Mapping

- Required read:
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
- 使用映射：
  - `TopBar.tsx`：作为静态 topbar 文案与尺寸来源（52px topbar、中文搜索 placeholder、`⌘K`、`PRODUCTION` / `68ms` / 通知 / 用户 chip 结构）。
  - `TenantSwitcher.tsx`：用于 tenant 胶囊显示/交互语义，但本 slice 不复用其 DOM；保留现有 select/capsule 机制。
  - 现有 `AppShell.tsx`：仅对 keycap 文案和保持静态尺寸一致进行最小更改。

## Browser Evidence

Artifacts under `/tmp/uzmax-m7-ui-62a-topbar-static-parity-v2/`:

- `owner-html-desktop.png`（仅本地执行时生成）
- `owner-html-desktop-metrics.json`（本地时为原始 owner 指标；CI/无本地源文件时为 unavailable marker）
- `react-topbar-group-desktop.png`
- `react-topbar-group-desktop-metrics.json`
- `react-topbar-tenant-desktop.png`
- `react-topbar-tenant-desktop-metrics.json`
- `react-topbar-mobile-320.png`
- `react-topbar-mobile-320-metrics.json`

## Validation

本地执行回执（按要求顺序）：

- `git status --short --branch`
  - Output:
    - `## codex/m7-ui-62a-topbar-static-parity-cleanstack...origin/codex/m7-ui-31-orders-visible-ui`
- `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD`
  - Output:
    - `apps/admin/src/shell/AppShell.tsx`
    - `apps/admin/tests/m7-ui-topbar-static-parity.spec.ts`
    - `docs/admin-ui-page-migration-ledger.md`
    - `docs/evidence/M7/M7-UI-62A-topbar-static-parity.md`
    - `docs/evidence/M7/README.md`
    - `docs/specs/M7-UI-62A-topbar-static-parity.md`
- `npm run format:check`
  - Result: not run in this clean-stack replay unless requested.
- `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-31-orders-visible-ui`
  - Result: pass (`prettier-ignore-boundary ok`)
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-62A-topbar-static-parity.md --include-worktree`
  - Result: pass; changed files summary:
    - `changedFiles: 6`, `source: 1`, `docs: 4`, `test: 1`
- `npm run typecheck`
  - Result: pending this clean-stack replay.
- `npm run lint`
  - Result: pending this clean-stack replay.
- `npm run build:admin`
  - Result: not run in this clean-stack replay unless requested.
- Playwright focused suite:
  - `apps/admin/tests/m7-ui-topbar-static-parity.spec.ts`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
  - Result: pending this clean-stack replay.
- `npm run playwright`（可执行时）
  - Result: not run in this clean-stack replay unless requested.
- `node .../impeccable/scripts/detect.mjs --json apps/admin/src/shell/AppShell.tsx apps/admin/tests/m7-ui-topbar-static-parity.spec.ts`
  - Result: not run in this clean-stack replay unless requested.
- `git diff --check`
  - Result: pending this clean-stack replay.

## Known Boundaries

- `tmp` 截图产物已生成在 `/tmp/uzmax-m7-ui-62a-topbar-static-parity-v2/`（owner HTML、React 桌面组/租户、mobile 320）。

- 不闭环：
  - 本 PR 不宣称 owner visual acceptance、GA-0、发布、真实账号/真实客户数据、生产/暂存环境上线状态。
  - tenant 逻辑继续沿用现有 select + capsule 机制；不引入新的自定义 tenant 下拉菜单。
  - 不迁移页面 body（group/tenant 页面体仍采用现有实现状态）。
