# M4-44 Order-Read Runtime Eval Gate

## 目标

把 M4-05/M4-21/M4-22 的 order-read runtime result、runtime warning envelope 和 no-fabrication eval contract 串成一个最小可验收闭环：真实 `OrderImportService.searchSnapshot` / `packages/capabilities/order-read` 输出的 fresh、stale、missing、degraded synthetic cases 可以被转换为 M4-22 eval candidate，并由 `evaluateM4OrderReadNoFabrication` 证明不会在 handoff 场景暴露或编造订单/物流状态。

本 spec 只做受控 runtime-to-eval bridge 和 focused smoke evidence；不得把 `packages/evals` 接入生产 API 请求链路，不调用 LLM/provider，不新增真实 eval fixtures，不使用真实订单/客户数据，不关闭 M4-45 queue/security/closeout。

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认本切片只使用 synthetic controlled refs，不提交真实订单号、物流号、客户明文、电话、地址、支付、截图、CSV/XLSX/export、LLM prompt/completion、credentials 或 env。Owner 仍负责真实 eval 样本、生产 LLM/provider key、成本、合规风险和最终 M4 closeout 签收。

AI agent：负责在指定 worktree/branch 内实现本 spec；必须优先复用现有 order-read capability、OrderImportService、M4-22 eval contract 和已有 smoke/test patterns；必须证明 `packages/evals` 没有进入 API production request path；必须维护 no raw data、no external order API、no provider call、handoff fail-closed、PR Hygiene、worker boundary 和 M4/evals evidence。

## 时间盒

0.5 个工作日。若无法在预算内形成 runtime output -> eval candidate -> no-fabrication pass/fail evidence，不继续扩大到 LLM/provider、真实 fixtures、DB schema、queue/security 或 production gate；记录 blocker 并拆后续 spec。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-44-order-read-runtime-eval-gate.md`
  - `docs/evidence/M4/M4-44-order-read-runtime-eval-gate.md`
  - `docs/evidence/M4/README.md`
  - `docs/evals/README.md`
  - `packages/capabilities/order-read/src/index.ts`
  - `scripts/tests/m4-order-read-runtime-eval-gate.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得修改 `packages/evals/**` 的 M4-22 evaluator 语义，除非是文档或导出兼容修复；不得触碰 `packages/db/**`、`apps/api/src/order-import.service.ts`、`apps/admin/**`、`apps/worker/**`、DB schema/migration/generated client、package/lock/config、CI workflow、真实 fixtures 或外部 connector。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 180、new source files <= 0。
- path classification:
  - source: `packages/capabilities/order-read/src/index.ts`
  - test: `scripts/tests/m4-order-read-runtime-eval-gate.test.mjs`
  - docs: `docs/specs/M4-44-order-read-runtime-eval-gate.md`, `docs/evidence/M4/M4-44-order-read-runtime-eval-gate.md`, `docs/evidence/M4/README.md`, `docs/evals/README.md`
  - generated: none
  - lock: none
  - config: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `evaluateOrderSnapshotForRead`, `OrderImportService`, `evaluateM4OrderReadNoFabrication`, `runtimeWarning`, `handoffRequired`, `orderStatusRef`, `order_snapshot_stale`, `order_snapshot_missing` 于 `packages/capabilities/order-read`, `packages/evals`, `apps/api/src`, `scripts/tests`, `docs/evidence/M4`, `docs/evals`。现有归属已经存在：order-read runtime shape 在 `packages/capabilities/order-read/src/index.ts`，no-fabrication evaluator 在 `packages/evals/src/m4-order-read-no-fabrication.ts`，API service 在 `apps/api/src/order-import.service.ts`。本 spec 只允许在 order-read capability 内新增 safe candidate builder；不得新增平行 order-read/eval implementation。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` remains absent。
- 是否需要例外：默认无。若 source budget 超出、需改 eval evaluator、API service、CI、lockfile 或 package metadata，停止并拆 spec 或在 PR Hygiene 中声明 owner approval 所需例外。

## 文档触发检查

- 结果：updated。
- 判断依据：`docs/doc-gates.md`；本 slice 更新 M4/evals evidence，不新增真实 eval fixtures、OpenAPI/generated DTO、production runbook、release workflow 或 external connector docs。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/evals/README.md`、`docs/contracts/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-21/M4-22/M4-42/M4-43 spec/evidence、v1.1 PRD REQ-T04/REQ-T07/NG-06、技术架构 §2.1/§8/§12、后台设计 §4.4、验收矩阵 E-02/E-03/E-04/I-01/J-02、现有 order-read/API/eval focused tests。
- Root/main 为 `9b22173 M4-43 customer asset runtime workflow (#104)`；root/main clean；open PR 为 `[]`；未合并分支为空。
- M4 evidence README 当前 E-04 为 `still_requires_m4_44_ai_order_read_runtime`，并明确 M4-44 scope 是 AI order-read runtime integration、real fixtures 和 production eval gate；本 spec 只关闭受控 runtime-to-eval bridge，不关闭真实 fixtures、provider judge 或 production gate。

## Worktree / branch 前置条件

- Worktree：`/Users/atilla/Documents/uzmax-m4-44-order-read-runtime-eval-gate`
- Branch：`codex/m4-44-order-read-runtime-eval-gate`
- 禁止写入 root/main checkout：`/Users/atilla/Documents/UZMAX智能运营`
- 开工记录：
  - `pwd=/Users/atilla/Documents/uzmax-m4-44-order-read-runtime-eval-gate`
  - `git status --short --branch=## codex/m4-44-order-read-runtime-eval-gate`
  - `git branch --show-current=codex/m4-44-order-read-runtime-eval-gate`

## 并发派发证据

本 spec 触碰 shared order-read capability、eval evidence 和 M4 evidence README，必须单 worker 串行；不得与 M4-45 queue/security/closeout、DB/schema/security/lockfile/release gate 切片并发写入。可派发只读 reviewer。

## 事故与 closeout 记录

- 本 spec 不触发新 incident。若发现写入越界、错分支、secret/customer-data 边界擦边、`packages/evals` 进入 production request path、真实数据进入 repo 或 gate 绕过，立即停止，记录 incident，并在 evidence 中列出影响、清理和控制。

## 实施步骤

1. 在 `packages/capabilities/order-read/src/index.ts` 中就地新增 safe candidate builder，把 `OrderReadResult` 转成 M4-22 evaluator 接受的 bounded candidate shape：fresh 只输出 `order_snapshot_summary` + controlled `orderStatusRef`；handoff/missing/stale/degraded 只输出 `handoff` + `handoffRequired: true`，不得暴露 order/logistics status refs。
2. 新增 focused test，使用真实 `evaluateOrderSnapshotForRead` 生成 fresh/stale/missing/degraded synthetic runtime outputs，再组合 M4-22 `evaluateM4OrderReadNoFabrication` 验证 pass/fail。
3. Focused test 必须同时证明 `apps/api/src/order-import.service.ts` 和 `packages/capabilities/order-read/src/index.ts` 没有 import `packages/evals`，且 `packages/evals` 没有进入 production request path。
4. 记录 M4/evals evidence：E-04 从 pure eval contract 推进到 controlled runtime-to-eval bridge；真实 eval fixtures、LLM/provider judge、production eval gate 和 M4 closeout 仍 future scope。
5. 运行 focused tests、full validation、spec compliance review、code quality review、CI、merge 和 cleanup。

## 通过条件

- `node --test scripts/tests/m4-order-read-runtime-eval-gate.test.mjs` 通过。
- 相关 focused tests 通过：`node --test scripts/tests/m4-order-read-import-snapshot-contract.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-read-no-fabrication-eval-contract.test.mjs scripts/tests/m4-order-read-runtime-eval-gate.test.mjs`。
- Runtime fresh/stale/missing/degraded synthetic cases 通过 M4-22 evaluator；stale/missing/degraded handoff candidate 不含 `orderStatusRef` / `logisticsStatusRef`；fresh candidate 只含 controlled `orderStatusRef`。
- Fabricated handoff candidate with status refs 仍被 evaluator 判为 failed。
- `packages/evals` 不被 `apps/api/src/order-import.service.ts` 或 `packages/capabilities/order-read/src/index.ts` import；无 LLM/provider/env/network/DB/connector runtime。
- `npm run format:check`、`npm run guard:prettier-ignore`、`npm run typecheck`、`npm run lint`、`npm run depcruise`、`npm run jscpd`、`npm run knip`、`npm run guard:forbidden-terms`、`npm run guard:eval-triggers`、`npm run guard:doc-triggers`、`npm run guard:workspace`、`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-44-order-read-runtime-eval-gate UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-44-order-read-runtime-eval-gate.md --include-worktree`、`npm test`、`npm run build`、`npm run size`、`npm run playwright` 通过。
- PR/evidence 报告 source 净增、changed source files、新增 source files、test/config/docs/lock 变更、gross churn、外部 API 依据、未关闭项和 M4-45 后续。

## 失败分支

- 若需要把 `packages/evals` import 到 API service、engine、worker 或 production request path：停止，不合并；改为离线 eval runner / smoke harness spec。
- 若需要 LLM/provider judge、real eval fixtures、raw prompt/completion、真实订单问答样例、DB schema/migration、queue/security、release gate 或 production eval gate：停止并拆后续 spec。
- 若 stale/missing/degraded path 输出订单/物流状态或让 LLM 判断状态：不得合并，修正为 handoff/fail-closed。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration/generated client、DB runtime/default provider、worker queue、admin/API visible UI wiring、LLM/provider judge、feature flag、production config、real eval fixtures 或 real CSV/XLSX import。
- 不读取 `process.env`，不默认调用 `global fetch`，不连接或写入真实数据库。
- 不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 M4-45 queue/security closeout、real BullMQ/Redis runtime、security dependency closeout、production eval gate、GA-0、1.0 release 或 final M4 signoff。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `runtime_eval_bridge_supported_not_new_import_runtime` | Reuses current import snapshot runtime outputs only; no new import runtime or real sample evidence. |
| E-03 | `runtime_eval_bridge_supported_not_persisted_warning_store` | Stale/missing runtime outputs must hand off without status refs before eval pass; persisted warning storage remains future scope. |
| E-04 | `order_read_runtime_eval_gate_supported_not_production_gate` | Runtime order-read outputs can be evaluated for no-fabrication; real fixtures, provider judge and production eval gate remain future scope. |
| I-01 | `partial_runtime_eval_bridge_not_full_desktop_core` | API/order-read runtime behavior is machine-evaluable; broader desktop core and formal production auth remain future scope. |
| J-02 | `still_requires_m4_45_queue_security_closeout` | No queue/security closeout changes. |
