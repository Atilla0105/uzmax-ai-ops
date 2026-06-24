# M5-01 DB Contract Foundation

## 目标

Create the minimum M5 operations-loop DB and contract foundation for confirmation candidates, distill run/health guardrails, AI member state, AI member versions and per-AI capability toggles.

This slice only creates durable data vocabulary and pure contract builders. It does not implement API/admin/worker/runtime/distill scheduler/template center/log center/analytics UI, formal knowledge writes, eval writes, customer profile writes or production release behavior.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: confirm that this PR is only an M5 foundation slice and does not close M5, GA-0, production, customer-data, customer-LLM, LLM key, cost, compliance or 1.0 release decisions.

AI agent: implement only the allowlisted DB/schema/migration/contracts/tests/docs in the assigned worktree, preserve tenant/RLS boundaries, record evidence, validate source budget, and keep H-02/H-03/H-07/I-02/I-07/J-05 as foundation/queued rather than closed.

## 时间盒

0.5 个工作日. If source net LOC exceeds 600 or the schema/contract surface needs runtime/API/admin behavior to be meaningful, stop and report `BLOCKED` with a smaller split.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5-01-db-contract-foundation.md`
  - `docs/evidence/M5/M5-01-db-contract-foundation.md`
  - `docs/evidence/M5/README.md`
  - `packages/db/prisma/schema.prisma`
  - `packages/db/migrations/0007_m5_operations_contracts_foundation.sql`
  - `packages/db/src/m5-operations-contracts.ts`
  - `packages/db/src/index.ts`
  - `scripts/tests/m5-operations-db-contracts-foundation.test.mjs`
  - `scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs`
- 说明/备注：
  - This is the only active writing worker because `packages/db` schema/migration is a global serial point.
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only for this worker.

## 变更预算与路径分类

- Default source budget: changed source files <= 12, net source LOC <= 600, new source files <= 5.
- docs: this spec, M5-01 evidence, M5 evidence README.
- source: `packages/db/prisma/schema.prisma`, `packages/db/src/m5-operations-contracts.ts`, `packages/db/src/index.ts`.
- generated: SQL migration `packages/db/migrations/0007_m5_operations_contracts_foundation.sql`.
- test: `scripts/tests/m5-operations-db-contracts-foundation.test.mjs`, `scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs`.
- lock/config/apps/admin/api/worker/cron/engine/capabilities/llm-gateway/evals/raw samples/generated client: none.
- New source `rg` conclusion: searched `m5OperationsContracts`, `M5 operations`, `operations contracts`, `confirmation_item`, `distill_run`, `distill_health_daily`, `ai_member`, `ai_member_version`, and `ai_capability_toggle` under `packages/db/src`, `packages/db/prisma`, `docs/specs`, `docs/evidence/M5`, and `scripts/tests`. No existing M5 operations contract module or target DB tables exist; the only `ai_member*` hit was an old doc-trigger path. New source home is `packages/db/src/m5-operations-contracts.ts` because M5 operations DB contracts are distinct from M3 AI capability and M4 customer/order modules.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API/provider/connector/adapter.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M5-00-operations-loop-readiness-pack.md`, `docs/evidence/M5/README.md`, named v1.1 PRD/architecture/backend/acceptance sections and existing DB patterns before implementation.
- Worktree must be `/Users/atilla/Documents/uzmax-m5-01-db-contract-foundation`.
- Branch must be `codex/m5-01-db-contract-foundation`.
- Do not write to `/Users/atilla/Documents/UZMAX智能运营` root/main checkout.
- Start audit must be recorded in `docs/evidence/M5/M5-01-db-contract-foundation.md` before code/schema edits.
- `packages/db` schema/migration remains global serial; no parallel worker may touch schema, migration, lockfile, shared config, CI/guards or generated client.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5-01-db-contract-foundation` |
| branch | `codex/m5-01-db-contract-foundation` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | read-only audit only |

## 并发派发证据

Single active writing worker. Touch list overlaps `packages/db` schema/migration, so this slice is globally serial. Physical worktree and branch are distinct from root/main. No other M5 schema worker may run until this slice is merged, superseded or abandoned with evidence.

## 事故与 closeout 记录

- Incident: none at start.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- M5 closeout is not in this slice; later M5-08 or owner evidence must decide milestone acceptance.

## 实施步骤

1. Record start audit evidence for worker/root/GitHub state.
2. Add Prisma enums/models and SQL migration for `confirmation_item`, `distill_run`, `distill_health_daily`, `ai_member`, `ai_member_version`, `ai_capability_toggle`.
3. Add pure M5 contract builders with UUID/enum/ref/count/pass-rate validation and raw carrier key rejection.
4. Export a lightweight type bridge from `packages/db/src/index.ts`; runtime M5 contract values stay in `packages/db/src/m5-operations-contracts.ts`.
5. Add focused M5 DB contract test and update the M3 historical boundary test so it checks the M3 migration/slice rather than future global schema.
6. Update M5 evidence and M5 README after implementation without marking M5 accepted.
7. Run required validation and commit if all checks pass.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, scope, validation, acceptance mapping, boundaries and no sensitive data statement.
- Schema/migration contain only the six M5 tables and related enums required by this slice.
- All six tables are tenant-scoped with org/tenant FK, forced RLS, select/insert/update policies for `uzmax_app_runtime`, public revoke and no delete grant.
- SQL and builders enforce candidateLimit <= 10, nonnegative counts, pass rate 0..10000, required refs/text and object JSON payloads.
- Builders reject invalid UUIDs/enums and obvious raw carrier keys including raw/body/content/prompt/completion/customerPlaintext/telegramPayload/phone/address/payment/orderId/secret.
- AI member version stores refs only, not raw persona/prompt/completion.
- M3 historical no-future-distill check applies to the M3 migration/slice, not the current global schema after M5.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 12, net source LOC <= 600, new source files <= 5.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If source net LOC exceeds 600 or new source files exceed 5: stop and report `BLOCKED` with proposed split.
- If Prisma relations force a broad schema/source expansion: keep UUID fields plus scoped SQL FK constraints where safe, or stop and split.
- If tests require API/admin/worker/runtime/distill scheduler implementation: stop and split to later M5 specs.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop and clean up before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No API/admin/worker/runtime/distill scheduler/template center/log center/analytics UI.
- No formal knowledge write, eval set write, customer profile write or automatic confirmed-target write.
- No customer LLM, production Redis/worker, GA-0, M6, real customer/order data, raw/export/jsonl/csv, screenshots, voice transcripts, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No package.json/package-lock, apps, admin, api, worker, cron, engine, capabilities, llm-gateway, evals, CI, guards, generated client, raw samples or unrelated docs.
- No M5 accepted claim.

## 验收映射

| Item | M5-01 status | Notes |
|---|---|---|
| H-02 | `foundation_supported_not_closed` | `confirmation_item` can represent pending/approved/edited/discarded/blocked candidates, but API/admin/runtime confirmation and formal writes remain future M5-03/M5-04. |
| H-03 | `foundation_supported_not_closed` | `conflict_candidate` kind and `diffPayload` object foundation exists; mandatory side-by-side E2E remains future. |
| H-07 | `foundation_supported_not_closed` | `distill_run` and `distill_health_daily` store cap/pass-rate/downshift/recovery refs; scheduler/downshift/alert behavior remains future M5-02/M5-04/M5-06. |
| I-02 | `queued_foundation_only` | AI emergency/confirmation mobile fallbacks need future admin/API slices. |
| I-07 | `queued_foundation_only` | AI member state/action audit refs exist, but login/presence/operation log center readback remains future M5-06. |
| J-05 | `foundation_evidence_added_not_closed` | M5-01 evidence is archived now; M5 closeout and release checklist remain future. |

M5-01 closes no production acceptance item. It only provides DB/schema/contracts foundation for later M5 operations-loop slices.
