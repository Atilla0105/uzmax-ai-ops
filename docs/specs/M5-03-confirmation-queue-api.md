# M5-03 Confirmation Queue API

## 目标

Implement one scoped Nest API contract slice for the M5 confirmation queue: list and detail reads, approve/edit/discard/block decisions, conflict diff enforcement, tenant-scoped access, conservative permissions and explicit proof that API decisions do not perform formal knowledge/profile/eval writes before confirmation.

This slice uses an in-memory repository only. It does not add Prisma/DB runtime access, migrations, generated clients, worker/cron/admin UI, distill scheduler integration, formal knowledge writes, customer profile writes, eval writes, alert delivery, production behavior or external side effects.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: confirm this PR is only the M5-03 API contract shell and does not close M5, H-02/H-03 production acceptance, GA-0, production readiness, real customer traffic/data, customer LLM, LLM key, cost, compliance or 1.0 release decisions.

AI agent: implement only the allowlisted API/test/docs files in the assigned worktree; preserve org + selected tenant scoping; use `confirmation:read` and `confirmation:write`; reject raw carrier keys and unsafe refs; prove decisions return audit draft contracts with `formalWrite: false`; record evidence and validation; keep M5 not accepted.

## 时间盒

0.5 个工作日. If changed source files exceed 6, net source LOC exceeds 550, new source files exceed 5, or meaningful implementation requires DB/runtime/admin/worker integration, stop and report `BLOCKED` with a smaller split.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5-03-confirmation-queue-api.md`
  - `docs/evidence/M5/M5-03-confirmation-queue-api.md`
  - `docs/evidence/M5/README.md`
  - `apps/api/src/confirmation-queue.types.ts`
  - `apps/api/src/confirmation-queue.repository.ts`
  - `apps/api/src/confirmation-queue.service.ts`
  - `apps/api/src/confirmation-queue.controller.ts`
  - `apps/api/src/confirmation-queue.ts`
  - `apps/api/src/app.module.ts`
  - `scripts/tests/m5-confirmation-queue-api.test.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only for this worker.
  - This slice must not touch `packages/db/**`, migrations/schema/generated client, `packages/distill`, `apps/admin`, `apps/worker`, `apps/cron`, `packages/engine`, `packages/capabilities`, `packages/llm-gateway`, `packages/evals`, lockfiles, CI/guards/config, raw samples, external provider/adapter files or production/release docs outside this allowlist.

## 变更预算与路径分类

- source budget target: changed source files <= 6, net source LOC <= 550, new source files <= 5.
- docs: this spec, M5-03 evidence, M5 evidence README.
- source: five new `apps/api/src/confirmation-queue.*` files plus existing `apps/api/src/app.module.ts`.
- test: `scripts/tests/m5-confirmation-queue-api.test.mjs`.
- generated/lock/config/packages/db/packages/distill/apps/admin/apps/worker/apps/cron/engine/capabilities/llm-gateway/evals/raw samples/external provider/adapter: none.
- New source `rg` conclusion: searched `ConfirmationQueue`, `confirmation-queue`, `confirmation_item`, `conflict_candidate`, `confirmation:` and `确认队列` under `apps/api`, `packages`, `scripts`, `docs/specs` and `docs/evidence/M5`. Existing confirmation queue implementation is limited to M5-01 DB contract vocabulary and M5 readiness/spec references; there is no API controller/service/repository shell. New source belongs under `apps/api/src/confirmation-queue.*` because M5-03 is an API contract slice and must not extend DB, distill, admin, worker or capability packages.
- External evidence / API / SDK / provider / connector / adapter basis: none. This PR adds no external API, SDK, provider, connector or adapter and performs no external call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M5-00-operations-loop-readiness-pack.md`, `docs/specs/M5-01-db-contract-foundation.md`, `docs/specs/M5-02-distill-guardrails.md`, `docs/evidence/M5/README.md`, `docs/evidence/M5/M5-01-db-contract-foundation.md`, `docs/evidence/M5/M5-02-distill-guardrails.md`, relevant v1.1 PRD/architecture/backoffice/acceptance sections, and existing API patterns before implementation.
- Worktree must be `/Users/atilla/Documents/uzmax-m5-03-confirmation-queue-api`.
- Branch must be `codex/m5-03-confirmation-queue-api`.
- Do not write to `/Users/atilla/Documents/UZMAX智能运营` root/main checkout.
- Start audit must be recorded in `docs/evidence/M5/M5-03-confirmation-queue-api.md` before source/test/docs implementation edits.
- `packages/db` schema/migration, lockfile, shared config, CI/guards, generated client, distill runtime, worker/cron/admin and production/release gates are outside this slice.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5-03-confirmation-queue-api` |
| branch | `codex/m5-03-confirmation-queue-api` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | read-only audit only |

## 并发派发证据

Single active writing worker for this spec. Touch list is distinct from M5-01 DB schema/migration and M5-02 distill files. It touches shared `apps/api/src/app.module.ts`, so any parallel worker touching the same API module/router wiring must wait or show non-overlap in evidence. Physical worktree and branch are distinct from root/main.

## 事故与 closeout 记录

- Incident: none at start.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- M5 closeout is not in this slice; later M5-08 or owner evidence must decide milestone acceptance.

## 实施步骤

1. Record start audit evidence for worker/root/GitHub state.
2. Add split confirmation queue types/repository/service/controller/barrel under `apps/api/src`.
3. Register the controller/service/repository in `apps/api/src/app.module.ts`, defaulting to in-memory repository.
4. Add focused Node test covering API registration, tenant scoping, permissions, list/detail filters, decision actions, conflict diff enforcement, raw key/unsafe ref rejection, explicit HTTP error mapping and docs/evidence status.
5. Update M5 evidence README and M5-03 evidence without marking M5 accepted.
6. Run required validation and commit if all checks pass.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, scope, validation, acceptance mapping, boundaries and no sensitive data statement.
- API uses `assertPermission` with `confirmation:read` for list/detail and `confirmation:write` for decisions.
- Repository access is scoped by `orgId` and `selectedTenantId`; cross-tenant reads/decisions return not found.
- List supports pending/default and kind/status filters for selected tenant.
- Detail returns `diffPayload` for `conflict_candidate`.
- Decisions support `approve`, `edit`, `discard` and `block` or equivalent; reviewer comes from access context user.
- Edit requires an edited payload object or controlled edited payload ref and results in `edited` status or equivalent without formal write.
- Conflict candidate approve/edit requires side-by-side diff payload presence; no skip-to-formal-write path exists.
- Decision responses return an audit draft/ref and explicit `formalWrite: false` proof.
- Raw carrier keys and unsafe refs are rejected in decision payloads, including `raw`, `body`, `content`, `prompt`, `completion`, `customerPlaintext`, `telegramPayload`, `phone`, `address`, `payment`, `orderId`, `secret`, `http`, `https`, `data`, `blob`, `file` and base64-ish inline refs.
- Controller maps validation to 400, not found to 404, and permission/access failures to 403.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 6, net source LOC <= 550, new source files <= 5.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If source budget exceeds target: stop and report `BLOCKED` with proposed split.
- If tests require Prisma/DB runtime, formal writes, distill scheduler, worker/cron/admin UI, provider calls or production behavior: stop and split to later M5 specs.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop and clean up before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No Prisma/DB runtime, migration/schema/generated client, `packages/distill`, admin UI, worker/cron integration, engine/capabilities/llm-gateway/evals changes, package/lock/config/CI/guard changes or external provider/adapter.
- No formal knowledge/profile/eval write, no customer LLM, no production Redis/worker deployment, no alert delivery, no M6, no GA-0, no real customer/order data and no 1.0 release claim.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 accepted claim.

## 验收映射

| Item | M5-03 status | Notes |
|---|---|---|
| H-02 | `api_contract_supported_not_closed` | API decisions require human approve/edit/discard/block and return `formalWrite: false`; actual formal write pipeline/admin confirmation remains future. |
| H-03 | `api_contract_supported_not_closed` | Conflict candidates expose diff payload and require diff presence before approve/edit; side-by-side admin E2E remains M5-04. |
| H-07 | `unchanged_not_closed` | Distill guardrails remain M5-02/M5-04/M5-06 scope; this slice only consumes candidate contract assumptions. |
| I-02 | `api_contract_supported_not_closed` | API enables mobile fallback pass/discard later; mobile UI/E2E remains M5-04. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-03 only; M5 closeout and release checklist remain future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-03. |
| K-04 | `active` | Worktree/branch and touch list are scoped; DB schema and global serial points remain untouched. |

M5-03 closes no production acceptance item. It only provides an API contract shell for later M5 admin/runtime slices.
