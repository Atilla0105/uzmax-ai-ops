# M5R-04 AI Member Runtime Control

## 目标

Add a minimal API + DB/RLS runtime proof for AI member emergency stop, recovery and capability toggles, backed by the existing `ai_member`, `ai_member_version`, `ai_capability_toggle` and `audit_log` tables.

This slice turns the M5-05 frontend/local action drafts into a runtime contract. It does not create or publish a new persona, prompt, model route or eval set, and it does not wire the full admin UI runtime path. The mobile emergency fallback proof is a narrow API-client contract that reaches the real API routes; full visible admin wiring remains M5R-07.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide later whether to approve M5R-04 evidence, whether to proceed to M5R-05/M5R-07/M5R-08, and any production, real customer/order-data, customer LLM, LLM key, provider cost, compliance, GA-0, M5 owner acceptance or 1.0 release decision.

AI agent: implement only this spec in the assigned worktree/branch, preserve tenant/RLS boundaries, reuse existing M5 DB contracts without schema or migration changes, enforce M3 eval-gate/breaker non-bypass rules, prove true DB/RLS behavior when `UZMAX_RLS_DATABASE_URL` is available, record any missing-env blocker honestly, and keep M5/M5R status not owner accepted.

## 时间盒

0.8 个工作日. If implementation requires Prisma schema/migration/RLS policy changes, generated client, lockfile/shared config/CI/guard changes, LLM/provider calls, prompt/persona/model-route release, broad admin UI wiring, worker/cron/distill/template/log expansion, or source budget overrun, stop and report before widening scope.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5R-04-ai-member-runtime-control.md`
  - `docs/evidence/M5R/M5R-04-ai-member-runtime-control.md`
  - `docs/evidence/M5R/README.md`
  - `docs/incidents/INC-2026-06-25-m5r-04-root-readme-pollution.md`
  - `apps/api/src/ai-member-runtime.ts`
  - `apps/api/src/ai-member-runtime.contracts.ts`
  - `apps/api/src/ai-member-runtime.repository.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/scripts/runtime-compiler.mjs`
  - `apps/admin/src/M5AiMemberConsoleShell.tsx`
  - `apps/admin/src/aiMemberRuntimeApiClient.ts`
  - `scripts/tests/m5r-ai-member-runtime-control.test.mjs`
  - `packages/db/scripts/run-m5r-ai-member-runtime-true-db-smoke.mjs`
  - `packages/db/scripts/tests/run-m5r-ai-member-runtime-true-db-smoke.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only coordination/audit only.
  - This PR may read `AGENTS.md`, M5R-00/M5R-01/M5R-02/M5R-03 specs/evidence, M5-01/M5-05 specs/evidence, M3 breaker/eval gate docs/tests, v1.1 source-of-truth docs, Prisma schema/migrations and current API runtime files.
  - This PR must not touch `packages/db/prisma/schema.prisma`, `packages/db/migrations/**`, generated Prisma client, lockfile, package/shared config/CI/guards, broad `apps/admin` UI shells/CSS/Playwright, `apps/worker`, `apps/cron`, `packages/distill`, `packages/evals`, `packages/llm-gateway`, prompt/persona/model-route files, external providers/connectors/adapters or production/release docs.

## 变更预算与路径分类

- source budget target: changed source files <= 10, net source LOC <= 650, new source files <= 4.
- docs: this spec, M5R-04 evidence, M5R evidence README, mandatory incident record.
- source: minimal `apps/api` AI member runtime controller/contracts/repository source split, AppModule provider/controller wiring, API runtime compiler support, a tiny admin API-client fallback proof plus non-wiring shell anchor, and a thin true DB smoke CLI wrapper.
- test: focused M5R-04 runtime/API/client contract test and true DB smoke support under `packages/db/scripts/tests`.
- generated/lock/config/schema/migration/broad admin UI/Playwright/worker/cron/distill/evals/llm-gateway/prompt/persona/model-route/external provider/adapter: none.
- New source `rg` conclusion: searched `AiMember`, `ai_member`, `AI member`, `ai member`, `aiMember`, `AI 成员`, `capability toggle`, `aiCapability`, `emergency stop`, `recover_online`, `breaker_offline`, `manual_offline`, `toggle_capability`, `ai_capability_toggle`, `evalGate`, `eval_gate`, `createRlsTransactionContext`, `UZMAX_RLS_DATABASE_URL`, `audit_log` and `rls_prisma_gateway` under `apps`, `packages`, `scripts`, `docs/specs`, `docs/evidence/M5` and `docs/evidence/M5R`. Existing work provides M5-05 local frontend drafts, M5-01 DB contracts and M5R runtime patterns, but no AI member runtime API/repository/client path. New API source belongs under `apps/api/src/ai-member-runtime*.ts` because M5R-04 is an API+DB runtime slice; the controller entrypoint stays in `apps/api/src/ai-member-runtime.ts`, shared validation/contract helpers live in `apps/api/src/ai-member-runtime.contracts.ts`, and RLS repository behavior lives in `apps/api/src/ai-member-runtime.repository.ts` to stay within ESLint file-length/complexity gates without changing product scope. The tiny mobile fallback client belongs in `apps/admin/src/aiMemberRuntimeApiClient.ts`; the true DB smoke wrapper belongs under `packages/db/scripts`.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API/provider/connector/adapter and performs no real LLM/provider call. Prisma usage relies on existing generated Prisma client/model and repo-local `createRlsTransactionContext`/`UZMAX_RLS_DATABASE_URL` runtime helpers.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`.
- Read `docs/specs/M5R-00-runtime-integration-plan.md`.
- Read `docs/evidence/M5R/README.md`.
- Read `docs/specs/M5R-01-confirmation-queue-persistence.md`.
- Read `docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md`.
- Read `docs/specs/M5R-02-formal-write-pipeline.md`.
- Read `docs/evidence/M5R/M5R-02-formal-write-pipeline.md`.
- Read `docs/specs/M5R-03-distill-scheduler-health-runtime.md`.
- Read `docs/evidence/M5R/M5R-03-distill-scheduler-health-runtime.md`.
- Read `docs/specs/M5-05-ai-member-console.md`.
- Read `docs/evidence/M5/M5-05-ai-member-console.md`.
- Read `docs/specs/M5-01-db-contract-foundation.md`.
- Read `docs/evidence/M5/M5-01-db-contract-foundation.md`.
- Read `docs/evidence/M5/README.md`.
- Read v1.1 PRD, technical architecture, admin/frontend architecture and 1.0 acceptance matrix enough to ground REQ-T08, G-03, I-02, I-07 and K-02.
- Read M3 eval gate/breaker docs/tests: `docs/specs/M3-08-breaker-radius-and-redline-output-guard.md`, `scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs`, `scripts/tests/eval-gate.test.mjs`, `packages/db/src/m3-ai-contracts.ts`.
- Read relevant current files under `packages/db/prisma/schema.prisma`, `packages/db/migrations/0007_m5_operations_contracts_foundation.sql`, `packages/db/migrations/0002_audit_config_version_foundation.sql`, `packages/db/migrations/0004_ai_capability_data_contracts_foundation.sql`, `packages/db/src/m5-operations-contracts.ts`, `packages/db/src/index.ts`, `packages/db/src/prisma-runtime.ts`, `apps/api/src/confirmation-queue.runtime.ts`, `apps/api/src/confirmation-queue.formal-write.ts`, `apps/api/src/audit-log.prisma-sink.ts`, `apps/api/src/app.module.ts`, `apps/api/scripts/runtime-compiler.mjs`, `apps/admin/src/confirmationQueueApiClient.ts`, and current M5R true DB smoke runners.
- Confirm current `origin/main` is the M5R-03 merge base `e52796e6fbd8fff1d8e953e24245236e1a765574`.
- Record start audit in `docs/evidence/M5R/M5R-04-ai-member-runtime-control.md` before source/test implementation edits.
- Keep M5 status not owner accepted; do not update M5 owner acceptance status.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/private/tmp/uzmax-m5r-04-ai-member-runtime-control` |
| branch | `codex/m5r-04-ai-member-runtime-control` |
| base | `origin/main` at `e52796e6fbd8fff1d8e953e24245236e1a765574` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, open PR audit, `git branch --no-merged main`, `git worktree list`, and git-dir/common-dir isolation proof |

## 并发派发证据

M5R-04 is the only writer for this branch/worktree/spec. The assigned physical path and branch are unique. The touch list overlaps AI member API/runtime, audit and DB smoke paths, so any parallel worker touching those paths must wait or show disjoint evidence. This slice does not touch global serial schema/migration/RLS policy/lockfile/shared config/CI/guard/generated/release gates.

Open PR audit before edits returned `[]`. Root no-merged branch audit before edits returned no branch output. Linked worktree list before edits contained only root/main and this assigned M5R-04 worktree.

## 事故与 closeout 记录

- Mandatory incident: `docs/incidents/INC-2026-06-25-m5r-04-root-readme-pollution.md` records an earlier M5R-04 worker briefly modifying root/main `docs/evidence/M5R/README.md`; the coordinator restored root/main before this worker resumed in `/private/tmp`.
- Relocation note: earlier attempts used `/Users/atilla/Documents/uzmax-m5r-04-ai-member-runtime-control`, but the coordinator moved the same linked worktree to `/private/tmp/uzmax-m5r-04-ai-member-runtime-control` with `git worktree move` to preserve branch isolation inside writable roots. This is not a product scope change.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- If validation proves schema/migration/admin UI/worker/cron/distill/log/template/eval publishing/LLM/provider/production deployment scope is required, stop and report rather than widening M5R-04.

## 实施步骤

1. Record start audit and baseline M5-05/M3 focused contract evidence.
2. Create this M5R-04 spec and evidence file, and add an M5R README index/status entry for M5R-04 only.
3. Add a minimal API runtime repository/service/controller for AI member status, recovery and capability toggle operations; default AppModule mode must be disabled and must not require `UZMAX_RLS_DATABASE_URL`.
4. Add explicit `rls_prisma_gateway` runtime mode using `createRlsTransactionContext`, restricted app runtime role and transaction-scoped `app.org_id` / `app.tenant_id`.
5. Emergency stop updates existing `ai_member`, records `emergency_stopped_at` and writes `audit_log` with actor, action, reason/control refs, target ref and before/after state.
6. Recovery updates existing `ai_member`, preserves active `ai_member_version` evidence in audit content, writes `audit_log`, and fails closed if an active breaker reason remains without explicit controlled recovery evidence or if the active version's eval gate is not passed.
7. Capability toggles update existing `ai_capability_toggle` and write `audit_log`; enabling with config/eval gate references requires an existing `eval_gate` row in `passed` status, otherwise it fails closed and leaves the toggle disabled/unmodified.
8. Add a tiny admin API-client fallback proof that calls the real AI member runtime API routes without redesigning or wiring the visible M5-05 shell.
9. Add focused tests proving API contract, runtime mode fail-closed/no bare Prisma bypass, status/toggle/audit behavior, mobile fallback client endpoint shape and M3 eval-gate/breaker non-bypass rules.
10. Add a true DB/RLS smoke runner proving same-tenant emergency stop, recovery, capability toggle, audit readback, version context, eval-gate enforcement, wrong-tenant invisibility/denial and missing-context DB/RLS negatives.
11. Run required validation and record results.
12. Commit, push and open a PR with PR hygiene table.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, implementation scope, validation, true DB/RLS status, acceptance mapping, boundaries and no sensitive data statement.
- Default AppModule path is disabled/contract-safe and does not require `UZMAX_RLS_DATABASE_URL`.
- Explicit AI member DB runtime requires `UZMAX_RLS_DATABASE_URL` and rejects bare `prisma_gateway` mode.
- Runtime DB writes use `createRlsTransactionContext`, restricted app role and transaction-scoped `app.org_id` / `app.tenant_id`.
- Emergency stop writes only existing `ai_member` and `audit_log`.
- Recovery writes only existing `ai_member` and `audit_log`, and preserves active `ai_member_version` context in audit content without creating or publishing a new persona/prompt/model route.
- Recovery fails closed when an active breaker reason exists unless explicit controlled recovery evidence is provided.
- Recovery fails closed if the active AI member version references an eval gate that is not `passed`.
- Capability toggle writes only existing `ai_capability_toggle` and `audit_log`.
- Enabling a capability with a config/eval gate reference requires existing passed `eval_gate` evidence; pending/failed/blocked/missing gate evidence keeps the toggle disabled/fails closed.
- Every emergency stop, recovery and capability toggle audit entry includes actor, action, reason/control refs, target ref, before state and after state.
- Mobile emergency fallback proof reaches real API routes through a focused admin API client only; visible admin runtime wiring remains M5R-07.
- True DB smoke proves same-tenant positive behavior and wrong-tenant/missing-context negative behavior using real DB/RLS, not repository-only filters, if `UZMAX_RLS_DATABASE_URL` is available.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 10, net source LOC <= 650, new source files <= 4.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If current DB contract is insufficient and schema/migration/RLS changes are required: stop and report `BLOCKED` with evidence; do not add schema/migration in M5R-04.
- If true DB smoke cannot run because `UZMAX_RLS_DATABASE_URL` is absent: record the missing-env blocker in evidence and keep the contract test proving the runner/runtime requires `UZMAX_RLS_DATABASE_URL`.
- If source budget exceeds target: stop and report with proposed split.
- If tests require broad admin UI wiring, Playwright visible browser evidence, worker/cron, distill scheduler, template copy runtime, log analytics runtime, formal write expansion, H-01 full authoring, eval publishing, prompt/persona/model-route release, external provider calls, production deploy or real customer/order data: stop and split to later M5R specs.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No Prisma schema, migration, RLS policy, generated client, lockfile, shared config/CI/guard, broad admin UI wiring, Playwright visible runtime wiring, worker, cron, distill scheduler, template copy runtime, log analytics runtime, eval publishing, prompt/persona/model-route release or production/release gate changes.
- No real customer data, real order data, real LLM calls, customer LLM, external SaaS onboarding, production Redis/worker deployment, GA-0, M6, production readiness, M5 owner acceptance or 1.0 release claim.
- No automatic knowledge/config/profile/eval/template/customer-profile write.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 owner acceptance status update.

## 验收映射

| Item | M5R-04 status | Notes |
|---|---|---|
| G-03 | `runtime_non_bypass_rule_supported_not_eval_publish_closed` | AI member recovery/toggle paths cannot use failed/pending gate evidence to release runtime changes; no eval publishing is added. |
| F-06 | `breaker_runtime_control_supported_not_fault_injection_closed` | Emergency stop/recovery respects active breaker reason and controlled recovery evidence; production fault injection remains M6/future. |
| I-02 | `api_mobile_fallback_contract_supported_not_admin_wired` | Tiny admin API client reaches emergency stop/recovery routes; full mobile visible wiring remains M5R-07. |
| I-07 | `ai_member_runtime_audit_supported_not_logs_center_closed` | AI member actions write audit logs; log center readback remains M5R-05. |
| J-05 | `m5r_04_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-04 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-04. |
| K-04 | `active` | Worktree/branch/touch list are scoped; schema/migration/global gates remain untouched. |

M5R-04 closes no production acceptance item. It only proves runtime AI member controls on existing DB/RLS contracts.
