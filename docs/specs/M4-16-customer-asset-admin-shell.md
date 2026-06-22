# M4-16 Customer Asset Admin Shell

## 目标

为 M4 客户资产主流程交付最小可见 admin shell：在 `apps/admin` 新增 synthetic local customer asset center，覆盖客户列表筛选、客户详情、identity/profile/custom fields/customer tags、history conversation/ticket/order snapshot/quote/dual-track guide 受控引用、blacklist/unreachable restore 本地动作与 audit draft 提示。本 spec 不调用真实 API、不连接 DB/worker、不读取 env/secrets、不渲染真实客户/订单数据、不实现审计持久化、历史聚合、字段/标签配置保存或 1.0 发布关闭。

## Owner

Owner：确认本切片只作为 D-04/D-05/D-07/I-01 的可见 admin shell / E2E foundation，不代表客户资产中心完整 runtime、真实 API/DB、审计持久化、历史会话/订单/报价/工单回查聚合、conversation tags 配置复用、真实客户数据或 1.0 发布验收关闭。Owner 仍负责真实客户数据、字段/标签运营口径、生产配置、合规风险和最终发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-16-customer-asset-admin-shell` / `codex/m4-16-customer-asset-admin-shell` 执行；复核 admin 只调用可控本地状态、不 import 后端包、不默认真实网络、no raw customer/order data、customer restore fail-closed wording、PR hygiene、worker boundary、incident cleanup 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 customer asset admin shell 无法在预算内通过 focused Playwright、type/lint/guard/check validation，则关闭或拆小；不得夹带真实 API runtime、DB repository、审计持久化、历史聚合、字段/标签配置保存、真实客户样例或外部系统 connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-16-customer-asset-admin-shell.md`
  - `docs/evidence/M4/M4-16-customer-asset-admin-shell.md`
  - `docs/evidence/M4/README.md`
  - `docs/incidents/INC-2026-06-23-m4-16-root-patch-target.md`
  - `apps/admin/src/M4CustomerAssetShell.tsx`
  - `apps/admin/src/App.tsx`
  - `apps/admin/tests/design.spec.ts`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：`M4CustomerAssetShell.tsx` 是 synthetic local UI，复用现有 M4 admin shell 样式；incident file 记录本 spec 执行期间一次 relative `apply_patch` 错落 root/main checkout 且未提交的过程事故和清理控制；不得触碰 `apps/api/**`、`apps/worker/**`、`packages/db/**`、`packages/capabilities/**`、package/lock/config、真实客户样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 360、new source files <= 1。
- test/generated/lock/config/docs 预计变更：新增/更新 1 个 Playwright design test 文件；新增 spec/evidence/incident；同步 M4 evidence README；不改 API/worker/DB schema/migration/generated client、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "M4OrderPathStatusShell|page-grid|m4-order-path|customerAssetApiClient|M4-16|D-04|D-05|D-07" apps/admin/src apps/admin/tests docs/evidence/M4 docs/specs -S` 显示 admin 当前只有 M4 order shell 与 M4-15 customer asset API client contract，没有可见 customer asset admin shell；v1.1 后台设计 §4.3 与验收矩阵 D-04/D-05/D-07/I-01 仍保留 customer asset UI/E2E blocker。因此新增 `apps/admin/src/M4CustomerAssetShell.tsx` 归属 `apps/admin/src/**`，并在 `App.tsx` 挂载到现有 admin design page。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 API/SDK/provider/connector/adapter；不调用外部客户系统、订单 API 或本地 API runtime。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 只增加 admin design shell、Playwright evidence、incident record 和 M4 evidence，不新增 OpenAPI/generated DTO、production env validation、observability、runbook 或 release workflow。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、M4-15 spec/evidence、v1.1 PRD REQ-T03、后台设计 §4.3、验收矩阵 D-04/D-05/D-07/I-01、现有 admin shell/test patterns。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-16-customer-asset-admin-shell`；branch `codex/m4-16-customer-asset-admin-shell`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-16-customer-asset-admin-shell`
  - `git status --short --branch`: `## codex/m4-16-customer-asset-admin-shell`
  - `git branch --show-current`: `codex/m4-16-customer-asset-admin-shell`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-16-customer-asset-admin-shell UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker。M4 evidence README 是所有 M4 slice 的共享触碰点，因此本 slice 串行执行。本 branch 从 latest `main@268c009` 创建，open PR 为 `[]`，root/main clean，未合并分支为空。
- 过程事故记录：`docs/incidents/INC-2026-06-23-m4-16-root-patch-target.md` 记录本 slice 初次 relative `apply_patch` 错落 root/main checkout；未提交、未 staged，清理后必须用 root/worker 双 status 验证。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增 `apps/admin/src/M4CustomerAssetShell.tsx`，使用受控 refs 和本地状态渲染 customer asset center。
2. 在 `App.tsx` 挂载 shell；不得引入 API client runtime fetch、后端包 import 或 env 读取。
3. Playwright 覆盖客户筛选、详情 refs、field/tag surfaces、restore local action、remaining gates 和 raw-data negative assertions。
4. 记录并清理本 slice 发生的 root patch target incident，使用绝对路径 patch 和 root/worker 双状态核验防复发。
5. 同步 M4 evidence README，运行 validation chain，记录结果并提交 PR。

## 通过条件

- `/design` 可见 customer asset admin shell，并随 tenant switch 显示当前 tenant。
- UI 覆盖后台设计 §4.3 的 customer list filters、profile/identity/custom fields/customer tags、history conversations/tickets/order snapshots/quote records/dual-track guide refs、secondary entries。
- Restore action 只更新本地 shell 状态，显示 `customer_restore_flags` audit draft wording，不声称审计持久化。
- Admin source 不 import `apps/api/**`、`packages/db/**`、`packages/capabilities/**` 或任何后端包；不默认调用真实网络。
- Evidence file 记录 validation table、scope notes 和 no raw data/no API runtime/no DB/no external connector boundary。
- Root/main checkout returns clean after the incident cleanup, with worker branch carrying the intended changes.

## 失败分支

- 若需要真实 API base URL/env、global fetch 默认调用、TanStack Query runtime、DB connection、RLS transaction wrapper、real customer data、audit persistence、history aggregation、conversation tags save 或 external connector：停止并拆到后续 scoped spec。
- 若出现 raw customer/order samples、phone/address/payment/order IDs、Telegram usernames、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 Playwright 发现水平溢出、raw-data wording 或 restore flow 误导为真实持久化：不得合并，修正为 responsive synthetic shell 和明确 blocker wording。
- 若 root/main checkout 无法恢复干净或 boundary incident 影响范围不清：停止并扩大 incident/cleanup，不推进 PR 合并。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增外部 API adapter/provider/connector、DB schema/migration/generated client、API route、worker runtime、TanStack Query runtime、audit persistence、history/order/quote/ticket aggregation runtime、field/tag management save、feature flag、production config 或 real customer sample。
- 不读取 `process.env`、不默认调用 `global fetch`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx 文件、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不关闭 D-04/D-05/D-07/I-01 的 full UI/API/E2E/audit persistence/aggregation acceptance；只提供 visible admin shell foundation。

## 验收映射

| Item | Status | Notes |
| --- | --- | --- |
| D-04 | `admin_shell_supported_not_closed` | Adds visible customer list/detail shell with controlled related refs; real history/order/quote/ticket aggregation runtime remains future scope. |
| D-05 | `admin_shell_supported_not_closed` | Adds visible local restore action and audit draft wording; real audit persistence/admin owner flow remains future scope. |
| D-07 | `admin_shell_supported_not_closed` | Adds visible custom field/customer tag/conversation tag surfaces; config save and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_admin_shell_not_closed` | Adds desktop-visible customer asset workflow shell; full core workflow with runtime data remains future scope. |

## Closeout / Incident 记录

- Incident：`docs/incidents/INC-2026-06-23-m4-16-root-patch-target.md`，status `institutionalized_in_docs` after cleanup control was recorded。
- Closeout evidence target: `docs/evidence/M4/M4-16-customer-asset-admin-shell.md`。
