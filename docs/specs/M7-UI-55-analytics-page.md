# M7-UI-55 分析页

## 目标

在租户路由上实现可见的 `tenant.analytics` / 分析 页面，按 owner prototype / unpacked analytics source 呈现时间范围、维度、KPI、转人工分布、Top 问题和分析表。

## Owner

Owner：项目 owner。

## 时间盒

2026-07-05（缺失证据时转入失败分支或降级）。

## Spec 类型

feature

## 触碰模块/文件

- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
- `apps/admin/src/pages/analytics/analyticsFallback.ts`
- `apps/admin/tests/m7-ui-analytics-page.spec.ts`
- `docs/specs/M7-UI-55-analytics-page.md`
- `docs/evidence/M7/M7-UI-55-analytics-page.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/incidents/INC-2026-07-05-m7-ui-55-root-patch-target.md`

## 变更预算与路径分类

- source 预算：changed source files <= 12、net source LOC <= 600、new source files <= 5
- test/generated/lock/config/docs 预计按需变更
- 无外部 API/SDK 依赖
- 无例外

## 文档触发检查

- `none`

## 前置条件

- Worktree：`/Users/atilla/.codex/worktrees/m7-ui-55-analytics-visible-ui`
- 分支：`codex/m7-ui-55-analytics-visible-ui`
- Base：`origin/codex/m7-ui-54-config-visible-ui`

## 实施步骤

1. 在 `registry.ts` 将 `tenant.analytics` 的 `targetSpecId` 调整为 `M7-UI-55-analytics-page`，状态更新为 `visible_mvp_candidate_pending_pr_review`。
2. 在 `PageOutlet.tsx` 接入 `AnalyticsPage`，保持租户层 shell 与选中租户上下文。
3. 用 `AnalyticsPage/analyticsFallback` 实现标题、时间范围 segmented control、添加维度、导出本地 toast、KPI、转人工原因分布、Top 问题、维度 chips 和分析表。
4. 新增 focused Playwright 覆盖 tenant shell、时间范围、维度最多 2 个、本地导出、强制状态与 320px fallback。

## 通过条件

- 选择租户后点击分析，进入 `tenant.analytics`，外层 shell 仍为租户层，洞察分类下显示分析。
- 页面默认 degraded/mock/browser-local only，可见 `no production analytics metrics / no export file write / no analytics runtime / no audit write`。
- `loading/empty/error/permission/degraded` 可由 URL query 验证。
- 维度最多 2 个，超过时禁用或提示。
- Playwright 关键场景通过并产出截图 + 指标。

## 失败分支

- 若 UI 源对照或验证失败，回退到最小可见实现并在 evidence 中记录 blocked/remaining delta。

## 不做什么

- 不做 DB/API/analytics runtime/export job/file write/audit write/production metrics。
- 不声明 owner visual acceptance、runtime closure、release closure。

## Impeccable / Design Skill Layer

- 采纳：产品型 admin UI、密集数据面板、状态优先、移动仅 readable fallback、边界文案可见。
- 拒绝：旧 `--uzmax-*` 作为新视觉源、自由 dashboard 重设计、生产指标或导出写入暗示。

## Incident Note

本 slice 记录了 `INC-2026-07-05-m7-ui-55-root-patch-target.md`：早期 `apply_patch` 使用相对路径误落 root/main，已清理仅属于本 worker 的 root analytics 文件，并改用指定 worktree 绝对路径继续。
