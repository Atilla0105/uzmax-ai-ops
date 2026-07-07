# M7-UI-51 Connection Center Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `group.connections` / `连接中心` candidate with synthetic mock/degraded browser-local data. It does not claim owner visual acceptance, connector runtime closure, production connector change, real connection test, external API/Telegram/order API call, audit write, feature flag write, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-51-connection-center-page.md`
- Route: `group.connections`
- Source target: `apps/admin/src/pages/group/GroupConnectionPage.tsx`, `apps/admin/src/pages/group/GroupConnectionViews.tsx`, `apps/admin/src/pages/group/groupConnectionFallback.ts`
- Test target: `apps/admin/tests/m7-ui-connection-center.spec.ts`
- Base: `origin/codex/m7-ui-31-orders-visible-ui` at `c08f887ba87069e01705a3b788d317196302c29e`

## Worker Preflight

| Check | Result |
|---|---|
| `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-51-connection-center-page-cleanstack` |
| `git status --short --branch` | `## codex/m7-ui-51-connection-center-page-cleanstack...origin/codex/m7-ui-31-orders-visible-ui` plus partial worker edits |
| `git branch --show-current` | `codex/m7-ui-51-connection-center-page-cleanstack` |

## Source Review

- Read `AGENTS.md`.
- Read Impeccable project skill, ran context for `apps/admin/src/pages/group/GroupConnectionPage.tsx`, and read the product register.
- Read `docs/admin-design-system.md`.
- Searched v1.1 PRD, technical architecture, admin design/frontend architecture and acceptance matrix for connection center, group layer, Telegram Business, order API and import fallback clauses.
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` `CONN_DEFS` / `CONN_HEALTH`
  - `/Users/atilla/Downloads/运营塔台1.0.html` is sampled by Playwright when available; unavailable evidence is written when CI lacks the file.
- Inspected nearby current implementation/test:
  - `apps/admin/src/pages/group/GroupTemplatePage.tsx`
  - `apps/admin/src/pages/group/GroupTemplateViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
  - `apps/admin/tests/m7-ui-template-center.spec.ts`
  - `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`

## Three-Way Comparison

| Surface | Owner / unpacked source | React candidate | Result |
|---|---|---|---|
| Header | `连接中心` plus group connector subtitle | Same title/subtitle plus explicit mock/degraded/read-only badge | Aligned; added boundary badge to prevent production interpretation |
| Cards | Four connector cards: Telegram Bot, Telegram Business, 订单 API, 导入兜底 | Same four-card list with centralized `SYN-CONN-*` synthetic rows | Aligned with mock/read-only labeling |
| Status and source labels | Health badge, ADR/spike verdict, tenant coverage and recent error | Same labels and order, with ADR-B01/B02 visible for Business/API cards | Aligned |
| Controls | Enable/disable switch plus test connection action | Same controls, but browser-local only toast and no runtime call | Aligned with runtime safety boundary |
| Runtime states | Prototype shows default page | React adds deterministic loading/empty/error/permission/degraded states | Required M7 state coverage |

## Runtime Disclaimer

- All connector/card data is synthetic and centralized in `groupConnectionFallback.ts`.
- Connector refs use `SYN-CONN-*`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic health`, `no production connector change`, `no real connection test`, `no external API/Telegram/order API call`, `no audit write`, `no feature flag write`.
- Toggle and test actions mutate browser-local state only and close with a toast repeating the no-production/no-external/no-audit/no-feature-flag boundary.
- No DB/API/runtime connector/audit/feature flag/Telegram/order API write or call is wired.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/`

Focused Playwright outputs:

- Source availability: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/source-availability.json`
- Source sampling or unavailable note: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/source-sampling.json` or `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/source-unavailable.md`
- Desktop metrics: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-desktop-metrics.json`
- Desktop screenshot: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-desktop.png`
- Collapsed metrics: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-collapsed-metrics.json`
- Collapsed screenshot: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-collapsed.png`
- Mobile 320 metrics: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-mobile-320-metrics.json`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-mobile-320.png`

Metrics summary:

| Metric | Value |
|---|---:|
| desktop `activePageId` | `group.connections` |
| desktop `shellLevel` | `group` |
| desktop `sidebarExpandedWidth` | `232` |
| desktop `topbarHeight` | `53` |
| desktop `cardCount` | `4` |
| desktop `cardWidths` | `820, 820, 820, 820` |
| desktop `headerWidth` | `1048` |
| collapsed `navWidth` | `68` |
| collapsed `pageWidth` | `1212` |
| mobile `bodyScrollWidth` | `320` |
| mobile `documentScrollWidth` | `320` |
| mobile `headerWidth` | `320` |
| mobile `noteWidth` | `320` |
| mobile `cardWidth` | `296` |

## Validation

Local validation on this branch:

- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm format:check`: failed on existing baseline formatting only. The final failure list contains 16 pre-existing files and none of this PR's touched files.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm guard:pr-shape --base origin/codex/m7-ui-31-orders-visible-ui --head HEAD`: passed after PR creation; `changedFiles=10`, categories `source=5`, `test=1`, `docs=4`, source `changedFiles=5`, source `netLoc=409`, source `newFiles=3`.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm --filter @uzmax/admin exec playwright test apps/admin/tests/m7-ui-connection-center.spec.ts`: failed before tests because pnpm enters `apps/admin` and reports `Command "playwright" not found`; the admin package has no local binary under current pnpm workspace behavior.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm --filter @uzmax/admin typecheck`: failed before TypeScript because `@uzmax/admin` has no `typecheck` script.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm --filter @uzmax/admin lint`: failed before ESLint because `@uzmax/admin` has no `lint` script.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm exec playwright test apps/admin/tests/m7-ui-connection-center.spec.ts`: passed, 5 tests.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm ci --ignore-scripts`: passed to install workspace dependencies from the existing `package-lock.json`.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm --workspace @uzmax/db run prisma:generate`: passed.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm typecheck`: passed after npm workspace dependency install and Prisma generate.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH pnpm lint`: passed.

Validation notes:

- `pnpm` generates an untracked `pnpm-lock.yaml` in this worktree; it is a local command side effect, outside this spec, and is removed before staging/commit.
- Vite emitted the existing large-chunk warning during Playwright and exited 0.

## Remaining Deltas

- Runtime connector DB/API/audit/feature flag/Telegram/order API paths remain intentionally not implemented.
- Owner visual acceptance is still required after PR review/browser comparison.
