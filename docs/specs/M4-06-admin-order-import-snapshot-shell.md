# M4-06 Admin Order Import Snapshot Shell

## 目标

在现有 `/design` admin shell 中把 M4-01 的 “Import jobs / Order search” 后续 gate 推进为最小本地后台面：展示导入快照主路径、最近导入批次汇总、错误行可见、快照查询 fresh/stale/missing 状态、过期提示与转人工要求。本 spec 只做 synthetic/local admin shell 和 Playwright evidence，不实现 CSV/XLSX parser、API endpoint、DB repository、worker queue、外部订单 API connector、真实订单数据或 AI runtime。

## Owner

Owner：确认本切片只作为 E-02/E-03/I-01 的 admin-shell foundation，不代表导入 runtime、真实样例、后端持久化、AI order-read runtime/eval 或 1.0 发布验收关闭。Owner 仍负责真实导入样例、字段映射、客户/订单数据、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-06-admin-order-import-snapshot-shell` / `codex/m4-06-admin-order-import-snapshot-shell` 执行；复核 no external order API、no `order_connector`、no DB/API/worker/schema/runtime、no raw CSV/XLSX/order/customer data、admin UI wording、stale warning visibility、PR hygiene、worker boundary 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 admin shell 无法在预算内通过 Playwright、type/lint/guard/check validation，则关闭或拆小；不得夹带 DB/API/worker/parser/真实导入样例继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-06-admin-order-import-snapshot-shell.md`
  - `docs/evidence/M4/M4-06-admin-order-import-snapshot-shell.md`
  - `docs/evidence/M4/README.md`
  - `apps/admin/src/M4OrderPathStatusShell.tsx`
  - `apps/admin/src/m4-order-path-status-shell.css`
  - `apps/admin/tests/design.spec.ts`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/api/**`、`packages/db/**`、`packages/capabilities/**`、`packages/engine/**`、package/lock/config、generated/dist、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 450、new source files <= 0。
- test/generated/lock/config/docs 预计变更：更新 1 个 Playwright design test；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、API route、worker、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "Import jobs|Order search|Customer linkage|导入快照|过期|stale|row error|error row|order path|M4OrderPathStatus|订单数据主路径|Import job gated" apps/admin/src apps/admin/tests docs/specs docs/evidence/M4 packages/capabilities/order-read/src packages/db/src` 显示现有归属是 `apps/admin/src/M4OrderPathStatusShell.tsx` 与 `m4-order-path-status-shell.css`；M4-01 已把 Import jobs / Order search 标为 later M4 spec gate，M4-04/M4-05 已提供 DB/capability contracts，但尚无 admin 导入快照/错误行/查询状态 shell。因此就地扩展既有 M4 admin shell，不新增 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；ADR-B02 no-API branch remains active and `order_connector` remains absent.
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 用 spec/evidence/M4 README 记录 synthetic admin shell，不新增 OpenAPI/generated DTO/runbook/production runtime。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、SPK-02 spec/evidence、M4-01/M4-04/M4-05 spec/evidence、v1.1 PRD REQ-T04、后台设计 §4.4、技术架构 §6.7/§12.3、验收矩阵 E-02/E-03/E-04/I-01、现有 M4 admin shell 和 Playwright test patterns。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-06-admin-order-import-snapshot-shell`；branch `codex/m4-06-admin-order-import-snapshot-shell`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-06-admin-order-import-snapshot-shell`
  - `git status --short --branch`: `## codex/m4-06-admin-order-import-snapshot-shell`
  - `git branch --show-current`: `codex/m4-06-admin-order-import-snapshot-shell`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-06-admin-order-import-snapshot-shell UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。本 branch 从 latest `main@d91c76f` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 就地扩展 `M4OrderPathStatusShell`，把 Import jobs / Order search 从纯 gated wording 推进为 synthetic local admin shell。
2. 展示导入批次状态、successful/failed/total 计数、错误行列表、source/updated/expiry refs；只使用 controlled refs、summary text 和合成计数。
3. 增加 snapshot search 状态切换：fresh 可显示 status ref；stale/missing 必须显示 warning/handoff required，不输出实时订单状态。
4. 保留 customer linkage、runtime parser、DB repository、API route、worker queue、真实导入文件为 future gated scope。
5. 更新 Playwright 覆盖桌面和 mobile：导入批次、错误行、fresh/stale/missing、过期提示、无 raw data/无 API outage 误导。
6. 同步 M4 evidence README 与本 slice evidence，运行 validation chain，记录结果并提交 PR。

## 通过条件

- Admin shell 包含精确文案 `订单数据主路径：导入快照`，且 direct API 仍是 no-API branch，不描述为 temporary outage。
- 导入批次面展示 successful/failed/total、错误行可见和受控 source/update/expiry 信息。
- Snapshot search 面覆盖 fresh/stale/missing；stale/missing 必须有 warning 与 handoff required，不显示 order status ref。
- UI 不展示 raw CSV/XLSX、订单号、电话、地址、支付、TG handle、截图、credentials、env 或 secret。
- `apps/admin` 不 import 后端包；本 slice 不触碰 DB/API/worker/capability source。
- Playwright 覆盖 M4 shell 的新状态，并保持 320px mobile no horizontal overflow。

## 失败分支

- 若需要 CSV/XLSX parser、真实导入样例、DB repository、API route、worker queue、capability/source runtime 或 real customer/order data：停止并拆到后续 scoped spec。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 stale/missing path 显示订单状态或把 no-API 分支写成临时故障：不得合并，修正 wording 与 handoff/fail-closed surface。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB repository、Prisma schema/migration、generated client、API endpoint、worker parser、feature flag、production config 或 real CSV/XLSX import。
- 不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 E-02/E-03/E-04/I-01 的 runtime/API/AI/E2E acceptance；只提供 synthetic admin shell foundation。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `admin_shell_supported_not_closed` | Shows import job summary, successful rows/search surface and row errors; runtime import/admin E2E remains future scope. |
| E-03 | `admin_shell_supported_not_closed` | Shows stale snapshot warning/handoff state in admin shell; runtime warning remains future scope. |
| E-04 | `foundation_supported_not_closed` | Stale/missing UI handoff wording supports no fabrication; AI eval/runtime integration remains future scope. |
| I-01 | `partial_admin_shell_not_closed` | Extends desktop/mobile admin shell for order import path; full core workflow remains future scope. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-06-admin-order-import-snapshot-shell.md`。
