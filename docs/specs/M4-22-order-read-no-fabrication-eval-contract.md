# M4-22 Order-Read No-Fabrication Eval Contract

## 目标

为 ADR-B02 no-API 分支补齐 E-04 的最小 AI order-read 评测契约：在 `packages/evals` 中新增纯函数，评估 order-read 候选输出是否在无订单、过期快照或导入主路径降级时转人工，且不暴露或编造订单/物流状态；fresh snapshot 只允许输出受控状态 ref。本 spec 不实现 AI runtime、engine integration、provider judge、真实 eval fixtures、DB schema、外部订单 API、订单导入 runtime 或生产发布。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只把 E-04 的 no-fabrication eval contract 固化为 M4 foundation，不代表 AI runtime、真实订单问答样例、provider judge、production eval gate、订单导入 E2E、1.0 验收或发布关闭。Owner 仍负责真实订单/客户数据、评测样本、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-22-order-read-no-fabrication-eval` / `codex/m4-22-order-read-no-fabrication-eval` 执行；复核 no external order API、no `order_connector`、no raw customer/order data、no DB/schema/runtime/provider call、handoff fail-closed、fresh controlled status ref、PR hygiene、worker boundary evidence 和 M4/evals evidence 同步。

## 时间盒

0.5 个工作日。若 no-fabrication eval contract 无法在预算内通过 focused Node test、type/lint/guard/check validation，则关闭或拆小；不得夹带 AI runtime、engine/admin/API/worker integration、DB schema、真实样例、provider judge 或外部订单 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-22-order-read-no-fabrication-eval-contract.md`
  - `docs/evidence/M4/M4-22-order-read-no-fabrication-eval-contract.md`
  - `docs/evidence/M4/README.md`
  - `docs/evals/README.md`
  - `packages/evals/src/index.ts`
  - `packages/evals/src/m4-order-read-no-fabrication.ts`
  - `scripts/tests/eval-gate.test.mjs`
  - `scripts/tests/m3-eval-gate-redline-runner.test.mjs`
  - `scripts/tests/m4-order-read-no-fabrication-eval-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/**`、`packages/capabilities/**`、`apps/**`、`packages/engine/**`、`packages/llm-gateway/**`、package/lock/config、generated/dist、真实 eval fixtures、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 240、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；更新 2 个既有 eval loader 以支持 `packages/evals/src/index.ts` 的本地 TS re-export；新增 spec/evidence；同步 M4 evidence README 和 evals README；不改 DB schema/migration/generated client、worker queue、admin/API runtime、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "m3Eval|Eval|redline|degradation|fabricat|order|handoff|safe payload|payload" packages/evals/src scripts/tests docs/specs docs/evidence/M4 docs/evals` 显示 M3-03 已在 `packages/evals/src/index.ts` 中提供 pure eval gate/redline foundation，M4 order-read no-fabrication 仍缺 eval contract。初版就地扩展 `packages/evals/src/index.ts` 会使该文件超过 400 行 lint 上限；因此新增 scoped `packages/evals/src/m4-order-read-no-fabrication.ts` 并由 index re-export，避免新增平行实现或破坏包出口。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` remains absent。
- 是否需要例外：无。

## 文档触发检查

updated

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-05/M4-21 spec/evidence、M3-03 spec/evidence、`docs/evals/README.md`、v1.1 PRD REQ-T04/REQ-T07/NG-06、技术架构 §8/§12、后台设计 §4.4、验收矩阵 E-02/E-03/E-04/I-01、现有 `packages/evals` 与 order-read focused tests。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- 基线：`npm ci` passed；`npm test` passed 222 tests。`npm audit` reported existing 3 high severity vulnerabilities, not introduced by this spec。
- Root/main full local worker boundary preflight is blocked by existing untracked duplicate docs in `/Users/atilla/Documents/UZMAX智能运营`:
  - `docs/adr/ADR-B02-order-api 2.md`
  - `docs/adr/README 2.md`
  - `docs/evidence/M4/README 2.md`
  - `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
  - `docs/specs/SPK-02-order-api 2.md`
- Because those files pre-existed this worker and may be user-retained local files, this spec does not delete them. Implementation uses absolute assigned worktree paths; CI-mode worker boundary and manual root tracked/index clean evidence are recorded.

## Worktree / branch 前置条件

- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-22-order-read-no-fabrication-eval`；branch `codex/m4-22-order-read-no-fabrication-eval`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-22-order-read-no-fabrication-eval`
  - `git status --short --branch --untracked-files=no`: `## codex/m4-22-order-read-no-fabrication-eval`
  - `git branch --show-current`: `codex/m4-22-order-read-no-fabrication-eval`
  - `HEAD`: `11307fdaf4337e0671fa80665b0584911ead7ab9`
- Worker boundary evidence:
  - Full local guard result: `root_untracked_duplicate_docs_block_full_local_preflight` for the five duplicate docs listed above.
  - `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-22-order-read-no-fabrication-eval UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed assigned-worktree check.
  - Root tracked/index clean evidence: `git status --short --branch --untracked-files=no` -> `## main...origin/main`; `git diff --quiet` passed; `git diff --cached --quiet` passed; no root `.git/index.lock`.

## 并发派发证据

Single implementation worker. This spec touches shared `packages/evals/src/index.ts` and shared M4/evals evidence docs, so no parallel implementation worker is safe. Coordinator may dispatch read-only spec compliance and code quality reviewers after implementation because they do not write files.

## 事故与 closeout 记录

- Incident：none introduced by this spec execution at authoring time。
- Existing local blocker：root/main contains the five untracked duplicate docs listed in the preconditions; this blocks full local worker-boundary enforcement but was not written by this M4-22 worker.
- Closeout evidence target: `docs/evidence/M4/M4-22-order-read-no-fabrication-eval-contract.md`。

## 实施步骤

1. In `packages/evals/src/m4-order-read-no-fabrication.ts` and the index re-export, add pure M4 order-read no-fabrication eval constants and `evaluateM4OrderReadNoFabrication` using controlled refs and safe M3 eval payload summaries.
2. Handoff-required cases (`order_snapshot_missing`, `order_snapshot_stale`, `order_data_degraded`) must require handoff output and fail when a candidate exposes order or logistics status refs.
3. Fresh snapshot cases (`snapshot_fresh`) must require snapshot summary output with a controlled status ref and no handoff.
4. Add focused Node test covering package boundary, pass/fail semantics, safe summaries, raw-field rejection and M4/evals docs evidence.
5. Update M4 evidence README and evals README without claiming E-04 runtime or production gate closeout.
6. Run focused and related tests, full validation, spec compliance review, code quality review, PR hygiene, CI, merge and cleanup.

## 通过条件

- `packages/evals` remains pure and does not import DB, order-read capability, engine, apps, LLM gateway, provider SDKs, env, network or external order API.
- Existing eval focused tests still load `packages/evals/src/index.ts` successfully through the local TS re-export.
- Missing/stale/degraded order-read cases fail closed unless the candidate is `handoff`, `handoffRequired: true`, and contains no order/logistics status ref.
- Fresh snapshot cases pass only when the candidate is `order_snapshot_summary`, `handoffRequired: false`, and carries a controlled order status ref.
- Safe summaries expose only aggregate reason codes, category, controlled refs and M3-compatible redacted payload/redline summary; no raw prompt/completion/customer/order text enters git.
- Focused test covers no-API/no-raw/no-runtime boundary and M4-22 evidence wording.

## 失败分支

- 若需要 AI runtime、provider judge、LLM key/env、real eval fixtures、raw prompt/completion、真实订单问答样例、engine/API/admin/worker integration、DB schema/migration、persistence 或 production eval gate：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets、screenshots、CSV/XLSX exports、raw prompts 或 raw completions：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 stale/missing/degraded path 输出订单/物流状态或让 LLM 判断状态：不得合并，修正为 handoff/fail-closed。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration/generated client、DB runtime/default provider、worker queue、admin/API visible UI wiring、AI runtime、provider judge、feature flag、production config 或 real CSV/XLSX import。
- 不读取 `process.env`，不默认调用 `global fetch`，不连接或写入真实数据库。
- 不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不删除 root/main 中既有未跟踪 duplicate docs；后续若 owner 确认可清理，应单独 cleanup。
- 不关闭 E-02/E-03/E-04/I-01 的生产 DB/runtime、queue/admin E2E、真实导入样例、AI runtime integration、production eval gate 或 release acceptance。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `eval_contract_supported_not_closed` | Keeps import snapshot as current main path and only evaluates candidate order-read behavior; import runtime/admin E2E remains future scope. |
| E-03 | `eval_contract_supported_not_closed` | Stale cases in the eval contract must hand off without status exposure; persisted warning, real DB/runtime and E2E stale sample evidence remain future scope. |
| E-04 | `eval_contract_supported_not_closed` | Adds pure no-fabrication eval contract for missing/stale/degraded order-read candidates; AI runtime integration, real fixtures and production gate remain future scope. |
| I-01 | `partial_eval_contract_not_closed` | Eval package can validate order-read candidate behavior; full desktop order/customer workflow with runtime data remains future scope. |
