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

已执行并由 coordinator 复核：

- `git diff --check origin/codex/m7-ui-57-group-logs-visible-ui...HEAD`：通过。
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-57-group-logs-visible-ui --spec docs/specs/M7-UI-53-team-page.md --include-worktree`：通过，source netLoc 530，source files 6。
- Targeted Prettier / ESLint / Vite admin build：通过。
- Admin-target TypeScript：通过。
- Root `tsc -p tsconfig.json`：当前 worktree runtime 缺少 repo 后端依赖（Nest/BullMQ/Prisma/Supabase 等），不能作为本页通过证据；admin-target TS 已通过。
- Focused Playwright `apps/admin/tests/m7-ui-team-page.spec.ts`：7 passed。
- Stacked M7 visible UI regression：79 passed。

## Visual Evidence

- Desktop screenshot: `/tmp/uzmax-m7-ui-53-team-page-visible-ui/react-team-desktop.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-53-team-page-visible-ui/react-team-mobile-320.png`
- Metrics: `/tmp/uzmax-m7-ui-53-team-page-visible-ui/react-team-metrics.json`
- Metrics values: `activePageId=tenant.team`, `shellLevel=tenant`, `bodyScrollWidth=1280`, `memberCount=4`, `cardCount=4`, `navWidth=231`

## Browser Comparison Notes

- Source inspected/compared: owner HTML team region, `/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/team.ts`, and React screenshots above.
- React candidate keeps the tenant-layer shell, team members/roles split, member drawer, role/invite modals, degraded/mock/read-only/local-only boundary copy, and 320px readable fallback visible.
- Remaining visual delta: this is still UI-first synthetic evidence and not owner visual acceptance; DB/API/authz/audit/invite/Telegram persistence remain explicitly out of scope.

## 备注

- 本页属于栈内 UI-first candidate；未声称 owner visual acceptance、owner runtime closure 或发布闭环。
