# M5R-06 Template Copy Runtime

## 目标

Add a minimal disabled-by-default API + DB/RLS runtime proof for copying a controlled group template reference into a tenant-owned independent `config_version` row with `config_domain = template_copy`.

This slice proves the M5R-06 runtime loop without expanding product scope: a controlled group template source ref plus template kind creates a tenant-owned DRAFT version snapshot, writes an `audit_log` copy action, and later source-ref changes do not mutate the copied tenant version. It includes a quick-reply/config/AI-member/eval template kind validation path, with `quick_reply` used as the smallest proof path in focused tests and true DB smoke.

M5R-06 does not add a broad template library, does not create template tables, does not modify `packages/ops-assets`, does not overwrite production config, and does not wire the visible admin shell. Admin runtime wiring remains M5R-07.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later whether to approve M5R-06 evidence, whether M5R-07/M5R-08 should proceed, and any production, real customer/order-data, customer LLM, LLM key, provider cost, compliance, GA-0, M5 owner acceptance or 1.0 release decision.

AI agent: implement only this spec in the assigned worktree/branch, preserve tenant/RLS boundaries, reuse existing `config_version` and `audit_log` contracts without schema/migration changes, reject unsafe raw/customer/order/prompt/secret refs, prove true DB/RLS behavior when `UZMAX_RLS_DATABASE_URL` is available, record any missing-env blocker honestly, and keep M5/M5R status not owner accepted.

## 时间盒

0.7 个工作日. If implementation requires new template DB tables, `packages/ops-assets` expansion, Prisma schema/migration/RLS policy changes, generated client, lockfile/shared config/CI/guard changes, admin UI runtime wiring, worker/cron, real template material, production config overwrite or source budget overrun, stop and report before widening scope.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-06-template-copy-runtime.md`
  - `docs/evidence/M5R/M5R-06-template-copy-runtime.md`
  - `docs/evidence/M5R/README.md`
  - `docs/incidents/INC-2026-06-25-m5r-06-root-patch-target.md`
  - `apps/api/src/template-copy-runtime.contracts.ts`
  - `apps/api/src/template-copy-runtime.repository.ts`
  - `apps/api/src/template-copy-runtime.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `scripts/tests/m5r-template-copy-runtime.test.mjs`
  - `packages/db/scripts/run-m5r-template-copy-true-db-smoke.mjs`
  - `packages/db/scripts/tests/run-m5r-template-copy-true-db-smoke.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination/audit only.
  - This PR may read `AGENTS.md`, M5R-00..M5R-05 specs/evidence, M5-07 spec/evidence, v1.1 source-of-truth docs, Prisma schema/migrations and current API runtime files.
  - This PR must not touch `packages/db/prisma/schema.prisma`, `packages/db/migrations/**`, generated Prisma client, lockfile, package/shared config/CI/guards, `apps/admin`, `apps/worker`, `apps/cron`, `packages/ops-assets`, `packages/distill`, `packages/evals`, `packages/llm-gateway`, `packages/engine`, `packages/capabilities`, external providers/connectors/adapters or production/release docs.

## 变更预算与路径分类

- source budget target: changed source files <= 8, net source LOC <= 600, new source files <= 4.
- docs: this spec, M5R-06 evidence, M5R evidence README.
- source: minimal `apps/api` template copy runtime controller/contracts/repository; AppModule provider/controller wiring; runtime compiler support; thin true DB smoke CLI wrapper.
- test: focused M5R-06 runtime/API contract test and true DB smoke support under `packages/db/scripts/tests`.
- generated/lock/config/schema/migration/admin UI/Playwright/worker/cron/ops-assets/distill/evals/llm-gateway/engine/capabilities/external provider/adapter/production gate: none.
- New source `rg` conclusion: searched `template_copy`, `config_version`, `TemplateCenter`, `quick_reply`, `ai_member`, `eval template`, `ops-assets`, `formalTenantWrite`, `templateAutoOverwrite`, current M5R runtime patterns, `createRlsTransactionContext` and `UZMAX_RLS_DATABASE_URL`. Existing schema already has `ConfigVersionDomain.TEMPLATE_COPY` and `audit_log`; M5-07 is frontend/local-contract only; `packages/ops-assets/src/index.ts` is a placeholder. No template-copy API/runtime exists. New API source belongs under `apps/api/src/template-copy-runtime*.ts` because M5R-06 is a backend/API runtime slice; existing `config_version` is sufficient for tenant-owned independent copy snapshots, so no schema/migration or broad ops-assets system is needed.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API/provider/connector/adapter and performs no real LLM/provider call. Prisma usage relies on existing generated Prisma client/model and repo-local `createRlsTransactionContext`/`UZMAX_RLS_DATABASE_URL` runtime helpers.
- Exceptions: none expected. No `large_change_exception` and no `test_weakening_exception` unless final source budget evidence proves otherwise.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`.
- Read the four v1.1 source-of-truth docs named in `AGENTS.md` enough to ground template-copy scope and release boundaries.
- Read `docs/specs/M5R-00-runtime-integration-plan.md`.
- Read `docs/evidence/M5R/README.md`.
- Read `docs/specs/M5-07-template-center.md`.
- Read `docs/evidence/M5/M5-07-template-center.md`.
- Read relevant merged M5R specs/evidence: M5R-01 through M5R-05.
- Read existing DB/API patterns before adding anything, using `rg` for `template_copy`, `config_version`, `TemplateCenter`, `quick_reply`, `ai_member`, `eval template`, `ops-assets`, `formalTenantWrite` and `templateAutoOverwrite`.
- Read relevant current files under `apps/api/src/confirmation-queue.formal-write*`, `apps/api/src/ai-member-runtime*`, `apps/api/src/logs-analytics-runtime*`, `apps/api/src/app.module.ts`, `apps/api/scripts/runtime-compiler.mjs`, `packages/db/prisma/schema.prisma`, `packages/db/src/index.ts`, `packages/db/src/prisma-runtime.ts`, `packages/db/migrations/0002_audit_config_version_foundation.sql` and current true DB smoke runners.
- Confirm current `origin/main` is the M5R-05 merge base `42f2a87ace645ddc3d4dd354b789509c12d42760`.
- Record start audit in `docs/evidence/M5R/M5R-06-template-copy-runtime.md` before source/test implementation edits.
- Keep M5 status not owner accepted; do not update M5 owner acceptance status or M5R closeout status.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/private/tmp/uzmax-m5r-06-template-copy-runtime` |
| branch | `codex/m5r-06-template-copy-runtime` |
| base | `origin/main` at `42f2a87ace645ddc3d4dd354b789509c12d42760` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, open PR audit, `git branch --no-merged main`, and git-dir/common-dir isolation proof |

## 并发派发证据

M5R-06 is the only writer for this branch/worktree/spec. The assigned physical path and branch are unique. The touch list includes template-copy API runtime files and DB smoke support, but it does not touch schema, migrations, RLS policy, `packages/ops-assets`, admin UI, worker/cron, lockfile, shared config, CI/guard scripts, generated committed artifacts or release/production gates. M5R-06 may only run in parallel with other slices if their touch lists remain completely disjoint; this worker is the only writer now for shared runtime/helper areas named above.

Open PR audit before edits returned `[]`. Root no-merged branch audit before edits returned no branch output. Linked worktree proof showed worker git dir under `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5r-06-template-copy-runtime` and common dir `/Users/atilla/Documents/UZMAX智能运营/.git`.

## True DB/RLS Smoke Baseline

M5R-06 true DB/RLS smoke must:

- use `UZMAX_RLS_DATABASE_URL`;
- use the restricted `uzmax_app_runtime` role and transaction-scoped `app.org_id` / `app.tenant_id`;
- create a synthetic same-tenant template copy from controlled group template refs into `config_version(config_domain = template_copy, status = draft)`;
- read back the tenant-owned version and audit log;
- prove wrong-tenant invisibility/denial through real DB/RLS;
- prove missing-context negative through real DB/RLS;
- prove independent version behavior by changing a controlled source metadata/ref after copy and verifying the existing copied payload snapshot remains unchanged;
- fail closed with exact missing-env reason if `UZMAX_RLS_DATABASE_URL` is absent.

## 事故与 closeout 记录

- Incident: `docs/incidents/INC-2026-06-25-m5r-06-root-patch-target.md` records that the first M5R-06 docs/source patch landed in root/main, was transferred to the assigned worktree, and root/main was restored clean before validation or commit.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- If validation proves new template tables, ops-assets expansion, schema/migration/admin UI/worker/cron/real-template-material/production scope is required, stop and report rather than widening M5R-06.

## 实施步骤

1. Record start audit and baseline M5R/M5-07 context.
2. Create this M5R-06 spec and evidence file, and update M5R README active/status entry for M5R-06 only.
3. Add disabled-by-default template copy API runtime controller/contracts/repository.
4. Add explicit `rls_prisma_gateway` runtime using `createRlsTransactionContext`, restricted app role and transaction-scoped `app.org_id` / `app.tenant_id`.
5. Accept only controlled group template source refs, supported template kinds (`ai_member`, `config`, `eval`, `quick_reply`), target key, target tenant context from `AccessContext`, reason/control refs and controlled snapshot metadata.
6. Create tenant-owned `config_version` with `domain = TEMPLATE_COPY`, `status = DRAFT`, increasing tenant-local version for the same key, and payload containing only copied immutable source refs/metadata snapshot plus no production overwrite markers.
7. Create `audit_log` for the copy action with actor, source template ref, tenant version/config version ref, template kind, source/copy metadata and before/after content.
8. Add focused tests proving disabled default, explicit RLS mode, missing-env failure, no bare Prisma bypass, RLS transaction setup, supported kind validation, no broad DB table/ops-assets expansion, unsafe raw/customer/order/prompt/secret refs rejection and smoke missing-env failure.
9. Add a true DB smoke runner proving same-tenant copy/readback, cross-tenant invisibility/wrong-tenant negative, missing-context negative, audit readback and independent copied payload snapshot when source metadata/ref changes.
10. Run required validation and record results.
11. Commit, push and open a PR with PR hygiene table.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, implementation scope, validation, true DB/RLS status, acceptance mapping, boundaries and no sensitive data statement.
- Default AppModule path is disabled/contract-safe and does not require `UZMAX_RLS_DATABASE_URL`.
- Explicit template copy DB runtime requires `UZMAX_RLS_DATABASE_URL` and rejects bare `prisma_gateway` mode.
- Runtime DB writes use `createRlsTransactionContext`, restricted app role and transaction-scoped `app.org_id` / `app.tenant_id`.
- API/runtime accepts only controlled group template source refs, supported template kinds, tenant context from access context, reason/control refs and controlled snapshot refs/metadata.
- Supported template kinds include at least `quick_reply`, `config`, `ai_member` and `eval`; focused runtime proof uses `quick_reply`.
- Runtime writes a tenant-owned `config_version` row with `domain = TEMPLATE_COPY` and `status = DRAFT`.
- Runtime does not activate or overwrite production tenant config.
- Runtime writes `audit_log` with actor, action, source template ref, tenant config version ref, template kind and before/after copy metadata.
- Independent version proof shows source ref/metadata changes do not mutate the existing tenant `config_version.payload`.
- No schema/migration/generated client change and no broad `packages/ops-assets` expansion.
- True DB smoke proves same-tenant positive behavior and wrong-tenant/missing-context negative behavior using real DB/RLS if `UZMAX_RLS_DATABASE_URL` is available.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 8, net source LOC <= 600, new source files <= 4 unless a `large_change_exception` is explicitly declared.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If current `config_version`/`audit_log` contracts cannot represent the copy proof path: stop and report why a schema spec is required; do not add schema/migration in M5R-06.
- If true DB smoke cannot run because `UZMAX_RLS_DATABASE_URL` is absent: record the missing-env blocker in evidence and keep the contract test proving the runner/runtime requires `UZMAX_RLS_DATABASE_URL`.
- If tests require admin UI wiring, Playwright API-backed admin runtime, broad template library, `packages/ops-assets` expansion, worker/cron, real customer/order data, real template material, external provider calls, production deploy or M5R-07 scope: stop and split to later M5R specs.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No Prisma schema, migration, RLS policy, generated client, lockfile, shared config/CI/guard, admin UI runtime wiring, Playwright visible runtime closure, `packages/ops-assets` expansion, worker, cron, distill scheduler, eval publishing, prompt/persona/model-route release or production/release gate changes.
- No broad template library, source template persistence table, quick-reply CRUD/search/import/export, template sync runtime, production config overwrite or automatic activation.
- No real customer data, real order data, real LLM calls, customer LLM, external SaaS onboarding, production Redis/worker deployment, GA-0, M6, production readiness, M5 owner acceptance or 1.0 release claim.
- No automatic knowledge/config/profile/eval/template/customer-profile write beyond the scoped `config_version(domain=template_copy, status=draft)` proof record.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 owner acceptance status update and no M5R closeout complete claim.

## 验收映射

| Item | M5R-06 status | Notes |
|---|---|---|
| A-03 | `template_copy_runtime_supported_not_admin_wired` | Runtime copy creates tenant-owned independent `template_copy` config versions; visible admin wiring remains M5R-07. |
| H-04 | `template_copy_independent_version_supported_not_full_template_center_closed` | Tenant copy is a DRAFT immutable snapshot; group source ref/metadata changes do not auto-pollute the tenant version. |
| H-06 | `quick_reply_template_copy_path_supported_not_full_quick_reply_closed` | `quick_reply` is supported as the smallest proof kind; public/private quick-reply search, import/export and permissions remain future. |
| J-05 | `m5r_06_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-06 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-06. |
| K-04 | `active` | Worker worktree/branch/touch list are scoped; schema/migration/ops-assets/global gates remain untouched. |

M5R-06 closes no production acceptance item. It only proves the template-copy runtime path on existing DB/RLS contracts for later admin wiring and final integration closeout.
