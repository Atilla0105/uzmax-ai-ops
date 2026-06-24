# M5-05 AI Member Console

## 目标

Implement one scoped frontend/local-contract slice for the M5 AI member console: AI member status, capability toggles, manual offline, breaker offline reason, emergency stop/recovery local drafts with audit evidence, and mobile emergency fallback.

This slice is synthetic/local on the admin page. It must not call API/DB/runtime, must not perform formal production writes, and must keep M5 `not_accepted`.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: confirm this PR is only the M5-05 frontend/local-contract slice. It does not close M5, I-02/I-07 production acceptance, GA-0, production readiness, real customer/order data, customer LLM, LLM keys, cost, compliance or 1.0 release decisions.

AI agent: implement only the allowlisted docs/admin/test files in the assigned worktree, keep AI member actions local and confirmation-gated, reject unsafe refs/raw data, record evidence and validation, and keep M5 not accepted.

## 时间盒

0.5 个工作日. If changed source files exceed 4, net source LOC exceeds 600, new source files exceed 3, or meaningful implementation requires API/DB/runtime writes, stop and report `BLOCKED` with a smaller split.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5-05-ai-member-console.md`
  - `docs/evidence/M5/M5-05-ai-member-console.md`
  - `docs/evidence/M5/README.md`
  - `docs/incidents/INC-2026-06-24-m5-05-root-patch-target.md`
  - `apps/admin/src/M5AiMemberConsoleShell.tsx`
  - `apps/admin/src/aiMemberConsoleContracts.ts`
  - `apps/admin/src/m5-ai-member-console-shell.css`
  - `apps/admin/src/App.tsx`
  - `apps/admin/tests/m5-ai-member-console.spec.ts`
  - `scripts/tests/m5-ai-member-console.test.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only for this worker.
  - This slice must not touch `apps/api/**`, `packages/db/**`, `packages/distill/**`, `apps/worker/**`, `apps/cron/**`, `packages/engine/**`, `packages/capabilities/**`, `packages/llm-gateway/**`, `packages/evals/**`, package/lock/config/CI/guard files, raw samples, generated artifacts or production/release gates.

## 变更预算与路径分类

- source budget target: changed source files <= 4, net source LOC <= 600, new source files <= 3.
- docs: this spec, M5-05 evidence, M5 evidence README, one required incident record for the root patch-target boundary event detected during this slice.
- source: `apps/admin/src/M5AiMemberConsoleShell.tsx`, `apps/admin/src/aiMemberConsoleContracts.ts`, `apps/admin/src/m5-ai-member-console-shell.css`, `apps/admin/src/App.tsx`.
- test: `apps/admin/tests/m5-ai-member-console.spec.ts`, `scripts/tests/m5-ai-member-console.test.mjs`.
- generated/lock/config/API/DB/distill/worker/cron/engine/capabilities/llm-gateway/evals/raw samples/external provider/adapter: none.
- New source `rg` conclusion: searched `AiMember`, `AI member`, `AI 成员`, `ai member`, `capability toggle`, `aiCapability`, `emergency stop`, `manual offline`, `breaker offline`, `breakerReason`, `recover_online`, `toggle_capability` and `M5-05` under `apps/admin/src`, `apps/admin/tests`, `scripts/tests`, `docs/specs`, `docs/evidence/M5` and `packages/db/src`. Existing implementation is limited to M5-01 DB contract vocabulary, M5-00/M5 evidence planning, and admin confirmation queue patterns. No AI member console shell or local admin contract exists, so new source belongs under `apps/admin/src/aiMemberConsoleContracts.ts` and `apps/admin/src/M5AiMemberConsoleShell.tsx`, with a feature CSS file matching current M5 admin shell conventions.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API, SDK, provider, connector or adapter and performs no external call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M5-00-operations-loop-readiness-pack.md`, `docs/evidence/M5/README.md`, `docs/evidence/M5/M5-01-db-contract-foundation.md`, `packages/db/src/m5-operations-contracts.ts`, `apps/admin/src/App.tsx`, `apps/admin/src/M5ConfirmationQueueShell.tsx`, `apps/admin/tests/m5-confirmation-queue.spec.ts`, `scripts/tests/m5-operations-db-contracts-foundation.test.mjs`, relevant v1.1 PRD/backoffice/technical/acceptance sections and existing M5 admin patterns before implementation.
- Worktree must be `/Users/atilla/Documents/uzmax-m5-05-ai-member-console`.
- Branch must be `codex/m5-05-ai-member-console`.
- Do not write to `/Users/atilla/Documents/UZMAX智能运营` root/main checkout.
- Start audit must be recorded in `docs/evidence/M5/M5-05-ai-member-console.md` before source/test implementation edits.
- `apps/api`, `packages/db`, `packages/distill`, worker/cron/runtime, lockfile, shared config, CI/guards, generated artifacts and production/release gates are outside this slice.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5-05-ai-member-console` |
| branch | `codex/m5-05-ai-member-console` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | read-only audit only |

## 并发派发证据

Single active writing worker for this spec. Touch list is distinct from M5-03 API, M5-04 confirmation queue files, DB schema/migrations, lockfile, shared config, CI/guard scripts, generated artifacts and release/production gates. It touches shared `apps/admin/src/App.tsx` and adds a focused Playwright file, so any parallel admin-shell worker touching those files must wait or show explicit non-overlap in evidence. Physical worktree and branch are distinct from root/main.

## 事故与 closeout 记录

- Incident: `docs/incidents/INC-2026-06-24-m5-05-root-patch-target.md` records and cleans up an initial worker patch-target error where this slice's first docs/source patch landed in root/main before being transferred to the assigned worktree and removed from root.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- M5 closeout is not in this slice; later M5-08 or owner evidence must decide milestone acceptance.

## 实施步骤

1. Record start audit evidence for worker/root/GitHub state.
2. Add pure local `aiMemberConsoleContracts.ts` for allowed statuses, capability keys and local action draft validation.
3. Ensure local action drafts for `emergency_stop`, `manual_offline`, `recover_online` and `toggle_capability` always return `formalRuntimeWrite: false`, use controlled `auditRef`/`reasonRef`, require owner confirmation for emergency/recovery, and reject unsafe refs/raw fields.
4. Add `M5AiMemberConsoleShell` using synthetic local state only: tenant name, member status, active version/persona refs, breaker reason ref, capability toggles, manual offline, emergency stop and recovery draft.
5. Wire the shell into `apps/admin/src/App.tsx` after `M5ConfirmationQueueShell` and before release readiness.
6. Add focused Playwright coverage for desktop status/toggles/breaker reason/emergency stop/recovery draft/disabled confirm and mobile 320px emergency fallback/no horizontal overflow.
7. Add focused Node tests for contract fail-closed cases, docs/status/scope, no backend imports, no runtime fetch, no sensitive raw data and source allowlist/budget expectations.
8. Update M5 evidence README and M5-05 evidence without marking M5 accepted.
9. Run required validation and record results.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, scope, boundaries, no sensitive data statement, acceptance mapping, validation and spec/code review result or placeholders.
- Local contract accepts only statuses `online`, `manual_offline`, `breaker_offline`, `disabled`.
- Local contract accepts only capability keys `business_draft`, `order_read`, `quote`, `tutorial`, `vision`.
- Local action drafts support only `emergency_stop`, `manual_offline`, `recover_online`, `toggle_capability`.
- Local action drafts always return `formalRuntimeWrite: false`.
- Emergency stop and recovery drafts return `requiresOwnerConfirmation: true`.
- `auditRef` and `reasonRef` must be controlled refs; raw/prompt/customer/order/phone/payment/secret/url/base64-ish/unsafe refs fail closed.
- Visible shell performs no real network calls and uses only synthetic local state.
- Visible shell displays tenant name, member status, active version/persona ref, breaker reason ref and capability toggles.
- Visible shell supports local manual offline, emergency stop, draft recovery and local capability toggle.
- Confirm recovery/production action remains disabled.
- Mobile/narrow viewport exposes emergency stop/recovery fallback without full complex editing and has no horizontal overflow at 320px.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 4, net source LOC <= 600, new source files <= 3.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If source budget exceeds target: stop and report `BLOCKED` with proposed split.
- If tests require API/DB/distill/worker/cron/runtime formal writes, provider calls, real customer/order data, raw exports or production behavior: stop and split to later M5 specs.
- If mobile full AI member editing is required for acceptance: stop and split because v1.1 only requires mobile emergency fallback.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop and clean up before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No `apps/api/**`, `packages/db/**`, `packages/distill/**`, `apps/worker/**`, `apps/cron/**`, `packages/engine/**`, `packages/capabilities/**`, `packages/llm-gateway/**`, `packages/evals/**`, package/lock/config/CI/guard changes.
- No DB/Prisma runtime, formal audit write, formal status write, formal capability write, production AI persona release, provider/LLM call, alert delivery, production Redis/worker deployment, M6, GA-0, real customer/order data or 1.0 release claim.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 accepted claim.

## 验收映射

| Item | M5-05 status | Notes |
|---|---|---|
| I-02 | `supported_not_closed` | Mobile fallback exposes emergency stop/recovery local drafts; production mobile emergency path remains future runtime/integration evidence. |
| I-07 | `supported_not_closed` | AI member state/action audit refs and local drafts are visible; persisted audit/log center readback remains M5-06/future integration. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-05 only; M5 closeout and release checklist remain future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-05. |
| K-04 | `active` | Worktree/branch and touch list are scoped; DB schema and global serial points are untouched. |

M5-05 closes no production acceptance item. It only provides the frontend/local-contract shell for later M5 runtime and closeout slices.
