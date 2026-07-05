# M7-UI-53 团队页面证据

## Status

`implementation_candidate_pending_pr_review`

本分支实现了可见 UI-first 的 `tenant.team` / 团队 页面，使用本地 mock/degraded/mock/read-only 浏览器本地边界，不声称生产运行权限/成员变更/audit 运行时闭环。

## Scope

- Spec: `docs/specs/M7-UI-53-team-page.md`
- Route: `tenant.team`
- Source target: `apps/admin/src/pages/team/TeamPage.tsx`, `apps/admin/src/pages/team/TeamViews.tsx`, `apps/admin/src/pages/team/TeamDialogs.tsx`, `apps/admin/src/pages/team/teamFallback.ts`
- Test target: `apps/admin/tests/m7-ui-team-page.spec.ts`

## Data Boundary

- 所有成员、角色、权限数据来源：`teamFallback.ts` 的本地 fixture。
- 页面仅展示 `loading/empty/error/permission/degraded` 的前端状态，不访问后端。
- 邀请：仅本地新增成员行。
- 成员抽屉、角色编辑、角色删除、通知开关、Telegram 绑定切换、停用/恢复都为本地状态变更。
- 未实现 `team mutation`、`invite email/send`、`audit write`、真实 Telegram 绑定。

## Validation

待执行（本地环境在命令层面已可复测）：

- `git diff --check origin/codex/m7-ui-57-group-logs-visible-ui...HEAD`
- `/Users/atilla/.cache/codex/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-57-group-logs-visible-ui --spec docs/specs/M7-UI-53-team-page.md --include-worktree`
- `prettier`/`eslint`/`tsc --noEmit` 针对变更文件的目标校验
- `vite build apps/admin --emptyOutDir`
- focused Playwright: `PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:4173 /Users/atilla/.cache/codex/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-team-page.spec.ts`

## 备注

- 本页属于栈内 UI-first candidate；未声称 owner visual acceptance、owner runtime closure 或发布闭环。
