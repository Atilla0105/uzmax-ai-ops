# M7-UI-75 Team Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch is closing a small existing dirty worktree for `tenant.team` / `团队` on top of `origin/codex/m7-ui-74-group-logs-source-parity-refresh`. It keeps team runtime downgraded: no team DB/API/runtime/authz write, invite email sending, Telegram binding persistence, production permission mutation, audit write, owner visual acceptance, merge closure, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-75-team-source-parity-refresh.md`
- Route: `tenant.team`
- Base: `origin/codex/m7-ui-74-group-logs-source-parity-refresh`
- Branch/worktree: `codex/m7-ui-75-team-source-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-75-team-source-parity-refresh`
- Source target:
  - `apps/admin/src/pages/team/TeamPage.tsx`
  - `apps/admin/src/pages/team/TeamViews.tsx`
  - `apps/admin/src/pages/team/TeamDialogs.tsx`
  - `apps/admin/src/pages/team/teamFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-team-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-team-page.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-75-team-source-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-75-team-source-parity-refresh...origin/codex/m7-ui-74-group-logs-source-parity-refresh` with existing dirty team source files and untracked `apps/admin/tests/m7-ui-team-source-parity.spec.ts`.
- `git branch --show-current`: `codex/m7-ui-75-team-source-parity-refresh`
- Initial dirty files matched the handoff list:
  - `apps/admin/src/pages/team/TeamDialogs.tsx`
  - `apps/admin/src/pages/team/TeamPage.tsx`
  - `apps/admin/src/pages/team/TeamViews.tsx`
  - `apps/admin/src/pages/team/teamFallback.ts`
  - `apps/admin/tests/m7-ui-team-source-parity.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/team/TeamPage.tsx` and read the product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior team spec/evidence:
  - `docs/specs/M7-UI-53-team-page.md`
  - `docs/evidence/M7/M7-UI-53-team-page.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/team.ts`
- Reviewed v1.1 team/permission/RLS, tenant-layer, mobile fallback and release-boundary references.

## Existing Dirty Diff Review

The inherited source diff is small and limited to the allowed team page source files. It does not add a new source file, shared shell edit, router/PageOutlet/registry edit, backend/API/DB edit, lockfile edit, global config edit or CI guard edit.

Current source parity adjustments in the inherited diff:

- Removes visible header text `tenant: {selectedTenantId}` from the team header while keeping `data-selected-tenant-id` for evidence.
- Moves member search into the members tab and changes placeholder to `搜索姓名 / 邮箱 / 分组…`.
- Keeps runtime labels in the DOM/test evidence while visually lowering the runtime note so the page is not dominated by degraded copy.
- Keeps the title `团队`, tabs `成员/角色管理`, primary action switch `邀请成员/新建角色`, members columns and roles columns aligned to the unpacked source.
- Updates invite modal, member drawer, role editor and role delete confirmation toward the owner/unpacked microcopy and geometry while keeping local-only boundary text.
- Keeps all mutations local-only through `teamFallback.ts`.

Two stale existing test assertions were repaired in `apps/admin/tests/m7-ui-team-page.spec.ts`:

- The role-management tab is now selected through `m7-team-tab-roles`, matching the current `role="tab"` markup.
- The role delete confirmation button is now `删除`, matching the current owner-like `ConfirmModal` label.

No assertion was weakened.

## Data And Runtime Boundary

- All members, roles and permission groups are synthetic/local fixtures in `teamFallback.ts`.
- Search, invite, role create/edit/delete, drawer notification preference, Telegram toggle and disable/restore are in-memory browser-local interactions only.
- No API request, DB write, authz mutation, invite email, Telegram binding persistence, permission persistence or audit write is implemented.
- Runtime labels remain present in evidence/test DOM: `degraded`, `mock`, `read-only`, `browser-local only`, `no production authz write`, `no team mutation`, `no invite email send`, `no Telegram binding change`, `no audit write`.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/`

Captured artifacts:

- Owner HTML desktop screenshot: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/owner-html-team-desktop.png`
- Owner HTML rendered sample: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/owner-html-team-rendered-sample.json`
- Unpacked/source mapping: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/unpacked-team-source-mapping.json`
- React desktop members screenshot: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/react-team-desktop-members.png`
- React roles tab screenshot: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/react-team-roles-tab.png`
- React role editor screenshot: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/react-team-role-editor.png`
- React invite modal screenshot: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/react-team-invite-modal.png`
- React member drawer screenshot: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/react-team-member-drawer.png`
- React collapsed nav screenshot: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/react-team-collapsed-nav.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/react-team-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/metrics.json`

Owner HTML rendered sample highlights:

- `ok=true`
- title `团队` present
- tabs `成员` and `角色管理` present
- primary button `邀请成员` present
- search placeholder `搜索姓名 / 邮箱 / 分组…`
- rendered table header/cells are blank in the current owner HTML sample, while unpacked source mapping provides the required member/role column structure.

Unpacked/source mapping highlights:

- Member columns: `成员/角色/成员类型/分组/在线状态/接待中/今日累计/最近登录`
- Role columns: `角色/类型/说明/成员数/创建时间/操作`
- Role editor labels present in source.
- Team fixtures present.
- `inviteFieldsPresent=false` is retained in the mapping because the script checks the React labels `昵称/邮箱/...` while the unpacked source labels the same invite fields as `姓名` and `邮箱 / 账号`; evidence does not claim all invite field labels are source-verbatim.

Metrics highlights:

- Desktop React: `shellLevel=tenant`, `activePageId=tenant.team`, `navWidth=232`, `topbarHeight=53`, `placeholder=搜索姓名 / 邮箱 / 分组…`, member columns match source, runtime labels present, runtime note not visible, group nav labels absent, tenant categories present.
- Roles tab: role columns `角色/类型/说明/成员数/创建时间/操作`, primary action `新建角色`, tenant shell retained.
- Role editor width: `600`; invite modal width: `460`, matching owner HTML `邀请成员` modal source width parity; member drawer width: `400`.
- Collapsed nav width: `68`.
- Mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`.

Current capture status: `COMPLETE`. Owner HTML, unpacked source mapping, React screenshots and metrics were captured under `/tmp/uzmax-m7-ui-75-team-source-parity-refresh/`.

## Validation

Validation status:

- PASS: `git diff --check`
- PASS: `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-74-group-logs-source-parity-refresh --spec docs/specs/M7-UI-75-team-source-parity-refresh.md --include-worktree`
- PASS: Admin ESLint on touched team source/tests:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/team/TeamPage.tsx apps/admin/src/pages/team/TeamViews.tsx apps/admin/src/pages/team/TeamDialogs.tsx apps/admin/src/pages/team/teamFallback.ts apps/admin/tests/m7-ui-team-source-parity.spec.ts apps/admin/tests/m7-ui-team-page.spec.ts`
- PASS: Admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- PASS: Focused Playwright:
  - Server: `node node_modules/vite/bin/vite.js apps/admin --host 127.0.0.1 --port 4173`
  - Test: `PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:4173 node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-team-source-parity.spec.ts apps/admin/tests/m7-ui-team-page.spec.ts --config=playwright.config.ts`
  - Result: 8 passed.
- PASS: `git merge-tree --write-tree origin/codex/m7-ui-74-group-logs-source-parity-refresh HEAD` returned tree `cc09616c60397d3562b303a55418d28fa4605608`.
- FAIL/ENV: Root typecheck `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` still fails because this worktree dependency install lacks backend/worker/db runtime dependencies including `@nestjs/common`, `@nestjs/core`, `@supabase/supabase-js`, `bullmq`, `@prisma/client` and `reflect-metadata`.

Validation environment repair notes:

- PATH used: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH`
- `pnpm install --offline --frozen-lockfile`: exited 0 but warned that package.json `workspaces` are not supported without `pnpm-workspace.yaml`.
- `pnpm install --frozen-lockfile`: exited 0 with the same warning.
- Because pnpm did not create the workspace link, validation added a temporary worktree-only symlink: `node_modules/@uzmax/ui-tokens -> ../../packages/ui-tokens`.
- Verified `@uzmax/ui-tokens/tokens.css` resolves to `packages/ui-tokens/src/tokens.css`.
- `pnpm install` produced an out-of-scope `pnpm-lock.yaml`; it was removed before final `pr-shape`.
- `package.json` and `package-lock.json` were not modified.

## Remaining Deltas

- This branch is source-parity/evidence refresh only; it does not claim owner visual acceptance.
- Team DB/API/authz runtime, production permission mutation, invite email sending, Telegram binding persistence and audit writes remain intentionally not implemented.
- Real team data and production permission enforcement remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.
