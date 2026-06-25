# M5R-07 Admin Runtime Wiring

## 目标

Wire the existing M5 admin shells to an explicit opt-in API-client runtime mode while preserving the default local/synthetic shell behavior and existing tests.

M5R-07 proves that M5-04 through M5-07 admin surfaces can call the runtime APIs created in M5R-01, M5R-04, M5R-05 and M5R-06. It does not add backend behavior, DB schema, RLS policy, migrations, production deployment, real customer data or UI redesign.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later whether M5R-07 evidence is accepted, whether M5R-08 should proceed, and any production, real account, real customer/order-data, customer LLM, LLM key, provider cost, compliance, GA-0, M5 owner acceptance or 1.0 release decision.

AI agent: implement only this spec in the assigned worktree/branch, keep admin runtime mode disabled by default, call only API clients from `apps/admin`, preserve local shell behavior, prove desktop and 320px API paths with Playwright route fixtures, record true DB/RLS status honestly, and keep M5/M5R not owner accepted.

## 时间盒

0.5 个工作日. If implementation requires backend/API runtime changes, DB/RLS/schema/migration changes, generated client, lockfile/shared config/CI/guard changes, UI redesign, real customer/order data, real LLM/provider calls, production deploy or source budget overrun, stop and report before widening scope.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-07-admin-runtime-wiring.md`
  - `docs/evidence/M5R/M5R-07-admin-runtime-wiring.md`
  - `docs/evidence/M5R/README.md`
  - `apps/admin/src/M5ConfirmationQueueShell.tsx`
  - `apps/admin/src/M5AiMemberConsoleShell.tsx`
  - `apps/admin/src/M5LogsAnalyticsShell.tsx`
  - `apps/admin/src/M5TemplateCenterShell.tsx`
  - `apps/admin/src/aiMemberConsoleContracts.ts`
  - `apps/admin/src/confirmationQueueApiClient.ts`
  - `apps/admin/src/m5AdminRuntimeMode.ts`
  - `apps/admin/src/m5ConfirmationQueueRuntime.ts`
  - `apps/admin/src/m5LogsAnalyticsRuntime.tsx`
  - `apps/admin/src/logsAnalyticsApiClient.ts`
  - `apps/admin/src/templateCopyApiClient.ts`
  - `scripts/tests/m5-confirmation-queue-admin.test.mjs`
  - `apps/admin/tests/m5r-admin-runtime-wiring.spec.ts`
  - `scripts/tests/m5r-admin-runtime-wiring.test.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination/audit only.
  - This PR may read AGENTS, M5R-00..M5R-06 specs/evidence, current admin shell/client files, existing M5 admin specs/tests, and v1.1 source-of-truth docs as needed.
  - This PR must not touch `packages/db`, Prisma schema, migrations, generated client, `apps/api`, backend package imports from admin, worker/cron, lockfile, shared config, CI/guard scripts, production/release gates, external providers/connectors/adapters or real customer/order/LLM material.

## 变更预算与路径分类

- source budget target: changed source files <= 12, net source LOC <= 600, new source files <= 5.
- docs: this spec, M5R-07 evidence and M5R evidence README.
- source: four existing M5 admin shells, one existing AI contract file, existing confirmation queue admin API client, and tiny admin runtime helper/client adapters.
- test: focused Playwright runtime wiring smoke, Node anchor test and the existing confirmation queue admin client contract test for `formalWrite` result parsing.
- generated/lock/config/schema/migration/API/backend package/worker/cron/provider/adapter/production gate: none.
- New source `rg` conclusion: searched current admin runtime/client patterns and M5R evidence with `rg` for `__UZMAX_M5R_ADMIN_RUNTIME__`, `confirmationQueueApiClient`, `aiMemberRuntimeApiClient`, `logsAnalytics`, `templateCopy`, `export-jobs`, `template-copy`, `page.route` and M5 shell test ids. Existing clients already covered confirmation queue and AI member runtime. `apps/admin/src/confirmationQueueApiClient.ts` is the correct existing owner for M5R-02 `formalWrite` response parsing. No reusable M5 admin runtime mode helper, logs analytics admin client or template copy admin client existed. Small helper extraction keeps React shell files under lint limits, so new source belongs under `apps/admin/src/m5AdminRuntimeMode.ts`, `apps/admin/src/m5ConfirmationQueueRuntime.ts`, `apps/admin/src/m5LogsAnalyticsRuntime.tsx`, `apps/admin/src/logsAnalyticsApiClient.ts` and `apps/admin/src/templateCopyApiClient.ts`.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external provider/connector/adapter and performs no real LLM/provider call. It only uses existing internal relative API paths.
- Exceptions: none expected. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`.
- Read `docs/specs/M5R-00-runtime-integration-plan.md`.
- Read `docs/evidence/M5R/README.md`.
- Read current M5R-01, M5R-04, M5R-05 and M5R-06 evidence enough to link prior runtime/API/RLS boundaries.
- Read the four current admin shells in `apps/admin/src`.
- Read existing admin API clients: `apps/admin/src/confirmationQueueApiClient.ts` and `apps/admin/src/aiMemberRuntimeApiClient.ts`.
- Use `rg` before adding new source files.
- Keep M5 status not owner accepted; do not update M5 owner acceptance status or M5R closeout status.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/private/tmp/uzmax-m5r-07-admin-runtime-wiring` |
| branch | `codex/m5r-07-admin-runtime-wiring` |
| base | `a1acf85c76b88b48302857e9c3e248f6fb9b4e3f` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, open PR audit if available, and final changed-file audit before commit |

## 并发派发证据

M5R-07 is the only writer for this branch/worktree/spec. The assigned physical path and branch are unique. The touch list is admin/docs/test only and does not touch DB/schema/migrations/API runtime/shared config/lockfile/CI/guard/generated artifacts or release/production gates.

## 事故与 closeout 记录

No new incident is expected for M5R-07. If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

M5R-07 records that direct true DB/RLS smoke is omitted because this is an admin wiring slice. It consumes prior API-backed runtime evidence from M5R-01, M5R-04, M5R-05 and M5R-06, and local environment may lack `UZMAX_RLS_DATABASE_URL`. It must not claim a true DB/RLS pass unless actually run.

## 实施步骤

1. Confirm worktree/branch/base and read required docs/source files.
2. Add this spec and M5R-07 evidence; update M5R README active/status entries.
3. Add a tiny disabled-by-default admin runtime mode helper gated by `window.__UZMAX_M5R_ADMIN_RUNTIME__`.
4. Wire `M5ConfirmationQueueShell` to existing confirmation queue API client for list/detail/decision in runtime mode only.
5. Wire `M5AiMemberConsoleShell` to existing AI member runtime API client for state, emergency stop, recovery and capability toggle in runtime mode only.
6. Add compact admin client adapters for logs analytics and template copy runtime paths, and wire the existing shells in runtime mode only.
7. Add focused Playwright route-fixture tests that assert requests go to `/confirmation-queue`, `/ai-members`, `/logs-analytics` and `/template-copy`, including 320px approve/discard/emergency/recovery.
8. Add focused Node anchor test for docs/source/test boundaries.
9. Run required validation and record results.
10. Commit, push and open a PR against `main` if validation is green or honestly report blockers.

## 通过条件

- Default admin shells remain local/synthetic and existing M5 admin tests remain intact.
- Runtime mode is opt-in via `window.__UZMAX_M5R_ADMIN_RUNTIME__`.
- Admin imports only API-client/admin files, not backend packages.
- Confirmation queue runtime mode calls API list, detail and decision endpoints.
- AI member runtime mode calls API state, emergency stop, recovery and capability toggle endpoints.
- Logs analytics runtime mode calls board/log list endpoints and export job endpoint.
- Template center runtime mode calls template copy endpoint.
- 320px Playwright coverage proves confirmation approve/discard and AI emergency/recovery use API paths.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 12, net source LOC <= 600, new source files <= 5 unless an exception is explicitly declared and approved.

## 失败分支

- If worktree/branch/base differs: stop and report `BLOCKED`.
- If runtime wiring requires backend/API/DB/schema/migration/RLS changes: stop and split to a backend runtime spec.
- If true DB/RLS smoke cannot run because `UZMAX_RLS_DATABASE_URL` is absent: record the missing-env/non-applicable admin-wiring status and do not claim true DB pass.
- If tests require broad UI redesign, production deployment, real customer/order data, real LLM/provider calls, backend package imports in admin or source budget overrun: stop and report before widening scope.
- If validation fails from this slice, fix within allowed files; do not weaken tests, delete coverage or add `.skip`/`.only`/`xit`/`xfail`.

## 不做什么

- No `packages/db`, Prisma schema, migrations, RLS policy, generated client, `apps/api`, backend runtime behavior, backend imports in admin, worker, cron, lockfile, shared config, CI/guard, provider/connector/adapter or production/release-gate changes.
- No UI redesign or new product surface beyond minimal runtime status/result/error text.
- No real customer data, real order data, real LLM calls, customer LLM, external SaaS onboarding, production Redis/worker deployment, GA-0, M6, production readiness, M5 owner acceptance or 1.0 release claim.
- No direct formal knowledge/config/profile/eval/template/customer-profile write from admin shell.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.

## 验收映射

| Item | M5R-07 status | Notes |
|---|---|---|
| I-02 | `admin_mobile_runtime_wiring_supported_not_true_closeout` | 320px confirmation approve/discard and AI emergency/recovery route through API clients under explicit runtime mode. |
| I-06 | `admin_logs_runtime_wiring_supported_not_export_release` | Logs shell can call runtime board/log/export-job APIs; no direct sensitive export file is exposed. |
| I-07 | `admin_ai_runtime_wiring_supported_not_owner_accepted` | AI member state/action/toggle client calls are wired; no persona/prompt/model release approval. |
| A-03/H-04/H-06 | `admin_template_copy_runtime_wiring_supported` | Template center can call template-copy API; template runtime proof remains M5R-06. |
| J-05 | `m5r_07_admin_wiring_evidence_added_not_owner_accepted` | This evidence records M5R-07 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-07. |
| K-04 | `active` | Worker worktree/branch/touch list are scoped; DB/API/backend/global gates remain untouched. |

M5R-07 closes no production acceptance item. It only proves admin runtime wiring for later M5R-08 true integration closeout.
