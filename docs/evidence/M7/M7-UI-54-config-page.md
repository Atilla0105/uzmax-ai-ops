# M7-UI-54 Tenant Config Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a slim visible UI-first `tenant.config` / `配置` candidate with centralized mock/degraded browser-local data. It does not claim owner visual acceptance, runtime config closure, production config write, connector switch execution, audit write, DB/API/authz/RLS readiness, GA-0, or 1.0 release approval.

## Scope

| Item | Value |
|---|---|
| Spec | `docs/specs/M7-UI-54-config-page.md` |
| Route | `tenant.config` |
| Worker path | `/Users/atilla/.codex/worktrees/m7-ui-54-config-page-cleanstack` |
| Worker branch | `codex/m7-ui-54-config-page-cleanstack` |
| Base | `origin/codex/m7-ui-31-orders-visible-ui` at `ddd475fbd322` |
| Source target | `apps/admin/src/pages/config/ConfigPage.tsx`; `apps/admin/src/pages/config/configFallback.ts`; `apps/admin/src/pages/config/configMarkup.ts` |
| Test target | `apps/admin/tests/m7-ui-config-page.spec.ts` |

## Worker Preflight

| Check | Result |
|---|---|
| `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-54-config-page-cleanstack` |
| `git status --short --branch` | `## codex/m7-ui-54-config-page-cleanstack...origin/codex/m7-ui-31-orders-visible-ui` |
| `git branch --show-current` | `codex/m7-ui-54-config-page-cleanstack` |

## Source Review

- Read `AGENTS.md`.
- Read Impeccable project skill, ran context for `apps/admin/src/pages/config`, and read the product/craft/layout/typeset/adapt references needed for an admin UI slice.
- Read `docs/admin-design-system.md`.
- Inspected current route/wiring:
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/team/TeamPage.tsx`
  - `apps/admin/tests/m7-ui-team-page.spec.ts`
- Inspected owner/prototype sources when available locally:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/config.ts`
- Source sampling in Playwright is conditional. If the `/Users/atilla/...` owner paths are missing in CI, the test records an unavailable artifact and keeps React page assertions hard.

## React / Owner / Unpacked Mapping

| Source feature | Owner/unpacked source | React implementation |
|---|---|---|
| Tenant-only page | Config is a tenant management page, separate from group tenant management | `tenant.config` appears only after selecting a tenant; group nav does not show `配置` |
| Config groups | Owner source includes multiple config groups, version header and save/version pattern | Slim representative groups: `业务配置`, `SLA`, `渠道配置`, `订单 connector` |
| Version and rollback | Owner page exposes version history and rollback confirmation | Version history and reason-required rollback modal are browser-local only |
| Connector danger | Owner page includes order connector status and dangerous switching | Connector test and switch confirmation are local-only; no API call or switch execution |
| Runtime states | M7 requires loading/empty/error/permission/degraded coverage | Forced states via `?m7ConfigState=` cover `loading`, `empty`, `error`, `permission`, `degraded` |
| Mobile fallback | Current owner shell is dense desktop-first | React page keeps a readable 320px fallback with no document overflow |

## Data Boundary

- All data is centralized in `configFallback.ts`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `no production config write`, `no dangerous action execution`, `no connector switch`, `no audit write`, `no DB/API/authz/RLS`.
- Save, rollback, channel test/toggle, connector test and connector switch mutate browser-local React state only.
- No DB/API/runtime/authz/RLS/config persistence/audit write/connector switch execution is wired.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-54-config-page-cleanstack/`

Focused Playwright outputs:

- Owner/source screenshot: `/tmp/uzmax-m7-ui-54-config-page-cleanstack/owner-html-config-source-sample.png`
- Owner/source DOM sample or unavailable artifact: `/tmp/uzmax-m7-ui-54-config-page-cleanstack/owner-html-config-source-dom-sample.json`
- Source sampling or unavailable entries: `/tmp/uzmax-m7-ui-54-config-page-cleanstack/source-sampling.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-54-config-page-cleanstack/react-config-desktop.png`
- React desktop metrics: `/tmp/uzmax-m7-ui-54-config-page-cleanstack/react-config-desktop-metrics.json`
- React collapsed screenshot: `/tmp/uzmax-m7-ui-54-config-page-cleanstack/react-config-collapsed.png`
- React collapsed metrics: `/tmp/uzmax-m7-ui-54-config-page-cleanstack/react-config-collapsed-metrics.json`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-54-config-page-cleanstack/react-config-mobile-320.png`
- React mobile 320 metrics: `/tmp/uzmax-m7-ui-54-config-page-cleanstack/react-config-mobile-320-metrics.json`

Metrics summary:

| Metric | Desktop | Collapsed | Mobile 320 |
|---|---:|---:|---:|
| `activePageId` | `tenant.config` | `tenant.config` | `tenant.config` |
| `shellLevel` | `tenant` | `tenant` | `tenant` |
| `groupCount` | `4` | `4` | `4` |
| `navWidth` | `232` | `68` | `320` |
| `pageWidth` | `1048` | `1212` | `320` |
| `bodyScrollWidth` | `1280` | `1280` | `320` |
| `documentScrollWidth` | `1280` | `1280` | `320` |

Visual layout correction:

- Desktop inner wrapper correction: `ConfigPage` now assigns `uz-config-layout` to the `dangerouslySetInnerHTML` wrapper so `uz-config-side` and `uz-config-main` participate in the page flex layout.
- Mobile runtime note correction: the 320px media query uses grid flow for `.uz-config-note`, so the long boundary span can use full width instead of being squeezed into a tall narrow column.
- Desktop geometry: `sideTop=53`, `headTop=53`, `headBottom=120`, `noteTop=120`, `panelTop=245`.
- Mobile 320 geometry: `sideBottom=380`, `headTop=380`, `headBottom=573`, `noteTop=573`, `noteBottom=691`, `noteHeight=118`, `panelTop=703`, `bodyScrollWidth=320`, `documentScrollWidth=320`.

## Source Budget

| File | Lines |
|---|---:|
| `apps/admin/src/pages/config/ConfigPage.tsx` | `233` |
| `apps/admin/src/pages/config/configFallback.ts` | `132` |
| `apps/admin/src/pages/config/configMarkup.ts` | `147` |
| `apps/admin/src/pages/config/**` total | `512` |

## Validation

Local validation used Codex-bundled Node 24.14.0 / npm 11.9.0 with `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH`.

| Command | Result | Notes |
|---|---|---|
| `npm run format:check` | pass | All matched files use Prettier style. |
| `npm run guard:prettier-ignore` | pass | Baseline markers unchanged; no new `// prettier-ignore`. |
| `npm run typecheck` | pass | TypeScript no emit passed. |
| `npm run lint` | pass | ESLint passed. |
| `npm run jscpd` | pass | No duplicates found after reshaping the test helper. |
| `npm run knip` | pass | No unused exports/files reported. |
| `npm run build:admin` | pass | Vite emitted the existing large-chunk warning and exited 0. |
| `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-54-config-page.md --include-worktree` | pass | `changedFiles: 8`; categories `source: 5`, `test: 1`, `docs: 2`; source `netLoc: 516`, `newFiles: 3`. |
| `npx playwright test apps/admin/tests/m7-ui-config-page.spec.ts` | pass | `4 passed`; generated `/tmp/uzmax-m7-ui-54-config-page-cleanstack/`. |
| `npm run playwright` | pass | `128 passed`; Vite emitted the existing large-chunk warning and Node printed the existing `NO_COLOR`/`FORCE_COLOR` warning. |
| `git diff --check` | pass | No whitespace errors. |

Visual correction rerun:

- `npx playwright test apps/admin/tests/m7-ui-config-page.spec.ts`: pass, `4 passed`; regenerated desktop and mobile 320 screenshots/metrics.
- Added focused geometry assertions for desktop top alignment and mobile runtime note height / `panelTop` thresholds.

## Remaining Deltas

- Runtime tenant config DB/API/authz/RLS/audit/config persistence remains intentionally not implemented.
- Production connector switching and dangerous actions remain intentionally blocked.
- Owner visual acceptance is still required after PR review/browser comparison.
- This slice does not alter shared shell/sidebar/topbar, release acceptance, or production readiness state.

## Non-Claims

- No production config write.
- No connector switch execution.
- No audit write.
- No DB/API/authz/RLS/runtime closure.
- No owner visual acceptance.
- No GA-0 or 1.0 release approval.
