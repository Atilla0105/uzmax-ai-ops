# M7-UI-92 Tenant Management Default Visual Parity Refresh

## Goal

Refresh the default `group.tenants` / `租户管理` fallback on top of `codex/m7-ui-91-logs-default-visual-parity-refresh` so the default visible body, header badge, source note, create/manage feedback and forced URL states read like a real group-level operations page instead of a fixture/runtime explanation surface.

This is default visual parity only. It preserves the M7-UI-73 owner-rendered table/new-tenant source-parity decision and does not implement tenant DB/API/runtime/authz, production tenant creation, tenant config persistence, connector or feature flag changes, audit writes, owner visual acceptance, GA/1.0, production deployment, real customer/order data or release approval.

Default visible `group.tenants` body, header, source note, toast, modal feedback, forced URL states and mobile body must not contain `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change`, `no audit write`, `Synthetic` or `created in browser preview`. Runtime/write/config/connector/audit boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title`, `aria-description` and focused Playwright metrics.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not tenant runtime or release closure.
- Confirm `group.tenants` remains GROUP layer only: `/design` opens group shell, active page `group.tenants`, no `data-tenant-id`, group categories only, and tenant nav does not mix into group nav.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide any future tenant DB/API/runtime/authz/audit/config/connector/feature-flag work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-92-tenant-management-default-visual-parity-refresh` on branch `codex/m7-ui-92-tenant-management-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, Impeccable context/product register, M7-UI-73 tenant-management source-parity spec/evidence, M7-UI-90/91 default-refresh pattern, current tenant-management source/tests/evidence, owner HTML and unpacked tenant-management source before edits.
- Modify only the allowed tenant-management page/test/doc paths.
- Preserve group shell, active page `group.tenants`, no `data-tenant-id`, group-only nav, owner HTML blank table plus inert `管理` action shape, new tenant modal, focus trap, create count bump, manage no-op, loading/empty/error/permission/degraded URL states, collapsed sidebar and mobile 320 fallback.

## Timebox

0.5 workday. If API client, backend/API, DB, package/lock, shared patterns/shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, real tenant runtime, production tenant change, config persistence, connector or feature flag mutation or audit write changes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/group/GroupTenantPage.tsx`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
  - `apps/admin/tests/m7-ui-tenant-management.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-92-tenant-management-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-92-tenant-management-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source changed files: <= 3
- source net LOC: <= 180
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/PageOutlet/registry/API: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

```yaml
source:
  - apps/admin/src/pages/group/GroupTenantPage.tsx
  - apps/admin/src/pages/group/GroupTenantViews.tsx
  - apps/admin/src/pages/group/groupTenantFallback.ts
test:
  - apps/admin/tests/m7-ui-tenant-management.spec.ts
  - apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts
  - apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-92-tenant-management-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-92-tenant-management-default-visual-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads before edits:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- Impeccable project context, product register and clarify guidance
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-52-tenant-management-page.md`
- `docs/specs/M7-UI-73-tenant-management-source-parity-refresh.md`
- `docs/specs/M7-UI-90-analytics-default-visual-parity-refresh.md`
- `docs/specs/M7-UI-91-logs-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-52-tenant-management-page.md`
- `docs/evidence/M7/M7-UI-73-tenant-management-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-91-logs-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/group/GroupTenantPage.tsx`
- `apps/admin/src/pages/group/GroupTenantViews.tsx`
- `apps/admin/src/pages/group/groupTenantFallback.ts`
- `apps/admin/tests/m7-ui-tenant-management.spec.ts`
- `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-logs-default-visual-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- v1.1 tenant-management boundaries: PRD REQ-G02, technical architecture multi-tenant/authz/RLS boundaries, admin group IA, mobile fallback and acceptance/release gate rules.

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Primary visual baseline for the `租户管理` surface and shell context. Preserve the rendered table/new-tenant state from M7-UI-73. |
| Unpacked group tenant page | Conflicting/stale secondary source for this page; do not reintroduce card grid/right drawer as visible default. |
| Unpacked `fixtures/groupPlatform.ts` | Field-shape reference for tenant count/source accounting only; do not expose production-looking tenant rows by default. |
| Unpacked `navigation.ts` | Group-only category and `g_tenant` shell mapping reference. |
| M7-UI-73 tenant source refresh | Preserve source-parity geometry and table/new-modal behavior while cleaning default visible copy. |
| M7-UI-90/91 default refreshes | Test/evidence pattern for clean visible default body with hidden/data/title/ARIA runtime boundaries. |
| Existing React tenant page | Preserve page-local fallback, focused test ids and local interactions; move engineering/runtime caveats out of default visible body and feedback into hidden/data/title/ARIA evidence. |

`rg` conclusions:

- `rg -n "degraded|mock|read-only|browser-local only|synthetic tenant metrics|no production tenant change|no tenant config persistence|no connector or feature flag change|no audit write|Synthetic|created in browser preview" apps/admin/src/pages/group apps/admin/tests/m7-ui-tenant-management*.spec.ts` found visible leaks in header badge, runtime note, source note, create/manage toasts, forced state copy and stale focused tests.
- `rg --files docs/specs docs/evidence/M7 apps/admin/src/pages/group apps/admin/tests | rg "M7-UI-(73|90|91)|tenant-management|GroupTenant|admin-design-system|migration-ledger|README"` found the existing page-local tenant implementation, M7-UI-73 source-parity inputs and M7-UI-90/91 default-refresh patterns; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "租户管理|新建租户|停用租户|tenantCols|tenantNewOpen|tenantManageOpen|tenantDisableOpen" /Users/atilla/Downloads/运营塔台1.0.html "/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx" "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts" "/Users/atilla/源码/unpacked 6/shell/navigation.ts"` confirmed the owner/source mapping to preserve.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-92-tenant-management-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-92-tenant-management-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-92-tenant-management-default-visual-parity-refresh` |
| base | `codex/m7-ui-91-logs-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `group.tenants` visible body, header badge, source note, create/manage feedback and URL states use business-readable Chinese operations copy.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change` and `no audit write`.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; source note, manage action, toast and forced state surfaces expose boundary metadata.
- New tenant modal remains page-local fallback, preserves focus trap and increments only the visible preview count.
- Manage action remains a no-op with operational feedback and does not imply real tenant navigation or a management drawer.
- The default group/tenant boundary remains unchanged: `/design` opens group layer, `租户管理` maps to `group.tenants`, and tenant nav does not appear in group nav.

## Design Skill Layer

Adopted Impeccable/product-register and clarify guidance: restrained product UI, dense operational tenant-management copy, owner/source-like table/new-tenant workflow vocabulary, hidden-but-present runtime boundaries, familiar status/action controls, specific empty/error/permission/loading copy and mobile no-overflow fallback.

Rejected: visible engineering labels in default body/feedback/accessibility labels, old shell visual vocabulary, old `--uzmax-*` as visual source, broad redesign, production-looking tenant rows, real tenant creation/config/connector/feature-flag/audit claims and owner-acceptance/runtime/release claims.

## Pass Conditions

- Default `group.tenants` visible body contains no forbidden engineering terms.
- Source note, create/manage feedback and forced URL states contain no forbidden engineering terms in visible body.
- Hidden DOM/data/title/ARIA evidence still contains runtime/write/config/connector/audit boundary labels.
- Existing tenant-management functionality and source-parity tests pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default body, new tenant modal/create feedback, manage no-op feedback, forced states, group/tenant nav separation, collapsed nav and mobile 320 body plus hidden boundary metrics.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint if practical, admin build and focused Playwright pass or failures are recorded honestly.

## Non-Goals

- No API client, backend/API, DB, package/lock, shared patterns/shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No real tenant persistence, production tenant creation/disable/restore, tenant config persistence, connector mutation, feature flag mutation, audit write, production authz integration, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No broad redesign, raw production fixture import or real customer/order/Telegram/address/phone/production data.
