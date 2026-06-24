# M5-02 Distill Guardrails

## 目标

Implement one small M5 distill behavior-contract slice in `packages/distill`: daily candidate cap 10, deterministic candidate truncation audit refs, 7-day pass-rate summary, low-pass-rate downshift recommendation, owner alert draft contract and manual recovery audit contract.

This slice only adds pure contract helpers and focused tests. It does not implement runtime scheduler/cron/worker/API/admin integration, DB clients, provider calls, formal knowledge/profile/eval writes, alert delivery, mobile UI or production behavior.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: confirm this PR is only an M5 behavior-contract foundation slice and does not close M5, H-07 E2E, GA-0, production readiness, customer-data, customer-LLM, LLM key, cost, compliance or 1.0 release decisions.

AI agent: implement only the allowlisted distill source/test/docs files in the assigned worktree, preserve the M5-01 controlled-ref and no-raw-payload boundary, record evidence, validate source budget, and keep H-02/H-03/H-07/I-02/I-06/J-05 as foundation/behavior-contract rather than accepted.

## 时间盒

0.4 个工作日. If `packages/distill/src/index.ts` cannot stay within changed source files <= 1 and net source LOC <= 250, stop and report `BLOCKED` with a smaller split.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5-02-distill-guardrails.md`
  - `docs/evidence/M5/M5-02-distill-guardrails.md`
  - `docs/evidence/M5/README.md`
  - `docs/contracts/README.md`
  - `packages/distill/src/index.ts`
  - `scripts/tests/m5-distill-guardrails.test.mjs`
- 说明/备注：
  - This worker must not touch `packages/db/**`, migrations/schema/generated client, apps/api/admin/worker/cron, packages/engine/capabilities/llm-gateway/evals, package.json/package-lock, CI/guards/config, raw samples, external API/provider/adapter, production/release docs outside this allowlist.
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only for this worker.

## 变更预算与路径分类

- source budget target: changed source files <= 1, net source LOC <= 250, new source files <= 0.
- docs: this spec, M5-02 evidence, M5 evidence README, contracts README only if needed.
- source: `packages/distill/src/index.ts`.
- test: `scripts/tests/m5-distill-guardrails.test.mjs`.
- generated/lock/config/apps/admin/api/worker/cron/engine/capabilities/llm-gateway/evals/raw samples/external provider/adapter: none.
- New source `rg` conclusion: searched `m5Distill`, `distill guardrails`, `candidate cap`, `sevenDayPassRate`, `pass rate`, `downshift`, `owner alert`, `manual recovery` and `distill` under `packages/distill`, `packages/db/src`, `docs/specs`, `docs/evidence/M5`, `docs/contracts` and `scripts/tests`. Existing distill source is only `packages/distill/src/index.ts` with package name export; M5-01 DB contracts provide related persistence vocabulary. No new source file is needed; the correct home is extending `packages/distill/src/index.ts`.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API/provider/connector/adapter and performs no provider call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M5-00-operations-loop-readiness-pack.md`, `docs/specs/M5-01-db-contract-foundation.md`, `docs/evidence/M5/README.md`, `docs/evidence/M5/M5-01-db-contract-foundation.md`, relevant v1.1 PRD/architecture/backend/acceptance sections and existing distill/DB contract patterns before implementation.
- Worktree must be `/Users/atilla/Documents/uzmax-m5-02-distill-guardrails`.
- Branch must be `codex/m5-02-distill-guardrails`.
- Do not write to `/Users/atilla/Documents/UZMAX智能运营` root/main checkout.
- Start audit must be recorded in `docs/evidence/M5/M5-02-distill-guardrails.md` before source/test/docs implementation edits.
- `packages/db` schema/migration, lockfile, shared config, CI/guards, generated client, runtime worker/cron/API/admin and production/release gates are outside this slice.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5-02-distill-guardrails` |
| branch | `codex/m5-02-distill-guardrails` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | read-only audit only |

## 并发派发证据

Single active writing worker for this spec. Touch list is disjoint from M5-01 DB schema/migration files and does not touch global serial points. Physical worktree and branch are distinct from root/main. Any worker touching distill scheduler/worker/cron/API/admin shared paths must wait for a separate scoped spec because this slice only owns pure `packages/distill` contracts.

## 事故与 closeout 记录

- Incident: none at start.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- M5 closeout is not in this slice; later M5-08 or owner evidence must decide milestone acceptance.

## 实施步骤

1. Record start audit evidence for worker/root/GitHub state.
2. Add pure distill helpers for candidate cap/truncation, pass-rate summary, downshift recommendation, owner alert draft and manual recovery audit contract.
3. Add focused Node test covering success paths, validation failures, unsafe ref/raw key rejection and docs/evidence status.
4. Update M5 README and contracts README minimally without marking M5 accepted.
5. Run required validation and commit if all checks pass.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, scope, validation, acceptance mapping, boundaries and no sensitive data statement.
- Candidate selection sorts by confidence descending and then deterministic tie-breaker, accepts at most 10 candidates and returns truncated count plus truncated audit refs.
- 7-day summary computes pass rate in basis points from daily counts, rejects negative counts and rejects `approved + discarded > candidate_count`.
- 3 consecutive days below 40% returns a weekly downshift recommendation; otherwise preserves `daily`; explicit `paused` input remains paused without auto recovery.
- Owner alert draft/audit requirement is structured and uses controlled refs only; it rejects raw customer/prompt/completion payload carriers, unsafe refs, URL/data/blob/file refs and base64-ish inline refs.
- Manual recovery returns an audit contract only, requires controlled audit ref/actor ref, and does not write runtime state.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 1, net source LOC <= 250, new source files <= 0.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If source net LOC exceeds 250 or new source files become necessary: stop and report `BLOCKED` with proposed split.
- If tests require API/admin/worker/runtime scheduler/cron, DB client writes, provider calls, formal writes or UI behavior: stop and split to later M5 specs.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop and clean up before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No API/admin/worker/runtime scheduler/cron integration, DB client, migration/schema/generated client, formal knowledge/profile/eval write, alert delivery, analytics export, mobile UI, production Redis/worker deployment or release gate behavior.
- No package.json/package-lock, apps, admin, api, worker, cron, engine, capabilities, llm-gateway, evals, CI, guards, config, raw samples, external API/provider/adapter or production/release docs outside the allowlist.
- No real customer/order data, customer LLM, raw/export/jsonl/csv, screenshots, voice transcripts, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 accepted claim.

## 验收映射

| Item | M5-02 status | Notes |
|---|---|---|
| H-02 | `behavior_contract_supported_not_closed` | Candidate refs are contract-only and no formal write path exists; API/admin/runtime confirmation proof remains M5-03/M5-04. |
| H-03 | `queued_not_closed` | Conflict diff enforcement remains future M5-03/M5-04. |
| H-07 | `behavior_contract_supported_not_closed` | Cap, pass rate, downshift recommendation, owner alert draft and manual recovery audit requirement are covered as pure contracts; persisted scheduler/UI/E2E/audit writes remain future. |
| I-02 | `queued_not_closed` | Mobile alert/confirmation fallback remains future. |
| I-06 | `queued_not_closed` | Pass-rate summary can feed analytics later; fixed board/export remains M5-06. |
| J-05 | `foundation_evidence_added_not_closed` | M5-02 evidence is archived now; M5 closeout and release checklist remain future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-02. |
| K-04 | `active` | Worktree/branch and touch list are scoped and do not touch global serial points. |

M5-02 closes no production acceptance item. It only provides behavior-contract guardrails for later M5 operations-loop runtime and UI slices.
