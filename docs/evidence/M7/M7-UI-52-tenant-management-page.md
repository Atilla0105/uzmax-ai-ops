# M7-UI-52 Tenant Management Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `group.tenants` / `租户管理` candidate with synthetic mock/degraded browser-local data. It does not claim owner visual acceptance, tenant runtime closure, production tenant change, tenant config persistence, connector or feature flag mutation, audit write, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-52-tenant-management-page.md`
- Route: `group.tenants`
- Source target: `apps/admin/src/pages/group/GroupTenantPage.tsx`, `apps/admin/src/pages/group/GroupTenantViews.tsx`, `apps/admin/src/pages/group/groupTenantFallback.ts`
- Test target: `apps/admin/tests/m7-ui-tenant-management.spec.ts`
- Base: `origin/codex/m7-ui-31-orders-visible-ui` at `d7c06b3ed1ef753b4f79ecac1b381f0638f07be9`

## Worker Preflight

| Check | Result |
|---|---|
| `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-52-tenant-management-page-cleanstack` |
| `git status --short --branch` | `## codex/m7-ui-52-tenant-management-page-cleanstack...origin/codex/m7-ui-31-orders-visible-ui` |
| `git branch --show-current` | `codex/m7-ui-52-tenant-management-page-cleanstack` |

Root/main checkout had unrelated untracked files under `apps/admin/src/pages/knowledge/`, `apps/admin/src/pages/team/`, one tenant-entry test, and M7-UI-62/32 docs/spec files. This worker did not modify or clean them.

## Source Review

- Read `AGENTS.md`.
- Read Impeccable project skill, ran context for `apps/admin/src/pages/group/GroupTenantPage.tsx`, and read the product register.
- Read `docs/admin-design-system.md`.
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` `GROUP_TENANTS` / `TENANT_STATUS_COLORS`
  - `/Users/atilla/Downloads/运营塔台1.0.html` is sampled by Playwright when available; unavailable evidence is written when CI lacks the file.
- Inspected nearby current implementation/test:
  - `apps/admin/src/pages/group/GroupTemplatePage.tsx`
  - `apps/admin/src/pages/group/GroupTemplateViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
  - `apps/admin/src/pages/group/GroupConnectionPage.tsx`
  - `apps/admin/src/pages/group/GroupConnectionViews.tsx`
  - `apps/admin/src/pages/group/groupConnectionFallback.ts`
  - `apps/admin/tests/m7-ui-template-center.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center.spec.ts`

## Three-Way Comparison

| Surface | Owner / unpacked source | React candidate | Result |
|---|---|---|---|
| Header | `租户管理`, tenant count and create/disable audit copy | Same title with explicit group mock/degraded/read-only badge and no-audit subtitle | Aligned; added boundary badge to prevent production interpretation |
| Cards | Four tenant cards from `GROUP_TENANTS` with status dot/badge, line/template, members, AI and connection | Same four-card grid with `SYN-TENANT-*` synthetic rows and mock labels | Aligned with mock/read-only labeling |
| Drawer | Right management drawer with language, timezone, channel capability toggles and disabled state | Same drawer anatomy with accessible dialog semantics, focus trap, Escape close and local state updates | Aligned with accessibility hardening |
| Destructive action | Disable/restore tenant with reason and audit implication | Reason-required `ConfirmModal`; restore and disable update browser-local state only | Aligned with runtime safety boundary |
| Runtime states | Prototype shows default page | React adds deterministic loading/empty/error/permission/degraded states | Required M7 state coverage |

## Runtime Disclaimer

- All tenant/card data is synthetic and centralized in `groupTenantFallback.ts`.
- Tenant refs use `SYN-TENANT-*`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant metrics`, `no production tenant change`, `no tenant config persistence`, `no connector or feature flag change`, `no audit write`.
- Language/timezone/capability/disable/restore actions mutate browser-local state only and close with a toast repeating the no-production/no-persistence/no-connector-feature-flag/no-audit boundary.
- No DB/API/authz/runtime tenant path, production tenant config, connector/feature flag or audit write is wired.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/`

Focused Playwright outputs:

- Source availability: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/source-availability.json`
- Source sampling or unavailable note: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/source-sampling.json` or `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/source-unavailable.md`
- Desktop metrics: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-desktop-metrics.json`
- Desktop screenshot: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-desktop.png`
- Drawer screenshot: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-drawer.png`
- Collapsed metrics: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-collapsed-metrics.json`
- Mobile 320 metrics: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-mobile-320-metrics.json`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/react-tenant-management-mobile-320.png`

Metrics summary:

| Metric | Value |
|---|---:|
| desktop `activePageId` | `group.tenants` |
| desktop `shellLevel` | `group` |
| desktop `sidebarExpandedWidth` | `232` |
| desktop `topbarHeight` | `53` |
| desktop `cardCount` | `4` |
| desktop `cardWidths` | `324, 324, 324, 324` |
| desktop `headerWidth` | `1048` |
| collapsed `navWidth` | `68` |
| collapsed `pageWidth` | `1212` |
| mobile `bodyScrollWidth` | `320` |
| mobile `documentScrollWidth` | `320` |
| mobile `drawerWidth` | `320` |
| mobile `pageWidth` | `320` |

## Validation

Local validation on this branch:

- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run jscpd`: first run failed before code edits because the clean worktree had no local `node_modules/jscpd/run-jscpd.js`.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm ci --ignore-scripts`: passed.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run format:check`: passed.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run jscpd`: passed, no duplicates found.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm guard:pr-shape --base origin/codex/m7-ui-31-orders-visible-ui --head HEAD`: passed after PR creation; `changedFiles=10`, categories `source=5`, `test=1`, `docs=4`, source `changedFiles=5`, source `netLoc=574`, source `newFiles=3`.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm exec playwright test apps/admin/tests/m7-ui-tenant-management.spec.ts`: passed, 5 tests.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm --workspace @uzmax/db run prisma:generate && PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm typecheck`: passed.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm lint`: passed.

Validation notes:

- `pnpm` generated an untracked `pnpm-lock.yaml`; it was removed and is not part of this PR.
- `pnpm` emitted the repo-baseline warning that the root `workspaces` field is not supported by pnpm without `pnpm-workspace.yaml`.
- Vite emitted the existing large-chunk warning during Playwright and exited 0.
- Source line budget after compression: `GroupTenantPage.tsx` 208 lines, `GroupTenantViews.tsx` 241 lines, `groupTenantFallback.ts` 120 lines.

## Remaining Deltas

- Runtime tenant DB/API/authz/audit/config/connector/feature-flag paths remain intentionally not implemented.
- Owner visual acceptance is still required after PR review/browser comparison.
