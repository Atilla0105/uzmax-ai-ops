# M2-07 Conversation Ticket API HTTP Error Hardening

## 目标

修复 M2-03/M2-06 owner review 后确认的 conversation/ticket API HTTP 错误语义问题：API contract 中的领域、校验、权限和访问上下文错误必须映射为明确 Nest HTTP exception，避免落成 generic 500；同时把 `apps/api/src/conversation-ticket.ts` 从 300 行混合 repository/service/controller/helpers 拆成同目录 cohesive API 文件，保持公开 controller/module 行为稳定。

本 PR 只加固 M2-03 in-memory API contract shell，不改变 claim vs lock 产品语义，不接入真实 DB、WS、worker、生产流量或真实客户消息路径。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M2-07 只接受 HTTP error contract hardening 和代码密度拆分；`claim` 仍只是分配，`lock` 仍是独占编辑防线。若后续要让 claim 也具备独占语义，需要单独产品/spec 决策。

AI agent：执行本 spec、先写 RED 覆盖、实现 typed/domain error mapping、拆分 API 文件、更新 contract/evidence，并复核触碰模块、PR Hygiene、无 DB/admin/worker/engine/channels/lockfile/config/generated/dependency 变更、无 raw/customer/Telegram/order/payment/secret 数据。

## 时间盒

0.5 个工作日。若 HTTP error mapping 或拆分需要真实 repository、WS、worker、admin API client 或 DB schema 才能验证，则停止并拆后续 spec；不得把生产接线夹带进本 PR。

## Spec 类型

fix

## 触碰模块/文件

- `docs/specs/M2-07-conversation-ticket-api-http-hardening.md`
- `docs/evidence/M2/M2-07-conversation-ticket-api-http-hardening.md`
- `docs/evidence/M2/README.md`
- `docs/contracts/README.md`
- `apps/api/src/conversation-ticket.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.errors.ts`
- `apps/api/src/conversation-ticket.repository.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/api/src/conversation-ticket.types.ts`
- `apps/api/scripts/runtime-compiler.mjs`
- `packages/capabilities/handoff/src/index.ts`
- `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`
- `scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs`
- `scripts/tests/m2-conversation-ticket-test-harness.mjs`

说明/备注：

- 本 PR 不触碰 `packages/db/**`、`apps/admin/**`、`apps/worker/**`、`packages/engine/**`、`packages/channels/**`、`apps/api/src/app.module.ts`、lockfile、generated/dist、configs、dependencies、external provider/adapter code 或真实 payload/customer samples。
- `apps/api/src/app.module.ts` 继续从 `./conversation-ticket.ts` 导入公开 exports；若实现证明必须改 import，需先更新本 spec 触碰模块并重新跑 guard。

## 变更预算与路径分类

- source 预算：changed source files <= 8、net source LOC <= 600、new source files <= 5。
- path categories：docs = spec/contracts/evidence；source = `apps/api/src/conversation-ticket*.ts`、`apps/api/scripts/runtime-compiler.mjs`、`packages/capabilities/handoff/src/index.ts`；test = `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`、`scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs`、`scripts/tests/m2-conversation-ticket-test-harness.mjs`；generated = none；lock = none；config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `HttpException|BadRequestException|NotFoundException|ConflictException|ForbiddenException|UnauthorizedException|throw new Error|conversation-ticket`。当前 M1 access-context 已有本地 HTTP mapping style：`ApiAccessError` 400 -> `BadRequestException`、401 -> `UnauthorizedException`、其他 access/authz -> `ForbiddenException`。M2-03 `conversation-ticket.ts` 仍在同一 300 行文件内混合 repository/service/controller/helpers，并用 bare `Error` 表达 `conversation status is invalid`、`conversation not found`、`ticket not found`、`access context is required`、required field 等 API/domain 错误。已检索 `ConversationTicket|TicketAction|createHumanHandoff|applyTicketAction|claim|lock`，确认 `conversation-ticket.ts` 是需要拆分的现有 API runtime；新增 sibling files 归属同一 API contract，而不是新增平行实现。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter。
- 是否需要例外：none。

## 文档触发检查

updated。新增 HTTP error contract 说明会更新 `docs/contracts/README.md`；不新增 schema/migration/generated DTO/OpenAPI、eval fixture、environment validation、observability、release workflow、production runtime、external provider/connector/adapter 或 runbook。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m2-07-ticket-api-hardening`，分支为 `codex/m2-07-conversation-ticket-api-hardening`。
- 开工前必须重读 `AGENTS.md`、v1.1 PRD、技术架构、后台设计与前端架构、1.0 验收矩阵、M2-03/M2-06 specs/evidence、M2 evidence README 和 contracts README。
- 开工前必须记录 `git status --short --branch`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,url` 和上述 `rg` 搜索结论。
- ADR-003/customer-data boundary 仍生效：不得提交 raw Telegram payloads、真实客户明文、截图、语音转写、订单号、电话、地址、支付信息、客服个人账号或 secrets。

## 实施步骤

1. 在 focused M2 contract test 中先新增 RED 覆盖：controller/HTTP mapping 对 not found、lock conflict、missing required field、invalid status、invalid action type、invalid priority、missing access context、permission/authz denial 的状态码映射；未知 unexpected errors 不被改写为业务 HTTP error。
2. 运行 `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs`，记录 RED failure。
3. 在 handoff helper 中把 lock conflict、invalid action、invalid priority、required field 改为 typed domain errors；保留纯 helper/test 可用，不引入 Nest。
4. 拆分 `conversation-ticket.ts` 为 barrel exports，加 sibling files 承载 types、repository、service、controller 和 error/http mapping；controller 层负责 Nest HTTP exception mapping，service/runtime helper 继续返回领域错误。
5. 采用本地 M1-style access mapping：missing access context 和 authz/permission failures fail closed 为 access/auth error，映射为 403；若身份缺失由 access-context guard 在 controller 前继续映射为 401。
6. 更新 runtime compiler allow-list/replacements 以加载 split source files。
7. 更新 contracts/evidence/M2 README，记录 HTTP error contract、claim vs lock non-change、ADR-003/customer-data watchpoint 和 validation。
8. 完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录，且失败原因是 M2-07 HTTP mapping/split contract 尚不存在。
- `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs` 通过。
- `npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-07-conversation-ticket-api-http-hardening.md --include-worktree` 通过；时间允许则 `npm run check` 通过。
- conversation not found / ticket not found -> 404。
- ticket locked by another user -> 409。
- missing required fields, invalid status, invalid action type, invalid priority -> 400。
- missing access context 采用 M1-style fail-closed access mapping -> 403；身份缺失/无效仍由 M1 access-context guard 映射为 401。
- permission/authz failures -> 403，不成为 generic 500。
- unknown unexpected errors 保持 unexpected，不改写成业务错误。
- `claim` 只分配，`lock` 才是独占编辑防线；本 PR 不改变该产品语义。
- `apps/api/src/conversation-ticket.ts` 不再承载 combined repository/service/controller/helpers；split files 在 ESLint file-length budget 内且职责清晰。
- 不触碰禁止模块、lockfile、generated/dist、configs、dependencies 或敏感数据。

## 失败分支

- 若需要真实 DB repository 才能证明 not-found/tenant scope：保留 in-memory contract hardening，真实 repository 拆后续 M2/M3 spec。
- 若需要 admin API client 或 browser UI 才能证明 error presentation：只记录 API contract；admin wiring 拆后续 spec。
- 若 lock/claim 语义需要产品重判：停止，不在本 PR 改 claim-exclusive 行为。
- 若 message plaintext/customer content path 需要被触碰：停止，回 ADR-003/customer-data boundary，拆 M3/production watchpoint spec。
- 若 runtime compiler split support 超出本 spec 预算：缩小拆分或停止，不绕过 lint/guard。

## 不做什么

- 不实现真实 DB persistence、Prisma schema/migration、WebSocket/realtime、worker/engine consumer、admin API client、production traffic、GA-0、LLM、prompt/model route、Telegram Business、outbound sending 或 `message.content` customer plaintext paths。
- 不修改 `packages/db/**`、`apps/admin/**`、`apps/worker/**`、`packages/engine/**`、`packages/channels/**`、`apps/api/src/app.module.ts`、lockfile、generated/dist、configs、dependencies 或 external provider/adapter code。
- 不提交 raw/export/jsonl/csv、真实客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M2-07 status | Notes |
|---|---|---|
| D-01 | contract_hardening | Conversation API not-found/validation errors get explicit HTTP statuses; production DB/UI remains future work. |
| D-02 | contract_hardening | Handoff ticket required-field/domain errors get explicit HTTP statuses; notification/real repo remains future work. |
| D-03 | contract_hardening | Ticket action lock conflict and invalid action errors get explicit HTTP statuses; claim vs lock semantics unchanged. |
| B-04 | contract_hardening | Permission/authz failures fail closed as 403 instead of generic 500 at API contract boundary. |
| I-04 | not_closed | No WS/realtime/polling production integration in this PR. |
| J-05 | active | Follow-up evidence recorded during M2 owner-review hardening. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Touch modules explicit; DB schema untouched and production work deferred. |

M2-07 does not close 1.0 production acceptance. It only hardens the M2-03 API contract shell and preserves all M2-06 production/GA-0/customer-data follow-up blockers.
