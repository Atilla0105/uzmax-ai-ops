# M7-UI-75 Team Source Parity Refresh

## Goal

Refresh the existing visible UI-first `tenant.team` / `团队` page on top of `origin/codex/m7-ui-74-group-logs-source-parity-refresh` so the visible source-parity details, focused tests and evidence match the current owner prototype/source package without expanding the page into a runtime implementation.

This is a source-parity UI evidence slice. It does not implement team DB/API/authz writes, production permission mutation, invite email sending, Telegram binding persistence, audit writes, owner visual acceptance, merge closure, runtime closure, GA-0 or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-74-group-logs-source-parity-refresh`.
- Confirm `tenant.team` remains TENANT layer only: `/design` opens group shell, tenant selection enters tenant shell, active page `tenant.team`, tenant categories only `运营/数据/智能/管理/洞察`.
- Decide later whether real team-member/runtime/authz/audit/invite/Telegram persistence proceeds through separate approved specs.
- Keep production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-75-team-source-parity-refresh` on branch `codex/m7-ui-75-team-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Read `AGENTS.md`, current diff, M7-UI-53 spec/evidence, current team source/tests, owner unpacked team page/fixtures and owner HTML before claiming evidence.
- Preserve centralized synthetic/mock/degraded/read-only/browser-local rows and local-only actions.

## Timebox

0.5 workday. If the page requires shared shell/router/PageOutlet/registry/API/DB/package/lock/global config/CI guard edits, real team runtime, production invite email, Telegram persistence, audit writes or broad UI redesign, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-75-team-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-75-team-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-team-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-team-page.spec.ts`
- Conditional source scope, only where owner/source/browser comparison proves current React mismatch:
  - `apps/admin/src/pages/team/TeamPage.tsx`
  - `apps/admin/src/pages/team/TeamViews.tsx`
  - `apps/admin/src/pages/team/TeamDialogs.tsx`
  - `apps/admin/src/pages/team/teamFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 4 conditional only
- source net LOC: <= 120 conditional only
- new source files: 0
- test files changed/added: <= 2 focused Playwright specs
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

```yaml
source:
  - apps/admin/src/pages/team/TeamPage.tsx
  - apps/admin/src/pages/team/TeamViews.tsx
  - apps/admin/src/pages/team/TeamDialogs.tsx
  - apps/admin/src/pages/team/teamFallback.ts
test:
  - apps/admin/tests/m7-ui-team-source-parity.spec.ts
  - apps/admin/tests/m7-ui-team-page.spec.ts
docs:
  - docs/specs/M7-UI-75-team-source-parity-refresh.md
  - docs/evidence/M7/M7-UI-75-team-source-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/specs/M7-UI-53-team-page.md`
- `docs/evidence/M7/M7-UI-53-team-page.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/team/TeamPage.tsx`
- `apps/admin/src/pages/team/TeamViews.tsx`
- `apps/admin/src/pages/team/TeamDialogs.tsx`
- `apps/admin/src/pages/team/teamFallback.ts`
- `apps/admin/tests/m7-ui-team-page.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/team.ts`
- v1.1 tenant-layer, team/permission/RLS, mobile fallback and release-boundary sections.

| Source | Required use |
|---|---|
| Owner HTML rendered state | Browser-comparable source for visible team title, members/roles tabs, primary action switch, search/control geometry, modal/drawer surface and shell/sidebar context. |
| Unpacked team page | Structured source for members table, roles table, invite modal, member drawer, role editor, local interaction vocabulary and geometry. |
| Unpacked `fixtures/team.ts` | Structured source for member/role columns, fixture rows and permission groups. |
| v1.1 docs | Product/runtime boundary: team and permission management are real product scope, but this slice is UI evidence only and does not imply authz/runtime/audit closure. |

## Source Parity Decision

React follows the unpacked team source and owner prototype system for:

- `团队` title with no visible `tenant:` header pollution.
- Tabs `成员` and `角色管理`.
- Primary button switching between `邀请成员` and `新建角色`.
- Member search placeholder `搜索姓名 / 邮箱 / 分组…`.
- Member columns `成员/角色/成员类型/分组/在线状态/接待中/今日累计/最近登录`.
- Roles columns `角色/类型/说明/成员数/创建时间/操作`.
- Invite modal, member drawer and role editor labels/geometry aligned to the unpacked source while preserving local-only boundary copy.
- Runtime/degraded boundary labels remain present for evidence and tests but are visually lowered so they do not dominate the primary owner-like page header/table.

## Impeccable / Design Decision Record

Adopted by default: restrained dense product UI, owner/source-like compact page header, tabs, bordered table, modal/drawer surfaces, readable member card fallback at 320px, tenant-only sidebar parity, local-only copy on risky actions, and explicit hidden/present runtime boundary evidence.

Rejected: old shell visual vocabulary, visible `tenant:` header text, old `--uzmax-*` as visual source, broad redesign, production-looking team mutations, real invite sending, Telegram binding persistence, audit-write claims, runtime closure copy and owner-acceptance claims.

## Pass Conditions

- `tenant.team` renders inside tenant shell after selecting a tenant from `/design`.
- Browser evidence includes owner/source mapping, React desktop members, roles tab, invite modal, member drawer, role editor, collapsed nav and 320px mobile screenshots/metrics under `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/`.
- Focused Playwright covers tenant shell, active page `tenant.team`, title `团队`, tabs `成员/角色管理`, primary button switch, search placeholder, member columns, roles tab, invite modal fields, member drawer, role editor, collapsed nav `68px`, and mobile body/document width <= 320.
- Existing team page regression spec still passes after stale assertion repair.
- Source corrections stay small and limited to `apps/admin/src/pages/team/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-74-group-logs-source-parity-refresh --spec docs/specs/M7-UI-75-team-source-parity-refresh.md --include-worktree`
- Focused Playwright: `apps/admin/tests/m7-ui-team-source-parity.spec.ts` and `apps/admin/tests/m7-ui-team-page.spec.ts`
- Admin lint/typecheck/build available commands after checking `package.json`:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/team/TeamPage.tsx apps/admin/src/pages/team/TeamViews.tsx apps/admin/src/pages/team/TeamDialogs.tsx apps/admin/src/pages/team/teamFallback.ts apps/admin/tests/m7-ui-team-source-parity.spec.ts apps/admin/tests/m7-ui-team-page.spec.ts`
  - `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `git merge-tree --write-tree origin/codex/m7-ui-74-group-logs-source-parity-refresh HEAD`

## Failure Branches

- If owner HTML cannot be captured in browser, record the failure/degraded capture in evidence and rely on unpacked source mapping plus React browser screenshots.
- If Playwright cannot start because dependencies are unavailable after cleanup, record exact dependency failure and do not fake evidence.
- If source geometry requires shared shell/router/PageOutlet/registry/API/DB edits, stop and report the dependency instead of editing forbidden files.

## Not Doing

- No shared shell/topbar/sidebar/router/PageOutlet/registry/API/DB/schema/migration/generated/package/lock/global config/CI guard changes.
- No raw prototype fixture import.
- No real team-member mutation, permission write, invite email, Telegram binding persistence, audit write, production authz integration, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No real customer, order, Telegram, address, phone or production data.
