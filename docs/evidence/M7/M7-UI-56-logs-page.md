# M7-UI-56 Tenant Logs Page Evidence

## Status

`visible_mvp_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `tenant.logs` / `日志` candidate with synthetic mock/degraded login, online and operation log rows. It does not claim owner visual acceptance, audit/log runtime closure, production audit/log export, file export, trace closure, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-56-logs-page.md`
- Route: `tenant.logs`
- Source target: `apps/admin/src/pages/logs/LogsPage.tsx`, `apps/admin/src/pages/logs/logsFallback.ts`
- Test target: `apps/admin/tests/m7-ui-logs-page.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `docs/admin-design-system.md`.
- Read `docs/specs/SPEC-template.md`.
- Ran Impeccable context for `apps/admin/src/pages/logs` and read product-register guidance.
- Inspected current tenant/group page examples:
  - `apps/admin/src/pages/analytics/AnalyticsPage.tsx`
  - `apps/admin/src/pages/analytics/analyticsFallback.ts`
  - `apps/admin/src/pages/group/GroupLogsPage.tsx`
  - `apps/admin/src/pages/group/GroupLogsViews.tsx`
  - `apps/admin/src/pages/group/groupLogsFallback.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts` tenant logs section (`LOG_TAB_DEFS`, `OP_LOG`, `LOGIN_LOG`, `ONLINE_LOG`, `LOG_COLS`)
  - `/Users/atilla/Downloads/运营塔台1.0.html` logs region located by text search for `日志`, `登录日志`, `在线日志`, `操作日志`, `搜索本页记录`, and `没有匹配`.

## Three-Way Comparison

| Surface | Owner / unpacked source | React candidate | Result |
|---|---|---|---|
| Header | `日志`; source has search in the header | React uses `日志`, source-like search, result subtitle and degraded/mock badge | Aligned with local-only boundary; avoids production audit/log claim |
| Tabs | Source tabs are `登录日志`, `在线日志`, `操作日志`; default operation tab | React preserves the three tabs as buttons with `aria-pressed` and operation tab default | Aligned |
| Log table | Source switches columns per tab and uses dense table rows | React renders the same tab-specific columns with internal desktop scroll | Aligned for desktop source structure |
| Detail links | Source operation detail cells navigate through callback | React renders link-style real buttons with arrow and local-only toast | Aligned visually; runtime navigation intentionally rejected |
| Empty/mobile | Source empty text says `没有匹配「search」的记录`; prototype is desktop-first | React preserves deterministic search empty state and adds mobile card fallback at 320px with no body overflow | Required M7 state/mobile coverage |
| Runtime states | Prototype shows default page | React adds deterministic loading/empty/error/permission/degraded states | Required M7 state coverage |

## Data Boundary

- All rows are synthetic and centralized in `logsFallback.ts`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic tenant log rows`, `no production audit/log export`, `no file written`, `no audit/log runtime call`, `no real tenant/action navigation`.
- Tabs and search only filter in-memory synthetic rows.
- Detail action only shows a toast; no route or navigation into real tenant/action records occurs.
- No DB/API/runtime/authz/audit/log/export/release wiring is implemented.

## Validation

Passed locally on this branch:

- `git diff --check origin/codex/m7-ui-55-analytics-visible-ui...HEAD`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-55-analytics-visible-ui --spec docs/specs/M7-UI-56-logs-page.md --include-worktree`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-56-logs-page.md docs/evidence/M7/M7-UI-56-logs-page.md docs/admin-ui-page-migration-ledger.md docs/evidence/M7/README.md apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/logs/LogsPage.tsx apps/admin/src/pages/logs/logsFallback.ts apps/admin/tests/m7-ui-logs-page.spec.ts`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/eslint/bin/eslint.js apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/logs/LogsPage.tsx apps/admin/src/pages/logs/logsFallback.ts apps/admin/tests/m7-ui-logs-page.spec.ts`
- `find apps/admin/src apps/admin/tests -path '*/dist' -prune -o -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | xargs -0 /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/typescript/lib/tsc.js --ignoreConfig --noEmit --allowImportingTsExtensions --jsx react-jsx --lib ES2023,DOM,DOM.Iterable --module ESNext --target ES2023 --moduleResolution Bundler --strict --skipLibCheck --types node --noUncheckedIndexedAccess --baseUrl . --ignoreDeprecations 6.0`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173` opened on `http://127.0.0.1:4174/` because another local preview already used 4173.
- `PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:4174 /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-logs-page.spec.ts`

Validation notes:

- The shell does not expose `node`, `npm` or `npx` by default. Commands used the existing Node runtime at `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.
- The root `tsconfig.json` covers API/worker/db packages; with pnpm-installed frontend dependencies only, full-repo `tsc` reports missing backend runtime packages such as Nest, BullMQ and Prisma. This slice therefore uses the required admin-target direct TypeScript command above.
- `playwright.config.ts` hardcodes `http://127.0.0.1:4173` and that port was already serving another local preview, so the focused test uses `PLAYWRIGHT_TEST_BASE_URL` and absolute test navigation to hit this branch's `http://127.0.0.1:4174/` preview.
- Vite emitted the existing large chunk warning and exited 0.
- Focused tenant logs Playwright: `5 passed`.
- Coordinator follow-up validation stopped the stale M7-UI-55 preview on 4173, started the current M7-UI-56 preview on 4173, then reran focused Playwright `apps/admin/tests/m7-ui-logs-page.spec.ts`: `5/5 passed` on `desktop-chromium`.
- Coordinator follow-up stacked visible regression `apps/admin/tests/m7-ui-*.spec.ts`: `106/106 passed` on `desktop-chromium`.
- Coordinator also viewed the desktop, search-empty and mobile screenshots and confirmed the artifacts are present.

## Browser Evidence

Artifacts under `/tmp/uzmax-m7-ui-56-logs-page-visible-ui/`:

- Desktop screenshot: `/tmp/uzmax-m7-ui-56-logs-page-visible-ui/react-logs-desktop.png`
- Search empty screenshot: `/tmp/uzmax-m7-ui-56-logs-page-visible-ui/react-logs-search-empty.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-56-logs-page-visible-ui/react-logs-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-56-logs-page-visible-ui/react-logs-metrics.json`

Metrics summary:

- `activePageId`: `tenant.logs`
- `shellLevel`: `tenant`
- `activeTab`: `操作日志`
- desktop `bodyScrollWidth`: `1280`
- `sidebarExpandedWidth`: `232`
- `topbarHeight`: `53`
- `tableRowCount`: `6`
- `cardRowCount`: `6`
- mobile 320 `bodyScrollWidth <= 320` asserted in focused Playwright.

## Known Visual / Runtime Deltas

- Desktop follows the owner source structure and current M7 shell but is not owner-accepted.
- Mobile card fallback is added for M7 readability; the owner prototype remains desktop-primary.
- Operation detail buttons are local-only previews. They intentionally do not navigate to conversations, tickets, config, knowledge, eval or AI member runtime records.
- Synthetic IP ranges use reserved documentation networks to avoid implying production login data.
