# M4-05 Order-Read Import Snapshot Contract

## 目标

为 ADR-B02 no-API 分支交付 `packages/capabilities/order-read` 的最小纯合同：导入快照行校验、批次汇总、成功行快照 draft、错误行 draft、订单查询 fresh/stale/missing/degraded 判定与转人工决策。本 spec 不实现 DB repository、CSV/XLSX parser、admin UI、API endpoint、worker queue、外部订单 API connector 或真实订单数据接入。

## Owner

Owner：确认本切片只作为 E-02/E-03/E-04 的 pure capability foundation，不代表订单导入主路径 E2E、后台导入页、AI runtime 或 1.0 发布验收关闭。Owner 仍负责真实导入样例、字段映射、客户/订单数据、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-05-order-read-import-snapshot-contract` / `codex/m4-05-order-read-import-snapshot-contract` 执行；复核 no external order API、no `order_connector`、no DB schema/runtime/admin/API、no raw CSV/XLSX/order/customer data、stale snapshot handoff、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 pure order-read contract 无法在预算内通过 focused test、type/lint/guard/check validation，则关闭或拆小；不得夹带 admin/API/worker/DB schema/真实导入样例继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-05-order-read-import-snapshot-contract.md`
  - `docs/evidence/M4/M4-05-order-read-import-snapshot-contract.md`
  - `docs/evidence/M4/README.md`
  - `packages/capabilities/order-read/src/index.ts`
  - `scripts/tests/m4-order-read-import-snapshot-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `packages/db/**`、`apps/**`、`packages/engine/**`、`packages/llm-gateway/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 420、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、lockfile、config 或 app UI/API。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "order-read|order_snapshot|import_job|import_row_error|order_query_log|stale_snapshot|snapshot_stale|导入快照|订单快照|过期" packages/capabilities packages/db/src apps/api/src scripts/tests docs/specs docs/evidence/M4` 显示 `packages/capabilities/order-read/src/index.ts` 仅为空壳 `packageName`，M4-04 已提供 DB contracts，尚无 order-read pure import/stale/handoff contract；因此就地扩展既有 `packages/capabilities/order-read/src/index.ts`，不新增 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` remains absent.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 用 spec/evidence/M4 README 记录 pure contract，不新增 OpenAPI/generated DTO/runbook/production runtime。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/adr/ADR-B02-order-api.md`、`docs/evidence/M4/README.md`、M4-04 spec/evidence、v1.1 技术架构 §8、后台设计 §4.4、验收矩阵 E-02/E-03/E-04、现有 order-read package 和 capability test patterns。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-05-order-read-import-snapshot-contract`；branch `codex/m4-05-order-read-import-snapshot-contract`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-05-order-read-import-snapshot-contract`
  - `git status --short --branch`: `## codex/m4-05-order-read-import-snapshot-contract`
  - `git branch --show-current`: `codex/m4-05-order-read-import-snapshot-contract`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-05-order-read-import-snapshot-contract UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。本 branch 从 latest `main@e1f8331` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 就地扩展 `packages/capabilities/order-read/src/index.ts`，提供 import snapshot row/batch pure contract 和 order-read fresh/stale/missing/degraded 判定。
2. 只接受 controlled refs 与 payload summary object；拒绝 raw/customer/order identifiers、电话、地址、支付、token、secret、CSV/XLSX/raw payload carrier。
3. Fresh snapshot 可返回 status ref 与来源时间；missing/stale/degraded 必须输出 handoff-required contract，不让过期数据当实时订单状态。
4. 新增 focused Node test 覆盖 pure package boundary、行校验、错误行、batch summary、fresh/stale/missing/degraded read result、no API connector/no raw boundary 和 M4 docs evidence。
5. 同步 `docs/evidence/M4/README.md` 以列入 M4-04/M4-05，保持 remaining runtime/admin/API/AI/E2E blockers 可见。
6. 运行 validation chain，记录结果并提交 PR。

## 通过条件

- `order-read` package 不 import DB、LLM gateway、provider SDK、apps、engine 或 sibling capabilities。
- 导入行合同生成 snapshot draft 或 row error draft，计数可汇总，且只包含 controlled refs/summary object。
- 时间字段必须可解析；`expiresAt` 必须晚于 `sourceUpdatedAt`。
- Fresh read result 使用 import snapshot source/update/expiry/status ref；stale/missing/degraded read result 必须 handoff，不输出实时订单状态。
- Focused test 覆盖 E-02/E-03/E-04 foundation behavior 和 no API/no raw boundary。
- M4 evidence README 同步 #65/M4-04 与本 M4-05，不把 foundation 写成 E2E/runtime/admin closeout。

## 失败分支

- 若需要 DB repository、Prisma schema/migration、generated DTO、API route、admin UI、worker queue、CSV/XLSX parser 或 real import files：停止并拆到后续 scoped spec。
- 若发现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 stale/missing/degraded path 输出订单状态或让 LLM 判断状态：不得合并，修正为 handoff/fail-closed。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB repository、Prisma schema/migration、generated client、admin UI、API endpoint、worker parser、feature flag、production config 或 real CSV/XLSX import。
- 不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04 的 E2E/API/admin/runtime/AI acceptance；只提供 pure order-read contract foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `foundation_supported_not_closed` | Adds pure row validation, snapshot draft and batch/error summary contract; import runtime/admin E2E remains future scope. |
| E-03 | `foundation_supported_not_closed` | Adds stale snapshot handoff decision contract; admin/runtime warning remains future scope. |
| E-04 | `foundation_supported_not_closed` | Missing/stale/degraded paths hand off and do not fabricate order status; AI eval/runtime integration remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-05-order-read-import-snapshot-contract.md`。
