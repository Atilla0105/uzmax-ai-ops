# M7-UI-06 Shared Shell Topbar Calibration Evidence

## Status

Implementation evidence for `M7-UI-06-shared-shell-topbar-calibration`.

This branch calibrates only the shared `AppShell` topbar visible structure/copy to the owner prototype and `/Users/atilla/源码/unpacked 6` shell sources. It does not migrate any page, alter conversations page files, alter release acceptance page files, approve GA-0, approve production, approve owner acceptance or approve 1.0 release.

The visible `PRODUCTION` marker is prototype visual parity for the admin design shell only. It is not production deployment state, production approval, GA-0 approval, owner signoff or release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-06-shared-shell-topbar-calibration` |
| worker branch | `codex/m7-ui-06-shared-shell-topbar-calibration` |
| worker pre-edit `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-06-shared-shell-topbar-calibration` |
| worker pre-edit status | `## codex/m7-ui-06-shared-shell-topbar-calibration` |
| worker pre-edit branch | `codex/m7-ui-06-shared-shell-topbar-calibration` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main baseline | `main` and `origin/main` at `6e66143e4ea5c9323ec8b25470c8892fdece08a3` |
| open PR check | `gh pr list --state open --limit 50` could not run because `gh` is not installed in the shell. |
| no-merged branch check | root/main showed `codex/m7-ui-11-release-acceptance-page-impl` and `codex/m7-ui-20-conversation-workbench-page-impl`, matching the coordinator boundary. |

## Required Reads / Source Mapping

Required reads completed before implementation edits:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `apps/admin/src/App.tsx`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/tests/design.spec.ts`
- `apps/admin/tests/m7-ui-foundation.spec.ts`
- `apps/admin/tests/m7-ui-page-router.spec.ts`
- `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/源码/unpacked 6/shell/TenantSwitcher.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/tenants.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html` as read-only visual reference.
- Impeccable context for `apps/admin/src/shell/AppShell.tsx` and `.agents/skills/impeccable/reference/product.md`.

Source mapping:

| Source | Finding / implementation use |
|---|---|
| Owner `shell/TopBar.tsx` | Adopted 52px white topbar, 0/16px horizontal rhythm, `集团 / tenant capsule`, centered 34px search, `PRODUCTION`, `68ms`, notification badge and operator identity. |
| Owner `shell/TenantSwitcher.tsx` | Adopted tenant capsule/dropdown vocabulary: status dot, compact tenant name, line metadata and native selection affordance. |
| Owner `fixtures/tenants.ts` | Replaced visible synthetic tenants with `玉珠跨境美妆`, `丝路数码`, `天净家居`, `白桦母婴`; kept stable repo test ids `tenant-a` through `tenant-d`. |
| M7-UI-05 evidence/ledger | Preserved group-only and tenant-only navigation behavior; tenant selection still enters `tenant.conversations`; back-to-group still returns to `group.overview`. |
| `docs/admin-design-system.md` | Applied prototype topbar dimensions, environment marker visual semantics, mobile 320px no-overflow boundary and no-overclaim wording. |
| Current `AppShell.tsx` | Replaced visible `Tenant` label/select copy, `Search shell`, default `STAGING`, disabled notification/user icons and raw tenant status string. |
| Current focused tests | Updated assertions to preserve anchors while checking owner-style visible copy and M7-UI-05 navigation separation. |
| Current `apps/admin/tests/design.spec.ts` | Post-CI compatibility update after GitHub Actions job `85065283224` showed old legacy evidence assertions still expected disabled topbar buttons and `Tenant B` / `Connector degraded` copy. |

## Implementation Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-06-shared-shell-topbar-calibration.md` | Adds the narrow spec, allowed write set, budgets, reads, source mapping, validation and explicit `PRODUCTION` visual-only boundary. |
| `apps/admin/src/App.tsx` | Replaces synthetic visible tenant fixture copy with prototype-derived tenant names, lines and Chinese health labels while keeping stable internal ids. |
| `apps/admin/src/shell/AppShell.tsx` | Calibrates topbar anatomy to owner source: tenant capsule over native select, Chinese search placeholder, production marker, heartbeat, notification badge and operator identity. |
| `apps/admin/src/shell/AppShell.css` | Tunes shared topbar density, tenant capsule, centered search, environment badge and right-side operator tools without touching page-local styles. |
| `apps/admin/tests/m7-ui-foundation.spec.ts` | Updates shell anchor/topbar assertions for Chinese search, `PRODUCTION`, operator identity, prototype tenant copy and 320px fallback. |
| `apps/admin/tests/m7-ui-page-router.spec.ts` | Updates tenant breadcrumb assertion to prototype tenant copy while preserving group/tenant nav separation coverage. |
| `apps/admin/tests/design.spec.ts` | Updates legacy full-suite assertions to M7-UI-06 shell facts: enabled notification/user controls, visible operator identity and `tenant-b` copy as `丝路数码` / `降级`. |
| `docs/evidence/M7/README.md` | Records UI-06 as a shared shell/topbar calibration branch. |
| `docs/admin-ui-page-migration-ledger.md` | Adds UI-06 as a shared shell calibration row; no page migration is marked complete. |

## Design Decisions

Accepted:

- Use owner `TopBar.tsx` as the structure guide for the shared shell topbar.
- Keep the native `select` with `data-testid="tenant-switcher"` for keyboard/test stability, but place it over a prototype-style visible tenant capsule.
- Default the design/admin shell environment marker to `PRODUCTION` for visual parity.
- Hide `active-layer-badge` visually while preserving the `data-testid` anchor and text for tests/future pages; the visible owner topbar uses breadcrumb/capsule rather than a separate layer badge.

Rejected:

- Visible `Search shell` value.
- Visible raw `Tenant` label plus `Tenant B - Connector degraded` style select copy in the topbar default.
- Treating `STAGING` as the default visual marker for this owner-shell parity slice.
- Importing raw prototype HTML/runtime or changing tokens/primitives/page-local files.
- Any language claiming production deployment, GA-0, owner acceptance or 1.0 release approval.

## Screenshots

Screenshot artifacts are generated under `/tmp/uzmax-m7-ui-06-shared-shell-topbar-calibration/` and are not committed.

| Artifact | Path | Status |
|---|---|---|
| Group `/design` desktop | `/tmp/uzmax-m7-ui-06-shared-shell-topbar-calibration/group-design-desktop.png` | captured, 1440x900 PNG |
| Tenant selected desktop | `/tmp/uzmax-m7-ui-06-shared-shell-topbar-calibration/tenant-conversations-desktop.png` | captured, 1440x900 PNG after selecting `tenant-b` / `丝路数码` |
| Group `/design` mobile fallback | `/tmp/uzmax-m7-ui-06-shared-shell-topbar-calibration/group-design-mobile-320.png` | captured, 320x900 PNG |

## Impeccable / Design Audit

| Command | Result | Notes |
|---|---|---|
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/context.mjs --target apps/admin/src/shell/AppShell.tsx` | pass | Product/admin context loaded; prototype source hierarchy confirmed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/shell/AppShell.tsx apps/admin/src/shell/AppShell.css` | pass | Final result `[]`. |

## Validation

The bundled runtime has `node` and `pnpm`, but no `npm`, `npx` or `gh`. For npm/npx validation and Playwright config compatibility, commands were executed with temporary `/tmp/uzmax-m7-ui-06-shared-shell-topbar-calibration/bin/npm` and `npx` shims that delegate to the bundled `pnpm`; no repo config or package file was changed.

CI corrective follow-up: GitHub Actions job `85065283224` failed only in full Playwright because `apps/admin/tests/design.spec.ts` still asserted pre-M7-UI-06 shell facts: disabled notification/user buttons, `Tenant B`, and `Connector degraded`. This follow-up updates those assertions to the intentional owner-style topbar behavior and records the corrective full Playwright pass.

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run format:check` | fail, pre-existing unrelated formatting debt | After formatting this slice's touched files, global check still reports 11 untouched files: `apps/admin/src/M4CustomerAssetRuntimeState.tsx`, `apps/admin/src/orderImportApiClient.ts`, `apps/admin/src/pages/registry.ts`, `apps/api/src/ai-member-runtime.contracts.ts`, `apps/api/src/confirmation-queue.types.ts`, `apps/api/src/conversation-ticket.types.ts`, `apps/api/src/order-import.repository.ts`, `apps/api/src/order-import.types.ts`, `packages/capabilities/kb/src/index.ts`, `packages/capabilities/order-read/src/index.ts`, `packages/channels/src/index.ts`. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-06-shared-shell-topbar-calibration.md --include-worktree` | pass | 10 changed files: source 3, test 3, docs 4; source net LOC 167; new source files 0. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run lint` | pass | ESLint passed after keeping `App.tsx` and `AppShell.tsx` under React file line limits. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run typecheck -- --pretty false` | fail, environment dependency gap | `tsc` runs but local pnpm install lacks workspace/backend dependencies such as `@nestjs/common`, `@nestjs/core`, `@supabase/supabase-js`, `bullmq`, `@prisma/client` and `reflect-metadata`. No shell-specific TypeScript error was reported before those missing-module blockers. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npm run build:admin` | pass | Vite admin build succeeded; output JS gzip about 99.78 kB. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH npx playwright test apps/admin/tests/m7-ui-foundation.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts` | pass | 5 focused tests passed. |
| `PATH=/tmp/uzmax-m7-ui-06-shared-shell-topbar-calibration/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm exec playwright test` | pass | Full admin Playwright suite passed: 39 tests. |
| screenshot capture | pass | Three screenshots captured under `/tmp/uzmax-m7-ui-06-shared-shell-topbar-calibration/`. |
| touched-file Prettier check | pass | `prettier --check` passed for the touched test/spec/evidence files in this follow-up. |
| forbidden path check | pass | Final changed files are limited to the spec touch list; no package/lock/generated/backend/API/DB/worker/cron/CI/guard/global config drift. |

## Boundary

This evidence does not approve M7 closeout, owner acceptance, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply, PR #178, PR #182 merge, page-local visual acceptance, production/release state or 1.0 release.
