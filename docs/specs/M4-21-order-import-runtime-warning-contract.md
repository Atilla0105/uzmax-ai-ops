# M4-21 Order Import Runtime Warning Contract

## 目标

为 ADR-B02 no-API 分支补齐 E-03 的最小 runtime warning contract：`/order-import/snapshots/search` 在 stale/missing/degraded handoff 结果上附带显式 `runtimeWarning` envelope，admin API client 必须校验该 warning 与 `reasonCode`、`queryLogDraft` 和 `customerVisible` 一致，并拒绝缺失、错配或 fresh 结果误带 warning 的 payload。本 spec 不实现真实 DB runtime、admin visible E2E、AI runtime/eval、外部订单 API、真实导入样例或生产发布。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只把 E-03 的 API/admin client warning contract 固化为 M4 foundation，不代表过期样例 E2E、生产 DB runtime、真实导入队列、admin 实时页面、AI 行为红线或 1.0 验收关闭。Owner 仍负责真实订单/客户数据、导入样例、生产配置、外部 API 资料、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-21-order-import-runtime-warning` / `codex/m4-21-order-import-runtime-warning` 执行；复核 no external order API、no `order_connector`、no raw customer/order data、runtime warning fail-closed、fresh path no warning、admin-only client boundary、PR hygiene、worker boundary evidence 和 M4/contracts evidence 同步。

## 时间盒

0.5 个工作日。若 runtime warning contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带 DB wiring、queue runtime、admin E2E、AI eval/runtime、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-21-order-import-runtime-warning-contract.md`
  - `docs/evidence/M4/M4-21-order-import-runtime-warning-contract.md`
  - `docs/evidence/M4/README.md`
  - `docs/contracts/README.md`
  - `apps/api/src/order-import.service.ts`
  - `apps/admin/src/orderImportApiClient.ts`
  - `scripts/tests/m4-order-import-runtime-warning-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/**`、`apps/worker/**`、`packages/engine/**`、`packages/llm-gateway/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 180、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README 和 contracts README；不改 DB schema/migration/generated client、worker queue、admin visible UI、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。`rg -n "runtimeWarning|warningCode|staleSnapshotUsed|searchSnapshot|snapshotResult|order_snapshot_stale" apps/api/src apps/admin/src packages/capabilities/order-read/src scripts/tests docs/specs docs/evidence/M4` 显示 M4-05/M4-07/M4-13 已有 stale handoff 与 warningCode/fail-closed foundation，但没有 API/admin client `runtimeWarning` envelope，因此就地扩展 `apps/api/src/order-import.service.ts` 与 `apps/admin/src/orderImportApiClient.ts`。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` remains absent。
- 是否需要例外：无。

## 文档触发检查

updated

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-05/M4-07/M4-13 spec/evidence、v1.1 PRD REQ-T04、技术架构 §8、后台设计 §4.4、验收矩阵 E-02/E-03/E-04/I-01、现有 order import API/admin client tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- 基线：`npm ci` passed；`npm test` passed 218 tests。`npm audit` reported existing 3 high severity vulnerabilities, not introduced by this spec。
- Root/main full local worker boundary preflight is blocked by existing untracked duplicate docs in `/Users/atilla/Documents/UZMAX智能运营`:
  - `docs/adr/ADR-B02-order-api 2.md`
  - `docs/adr/README 2.md`
  - `docs/evidence/M4/README 2.md`
  - `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
  - `docs/specs/SPK-02-order-api 2.md`
- Because those files pre-existed this worker and may be user-retained local files, this spec does not delete them. Implementation uses absolute assigned worktree paths; CI-mode worker boundary and manual root tracked/index clean evidence are recorded.

## Worktree / branch 前置条件

- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-21-order-import-runtime-warning`；branch `codex/m4-21-order-import-runtime-warning`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-21-order-import-runtime-warning`
  - `git status --short --branch --untracked-files=no`: `## codex/m4-21-order-import-runtime-warning`
  - `git branch --show-current`: `codex/m4-21-order-import-runtime-warning`
- Worker boundary evidence:
  - Full local guard result: `root_untracked_duplicate_docs_block_full_local_preflight` for the five duplicate docs listed above.
  - `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-21-order-import-runtime-warning UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed assigned-worktree check.
  - Root tracked/index clean evidence: `git status --short --branch --untracked-files=no` -> `## main...origin/main`; `git diff --quiet` passed; `git diff --cached --quiet` passed; no root `.git/index.lock`.

## 并发派发证据

Single implementation worker. This spec touches both `apps/api` and `apps/admin` plus shared M4/contracts docs, so no parallel implementation worker is safe. Coordinator may dispatch read-only spec compliance and code quality reviewers after implementation because they do not write files.

## 事故与 closeout 记录

- Incident：none introduced by this spec execution at authoring time。
- Existing local blocker：root/main contains the five untracked duplicate docs listed in the preconditions; this blocks full local worker-boundary enforcement but was not written by this M4-21 worker.
- Closeout evidence target: `docs/evidence/M4/M4-21-order-import-runtime-warning-contract.md`。

## 实施步骤

1. In `apps/api/src/order-import.service.ts`, wrap `evaluateOrderSnapshotForRead` so `handoff_required` results include `runtimeWarning` with code, reason message ref, handoff flag, stale flag and source/update/expiry metadata; fresh results must not include warning。
2. In `apps/admin/src/orderImportApiClient.ts`, require `runtimeWarning` for handoff responses and reject mismatched code, handoff flag, stale flag, source/update/expiry metadata, status refs on handoff, or warning on fresh results。
3. Add focused Node test covering fresh/stale/missing API results, admin happy path and fail-closed malformed warning cases。
4. Update M4 evidence README and contracts README without claiming E-03/E-04/I-01 closeout。
5. Run focused and related tests, full validation, spec compliance review, code quality review, PR hygiene, CI, merge and cleanup。

## 通过条件

- Stale/missing/degraded handoff results include a deterministic `runtimeWarning` envelope。
- Fresh `snapshot_ready` results do not include `runtimeWarning`。
- Admin client rejects handoff results without warning, warning/reason mismatch, warning/queryLog stale mismatch, warning/customerVisible metadata mismatch, status ref exposure on handoff, or warning attached to fresh result。
- No external order API, `order_connector`, DB runtime, queue runtime, env read, default real network call, LLM/provider, raw sample or production connector is added。
- Evidence records root untracked duplicate-doc blocker and distinguishes it from this worker’s assigned worktree changes。

## 失败分支

- 若需要 DB repository/default provider wiring、Prisma schema/migration、worker queue/runtime、admin visible E2E、TanStack Query runtime、file upload/download、real import files、AI eval/runtime 或 external order API：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets、screenshots 或 CSV/XLSX exports：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 stale/missing/degraded path 输出订单状态或让 LLM 判断状态：不得合并，修正为 handoff/fail-closed。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration/generated client、DB runtime/default provider、worker queue、admin visible UI wiring、AI runtime/eval、feature flag、production config 或 real CSV/XLSX import。
- 不读取 `process.env`，不默认调用 `global fetch`，不连接或写入真实数据库。
- 不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不删除 root/main 中既有未跟踪 duplicate docs；后续若 owner 确认可清理，应单独 cleanup。
- 不关闭 E-02/E-03/E-04/I-01 的生产 DB/runtime、queue/admin E2E、真实导入样例、AI runtime/eval 或 release acceptance。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `runtime_warning_contract_supported_not_closed` | Keeps import snapshot as current main path and only strengthens snapshot search handoff response contract; runtime DB/queue/admin E2E remains future scope. |
| E-03 | `runtime_warning_contract_supported_not_closed` | API handoff results now carry a runtime warning envelope and admin client validates it fail-closed; persisted warning, real DB/runtime and E2E stale sample evidence remain future scope. |
| E-04 | `foundation_supported_not_closed` | Warning contract reinforces no fabricated status on stale/missing/degraded reads; AI eval/runtime integration remains future scope. |
| I-01 | `partial_admin_client_not_closed` | Admin client can enforce the warning contract; full desktop core workflow with runtime data remains future scope. |
