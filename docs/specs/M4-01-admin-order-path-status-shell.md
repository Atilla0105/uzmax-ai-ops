# M4-01 Admin Order-Path Status Shell

## 目标

交付 M4 后 SPK-02 / ADR-B02 no-API 分支的最小后台可见面：在现有 `/design` admin shell 中展示订单数据主路径为导入快照，明确订单 API 当前不配置、不调用，并把导入任务、订单搜索、客户关联标记为后续 M4 spec gate。本 spec 只做 truthful admin UI shell 和 evidence，不实现订单导入、查询、客户资产或后端契约。

## Owner

Owner：项目 owner 已在 2026-06-22 对 SPK-02 提供“暂时没有api”输入；owner 最终决定未来是否用新 spec / ADR revision / superseding ADR 重开订单 API。

AI agent：只在分配 worktree 中执行本 spec，创建最小 UI shell、Playwright 覆盖和 evidence；复核无 API 调用、无后端 import、无 raw order/customer data、无 packages/db 或 apps/api 触碰，并记录验证结果。

## 时间盒

0.5 个工作日。若需要 DB schema、API contract、订单导入 runtime、真实订单样本、API 文档/凭据或跨 worker 共享文件，停止并进入失败分支。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-01-admin-order-path-status-shell.md`
  - `docs/evidence/M4/M4-01-admin-order-path-status-shell.md`
  - `apps/admin/src/**`
  - `apps/admin/tests/design.spec.ts`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 docs/evidence/M4/README.md、packages、apps/api、scripts、package/lock files、generated/dist、CI config、migrations、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 3、net source LOC <= 260、new source files <= 2。
- test/generated/lock/config/docs 预计变更：test 1 file (`apps/admin/tests/design.spec.ts`); docs 2 files; generated/lock/config none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg -n "M4|订单|\bOrder\b|导入快照|import snapshot|ADR-B02|SPK-02|E-0[1-4]" apps/admin/src apps/admin/tests/design.spec.ts` 返回无匹配；`rg` 显示现有 admin shell 模式为 `M2ConversationTicketShell` / `M3KnowledgeEvalShell` 独立 component + CSS + `App.tsx` 挂载 + Playwright `data-testid` 覆盖。因此新增 `M4OrderPathStatusShell.tsx` 与 `m4-order-path-status-shell.css` 归属 `apps/admin/src/**`，避免塞入 `App.tsx` 形成大组件。
- 外部 API/SDK/provider/connector/adapter 依据：ADR-B (`docs/adr/ADR-B02-order-api.md`)；本 PR 不新增外部 API/SDK/provider/connector/adapter。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`。
- 备注：本 spec 创建自身与 M4 evidence；不引入 contracts、eval fixtures、env schema、observability、production release workflow 或 issue/agent process 文档触发能力。

## 前置条件

- 已读 `AGENTS.md`、`docs/specs/README.md`、`docs/specs/SPEC-template.md`、`docs/adr/ADR-B02-order-api.md`、`docs/evidence/M4/README.md`、PRD/backend-design/acceptance/technical architecture 中 M4 order/customer 相关段落，以及现有 admin source/tests。
- ADR-B02 current branch: `no_api_for_m4__import_snapshot_main_path`。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-01-admin-order-path-status-shell`；branch `codex/m4-01-admin-order-path-status-shell`；禁止写入 primary/root checkout `/Users/atilla/Documents/UZMAX智能运营`。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-01-admin-order-path-status-shell`
  - `git status --short --branch`: `## codex/m4-01-admin-order-path-status-shell`
  - `git branch --show-current`: `codex/m4-01-admin-order-path-status-shell`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-01-admin-order-path-status-shell UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：本 spec 只触碰 admin UI/test/spec/evidence，不触碰 `packages/db/**`、schema、lockfile、共享 config、CI/guard 脚本或全局生成物。M4-02 DB contracts 曾作为独立 worker 草稿启动，但未采纳未提交草稿并已清理；后续 DB schema 切片必须从最新 `main` 重新串行开工。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录；本 spec touch list 不允许 incident 文件时需停止等待 coordinator 决定。

## 实施步骤

1. 新增 M4 order-path status shell：显示 `订单数据主路径：导入快照`、ADR-B02 no-API branch、E-01/E-02/E-03/E-04 当前口径和后续 M4 gate。
2. 将 shell 挂入现有 admin first flow，保持静态本地 UI，不请求 API，不 import 后端包，不渲染真实订单/客户标识。
3. 使用现有 tokens/panel/shell 风格新增 CSS，并保证 320px mobile floor 不横向溢出。
4. 扩展 `apps/admin/tests/design.spec.ts` 覆盖 M4 wording、no raw order/customer data、disabled future actions 和 mobile no-overflow。
5. 新增 M4 evidence 文件，记录验证表、范围说明和无 API/无数据边界。

## 通过条件

- `/design` 首屏 admin flow 可见 M4 订单路径状态 shell。
- UI 包含精确文案 `订单数据主路径：导入快照`，并明确 direct order API 当前不配置、不可调用，不描述为 temporary outage。
- UI 将 import jobs、order search、customer linkage 标记为 later M4 specs/gates，不提供可执行导入/查询/连接动作。
- 无真实 API call、无后端 import、无 raw order/customer data、无 fake outage wording。
- Playwright 覆盖 M4 词句与 mobile/no-overflow sanity check。
- 指定 validation commands 通过或 evidence 记录精确 blocker。

## 失败分支

- 若实现需要真实订单 API、凭据、订单样本、CSV/XLSX、截图或客户标识：关闭本切片，等待 owner 输入与新 spec/ADR 重开。
- 若需要 DB schema/API contract 与 M4-02 触碰模块交集：停止并交回 coordinator 串行化。
- 若 mobile/no-overflow 无法在预算内修复：保留静态 shell，记录 blocker，拆后续 UI polish spec。
- 若 validation 暴露非本 spec 范围的既有失败：不修改越界文件，记录 evidence 并交 coordinator 判断。

## 不做什么

- 不调用或模拟订单 API。
- 不实现 API connector、provider、adapter、backend route、worker、DB schema、migration、generated DTO 或 import runtime。
- 不提交 raw/export/jsonl/csv、CSV/XLSX、截图、order IDs、phone numbers、addresses、payment data、customer plaintext、credentials、token values 或 env files。
- 不实现真实订单搜索、客户资产关联、订单详情、导入任务进度、错误下载或回滚。
- 不修改 `docs/evidence/M4/README.md`、`packages/**`、`apps/api/**`、`scripts/**`、package/lock/config/generated/dist/CI/migrations。

## 验收映射

- E-01：当前 `not_current_blocker__no_api_for_m4`，UI 不声明 API connector 可用。
- E-02：当前 `p0_current_main_path__import_snapshot`，UI 把导入快照作为订单数据主路径。
- E-03：当前 `p0_remains__stale_snapshot_warning`，UI 显示 stale snapshot warning gate，真实逻辑后续 spec。
- E-04：当前 `p0_remains__no_fabricated_order_status`，UI 显示缺失/过期/降级时转人工 gate，真实 AI 路径后续 spec。
- I-01：admin desktop core flow 增加订单主路径可见 shell；不关闭完整订单主流程。

## Closeout / Incident 记录

- Incident: none found in this spec execution at authoring time.
- Closeout evidence target: `docs/evidence/M4/M4-01-admin-order-path-status-shell.md`.
