# M7-UI-03 Page Migration Ledger And Router

## Goal

Create the first start-gate slice for M7 page migration: a permanent page migration ledger, an admin-internal page registry, and a controlled AppShell page outlet so navigation switches a real route target instead of private shell-only `activeNav` state.

This slice does not migrate any page content. All 19 planned pages remain `not_started` and render a clear scaffold state. Existing M2-M6 legacy evidence content remains visible under the explicit `legacy.evidence` route.

## Owner Confirmation Points

- Owner assigned this worker as `M7-UI-03-page-migration-ledger-and-router`.
- Work must happen only in `/Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router` on branch `codex/m7-ui-03-page-migration-ledger-router`.
- `/Users/atilla/Applications/UZMAX智能运营` root/main is forbidden for edits.
- This slice may create router/ledger/page-outlet scaffolding only; no migrated page runtime, fixture copy, API hook implementation or page body porting is approved.
- Existing M2-M6 admin evidence must remain reachable and testable.

## AI Agent Responsibilities

- Create this spec before source edits.
- Read AGENTS, PRODUCT/DESIGN, Impeccable product guidance, M7-05, M7-UI-00/00A/00B/01/02, current admin source, prototype migration docs and the read-only `/Users/atilla/源码/unpacked 6` source list.
- Run `rg` before adding source files and record why existing files cannot simply hold all route/ledger contracts.
- Keep the page registry internal to `apps/admin`; it is not a backend API or public DTO.
- Preserve M7 foundation shell anchors and dimensions: `admin-shell`, `app-shell-nav`, `tenant-switcher`, `environment-marker`, `system-heartbeat`, `group-layer`, `tenant-layer`, `release-readiness`, `232px` expanded nav, `68px` collapsed nav and the 320px fallback.
- Record validation results honestly, including unavailable browser/tooling.
- Record the root/main write-boundary incident and the coordinator cleanup result.

## Timebox

0.25 workday. If this requires page migration, backend/API/DB/worker/cron edits, package or lockfile edits, raw prototype file edits, dependency changes, old M2-M6 shell rewrites, CI/guard script changes, production/release action or owner release decision, stop and report to coordinator.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-03-page-migration-ledger-and-router.md`
  - `docs/evidence/M7/M7-UI-03-page-migration-ledger-and-router.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `docs/incidents/INC-2026-07-03-m7-ui-03-root-write-boundary.md`
  - `apps/admin/src/App.tsx`
  - `apps/admin/src/shell/AppShell.tsx`
  - `apps/admin/src/pages/**`
  - `apps/admin/tests/m7-ui-page-router.spec.ts`
- 未列出的模块默认不可改。

## Change Budget / Path Classification

- Source changed files: <= 4
- Source net LOC: <= 600
- New source files: <= 2
- Test files changed: 1 focused new Playwright spec
- Docs files changed: <= 5
- Package/lock/generated/config/backend/API/DB/worker/cron/CI changes: 0
- External API/provider/connector/adapter basis: none
- Exceptions: none expected

## Preconditions

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router`
- `git status --short --branch`: `## codex/m7-ui-03-page-migration-ledger-router`
- `git branch --show-current`: `codex/m7-ui-03-page-migration-ledger-router`
- `git branch --no-merged main`: no output at entry.
- Forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`.
- Foundation and icon shell calibration are present on `main` as the base for this slice.

## Implementation Steps

1. Record entry evidence and required reads.
2. Add the permanent page migration ledger with all 19 planned IA pages and a foundation/router state row.
3. Add an internal `apps/admin/src/pages/**` registry with stable page IDs, layer, labels, nav-id mapping, prototype source refs, target repo paths, target spec IDs and migration status.
4. Make `AppShell` accept controlled `activePageId` and `onPageChange` props; nav items call `onPageChange` with registry-compatible page IDs.
5. Update `App.tsx` to own `activePageId` and render a page outlet from the registry.
6. Route planned pages to a not-started scaffold using existing primitives/patterns. Route `legacy.evidence` to the existing M2-M6 legacy evidence content.
7. Add focused Playwright coverage for nav route switching, planned-page scaffold rendering, legacy evidence reachability and existing shell anchors.
8. Add the required incident record for the earlier root/main write-boundary failure.
9. Run and record validation commands.

## Pass Conditions

- `docs/admin-ui-page-migration-ledger.md` lists all 19 pages, source paths, target page IDs/routes, target repo paths, current runtime/API/hook state, required states and evidence status.
- All planned page rows are `not_started`; only the foundation/router row reflects this slice's scaffold state.
- Page registry is typed TypeScript, admin-internal, and has no backend/public API surface.
- AppShell nav no longer owns active page state privately; `App` controls active page state and page outlet rendering.
- Initial route preserves existing legacy evidence visibility.
- Planned route selection renders a clear not-started page state that points to the ledger/spec.
- Existing shell anchors remain present.
- No page content from `/Users/atilla/源码/unpacked 6/pages/**` is ported.
- No raw prototype fixtures, customer/order/contact samples, package/lockfile changes, backend/API/DB/worker/cron/CI changes or old M2-M6 shell/CSS rewrites.
- The incident record exists and points to M7-UI-03 evidence, with cleanup and permanent control documented.
- `git diff --check`, `guard:pr-shape`, TypeScript, Vite build and focused Playwright are run or exact failures are recorded.

## Failure Branch

- If the assigned worktree/branch has unexpected state, stop and report `BLOCKED`.
- If route scaffolding requires modifying files outside the touch list, stop and ask coordinator to split or expand the spec.
- If Playwright/browser tooling is unavailable, record the exact command and error while keeping TypeScript/build evidence.
- If edits land outside the assigned worktree or in root/main, stop and report for incident handling.

## Out Of Scope

- No migrated page content.
- No real API/hook wiring for planned pages.
- No fixture import, fixture sanitization implementation, screenshot artifact or raw prototype copy.
- No changes to `apps/admin/src/primitives/**`, `apps/admin/src/patterns/**`, `packages/ui-tokens/**`, package files, lockfiles, backend/API/DB/worker/cron, CI/guard scripts, raw prototype files or old M2-M6 shell/CSS files.
- No further root/main writes; implementation edits must use the assigned worktree path explicitly.
- No push, merge, PR, GA-0, production, real customer traffic, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Validation List

- `git diff --check`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-UI-03-page-migration-ledger-and-router.md --include-worktree`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `npx playwright test apps/admin/tests/m7-ui-page-router.spec.ts`
