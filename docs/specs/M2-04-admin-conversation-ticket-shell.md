# M2-04 Admin Conversation Ticket Shell

## 目标

在租户层后台建立本地 synthetic 对话 / 工单运营 shell，覆盖对话筛选、状态置顶、对话详情、接管语义展示、工单队列、工单动作结构和核心 UI 状态。

本 PR 只实现 local admin UI shell 与 Playwright evidence，不关闭生产 API、WebSocket、real DB、真实客户流量、Telegram Business、GA-0、M2 closeout 或完整 D-01/D-03。所有展示数据必须为非敏感 synthetic labels，不调用后端包、不引入外部依赖、不新增真实发送路径。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M2-04 只合并后台本地 UI shell 和前端证据，不代表生产对话 / 工单能力、Business 可用、真实客户数据接入、真实 SLA 承诺、GA-0 或 1.0 发布就绪。

AI agent：执行 spec、TDD RED/GREEN、前端 shell 实现、evidence 更新、spec compliance review、code quality review 和验证；复核触碰模块、PR Hygiene、无后端 import、无真实 customer/TG/order/payment 样本、无 Business 发送路径、无 lockfile/config/generated churn、无测试弱化。

## 时间盒

0.5 个工作日。若本地 admin shell 无法在预算内通过 Playwright 与本地 validation，则关闭本分支或拆小；不得夹带 API、WS、DB、engine、channels、capabilities、真实 Business 或真实客户流量继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M2-04-admin-conversation-ticket-shell.md`
- `docs/evidence/M2/M2-04-admin-conversation-ticket-shell.md`
- `apps/admin/src/App.tsx`
- `apps/admin/src/M2ConversationTicketShell.tsx`
- `apps/admin/src/m2-conversation-ticket-shell.css`
- `apps/admin/tests/design.spec.ts`
- `packages/ui-tokens/src/tokens.css`

说明/备注：

未列出的模块默认不可改，尤其不得触碰 `apps/api/**`、`packages/db/**`、`apps/worker/**`、`packages/engine/**`、`packages/channels/**`、`packages/capabilities/**`、`package-lock.json`、generated/dist、configs、真实 payload/customer samples 或外部 provider/connector/adapter。

## 变更预算与路径分类

- source 预算：changed source files <= 4、net source LOC <= 600、new source files <= 2。
- path categories：docs = spec/evidence；source = `apps/admin/src/App.tsx`、`apps/admin/src/M2ConversationTicketShell.tsx`、`apps/admin/src/m2-conversation-ticket-shell.css`、`packages/ui-tokens/src/tokens.css`；test = `apps/admin/tests/design.spec.ts`；generated = none；lock = none；config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `conversation`、`Conversation`、`ticket`、`Ticket`、`handoff`、`Handoff`、`Business`、`tenant`、`M2-04`、`D-01`、`D-03`。当前 admin 只有 M1 group/tenant/release shell，未发现可扩展的 conversation/ticket/handoff UI。`apps/admin/src/App.tsx` 已接近 250 行 React 文件限制，因此新增 `M2ConversationTicketShell.tsx` 作为租户层 M2 shell 组件，并新增 scoped CSS 文件；`App.tsx` 只负责挂载。
- 外部 API/SDK/provider/connector/adapter 依据：none，本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，不声明 Telegram Business feasibility。
- 是否需要例外：none。

## 文档触发检查

- 结果：none。
- 判断依据：`docs/doc-gates.md`。本 PR 不新增 contracts、eval fixtures、OpenAPI、environment、observability、release runbook、真实 production workflow 或外部 provider 路径；M2-04 evidence 属于既有 M2 evidence 入口。

## 前置条件

- 当前 `main` 已合并 M2-00 readiness pack、M2-01 DB/contracts foundation、M2-02 Bot ingress baseline、SPK-01 conservative closure 和 M2-03 conversation/handoff/ticket API contract evidence。
- 本 worktree 必须是 `/Users/atilla/Documents/uzmax-m2-04-admin-shell`，分支为 `codex/m2-04-admin-conversation-ticket-shell`；root 工作树只做协调，不改文件。
- 开工前完成 `git status --short --branch`、`npm ci`、指定 AGENTS/spec/evidence/v1.1 文档重读、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,url`。
- SPK-01 已 conservative closure：Business 模块当前 branch 为 closed/disabled；M2-04 若展示 Business，只能只读/禁用并引用 ADR-B01，不得出现发送或草稿确认可操作路径。
- ADR-003 仍阻断真实客户消息进入第三方 LLM；本 PR 不消费或提交真实客户明文、Telegram handle、电话、地址、订单号、支付信息、截图、语音转写或 raw payload。

## 实施步骤

1. 新增本 spec，限定 M2-04 为 local admin UI shell。
2. 更新 Playwright expectations，覆盖 desktop、320px mobile floor、tablet、tenant switch、D-01 filters/states、D-03 ticket actions/close result UI、Business disabled、sensitive text regex、permission/degraded/error/empty/loading states。
3. 运行 `npm run playwright`，记录 RED：M2-04 shell/test ids 缺失导致失败。
4. 在 `apps/admin/src/M2ConversationTicketShell.tsx` 实现 synthetic 对话/工单 shell：对话列表状态筛选、待人工/SLA risk 置顶、消息线程、AI suspended、`withdrawn` / `pending_cancel`、接管/放回本地状态、工单队列、工单详情、claim/lock/note/escalate/close/reopen 本地 UI 或禁用状态、close result/destination/说明结构。
5. 在 scoped CSS 中实现高密度后台布局，全部走 tokens/classes，无 inline style；`App.tsx` 只挂载 M2 shell 并保留 M1 group/release shell 的关键测试能力。
6. 新增 M2 evidence，记录 RED/GREEN、validation、PR Hygiene、未关闭项。
7. 运行 required validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：Playwright 在实现前因 M2-04 shell 缺失失败。
- GREEN：Playwright 覆盖 desktop、320px mobile floor、tablet；M2 shell、tenant switch、conversation filters/states、ticket actions/close UI、Business disabled、sensitive text regex、loading/empty/error/permission denied/degraded states 均通过。
- Admin shell 位于租户层，不是 landing page；保留 M1 group/release shell 的关键测试能力。
- 对话列表展示并支持状态筛选：未读、未回、待人工、handoff、closed、SLA risk；待人工和 SLA risk 永远置顶。
- 对话详情展示消息线程、AI suspended、in-flight message `withdrawn` / `pending_cancel` 语义、接管/放回等本地 shell 状态；不得有真实发送路径。
- 工单队列展示待认领、我的、即将超 SLA、已重开、今晨待跟进；工单详情展示 summary、suggested action、SLA placeholder/policy ref、notes、event timeline。
- 工单 shell 覆盖 claim/lock/note/escalate/close/reopen 的本地 UI 状态或禁用动作；close 必须有 result/destination/说明 UI 结构。
- Loading、empty、error、permission denied、degraded 状态可测试呈现。
- `npm run test`、`npm run typecheck`、`npm run lint`、`npm run build`、`npm run size`、`npm run playwright`、`npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-04-admin-conversation-ticket-shell.md` 通过；时间允许时运行 `npm run check`。
- 本 PR 不触碰 API/DB/worker/engine/channels/capabilities、lockfile、generated/dist、configs、真实 payload/customer samples 或外部依赖。

## 失败分支

- 若 shell 需要真实 API/WS 才能验证：保留本地 synthetic shell 与 explicit degraded state，真实 API/WS/evidence 拆到后续 M2 spec。
- 若 Business 操作无法做到只读/禁用：移除 Business UI，只保留 ADR-B01 closed note；不得展示可发送、可确认或可用路径。
- 若 close 结果/去向/说明需要正式 schema 才能落库：只保留 UI 结构和 local state，schema/DB repository 拆后续 spec。
- 若 CSS/React 文件超过行数或源码预算：拆小组件或收缩展示密度，不扩大 touch list 到后端或配置。
- 若验证失败且无法在时间盒修复：记录 failing evidence，停止并请求后续 spec，不合并。

## 不做什么

- 不实现生产 conversation/ticket API、WebSocket/realtime、real DB repository、Prisma schema/migration、worker/engine integration、channels adapter、capabilities 业务实现、LLM、prompt、model route、Telegram Business、outbound sending、GA-0 或真实客户流量。
- 不 import 后端包；admin 只能展示本地 synthetic fixture/mock UI，不声称生产 API/WS 可用。
- 不新增外部依赖，不修改 `package-lock.json`。
- 不提交真实客户明文、Telegram handle、电话、地址、订单号、支付信息、截图、语音转写、raw payload、客服个人账号或真实 customer samples。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M2-04 status | Future closure path |
|---|---|---|
| C-03b | ui_guard_partial_evidence | Business appears only as disabled/read-only ADR-B01 state; backend/API unavailable verification remains later or closed branch review |
| C-06 | display_partial_evidence | UI displays AI suspended and in-flight withdrawn/pending_cancel semantics; engine/worker concurrency remains later |
| D-01 | ui_partial_evidence | Conversation filters/states and priority ordering covered by Playwright; production data/API remains later |
| D-02 | display_partial_evidence | Ticket detail shows summary/suggested action/SLA placeholder; API notification/repository remains M2-03/future specs |
| D-03 | ui_partial_evidence | Claim/lock/note/escalate/close/reopen and close result UI covered locally; multi-account backend locking remains later |
| I-01 | local_ui_partial_evidence | Conversation/ticket shell joins admin desktop workflow; broader customer/order/knowledge/eval flows remain later |
| I-04 | not_closed | UI shows degraded/non-realtime state only; WS/realtime or polling evidence remains M2-05 if needed |
| J-05 | active | M2-04 evidence records milestone acceptance progress without M6 pile-up |
| K-03 | active | One spec / one PR |
| K-04 | active | Touch list is explicit; no DB schema change |

M2-04 does not fully close C-06/D-01/D-02/D-03/I-01/I-04. It provides local UI evidence only.
