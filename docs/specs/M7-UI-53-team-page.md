# M7-UI-53 团队页

## 目标
在租户路由上实现可见的 `tenant.team` 页面（团队）前端骨架，使用 unpacked 6/owner 公开源作为结构对标，默认以 mock/degraded/read-only/browser-local 行为展示，不触达真实写入。

## Owner
Owner：项目 owner。

## 时间盒
2026-07-05（缺失证据时转入失败分支或降级）。

## Spec 类型
feature

## 触碰模块/文件
- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/team/TeamPage.tsx`
- `apps/admin/src/pages/team/TeamViews.tsx`
- `apps/admin/src/pages/team/TeamDialogs.tsx`
- `apps/admin/src/pages/team/teamFallback.ts`
- `apps/admin/tests/m7-ui-team-page.spec.ts`
- `docs/specs/M7-UI-53-team-page.md`
- `docs/evidence/M7/M7-UI-53-team-page.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`

## 变更预算与路径分类
- source 预算：changed source files <= 12、net source LOC <= 600、new source files <= 5
- test/generated/lock/config/docs 预计按需变更
- 无外部 API/SDK 依赖
- 无例外

## 文档触发检查
- `none`

## 前置条件
- Worktree：`/Users/atilla/.codex/worktrees/m7-ui-53-team-visible-ui`
- 分支：`codex/m7-ui-53-team-visible-ui`
- 启动前已完成路径与分支确认。

## 实施步骤
1. 在 `registry.ts` 将 `tenant.team` 的状态更新为 `implementation_candidate_pending_pr_review`，`targetSpecId` 调整为 `M7-UI-53-team-page`。
2. 在 `PageOutlet.tsx` 接入 `TeamPage` 渲染并注入 `selectedTenantId`。
3. 用 `TeamPage/TeamViews/teamFallback` 实现可见的 members/roles 结构、邀请弹窗、角色编辑、成员抽屉与强制状态。
4. 新增 focused Playwright 验证用例覆盖页面路由、边界文案、搜索空态、邀请、角色编辑/删除、成员抽屉、本地边界状态与 320 移动兜底。

## 通过条件
- 路由切换后可在租户导航看到 `tenant.team` 页面。
- 页面在 degraded 显示真实 mock 行为；`loading/empty/error/permission/degraded` 可验证。
- Playwright 关键场景通过并产出截图 + 指标。

## 失败分支
- 回退到未展示的最小可见实现或转入 owner 缺失项说明。

## 不做什么
- 不做 DB/API/authz/audit、invite email、成员变更持久化、Telegram 真实绑定。

## 验收映射
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`（租户页面可视闭环项）
