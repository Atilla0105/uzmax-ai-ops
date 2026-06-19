# Contracts

本目录记录 schema、DTO、OpenAPI 或前后端共享契约的入口。

## Platform Schema And Authz

`M1-01-platform-schema-authz-foundation` 引入第一组正式平台契约：

- `packages/db/prisma/schema.prisma` 定义 `org`、`tenant`、`org_member`、`tenant_member`、`permission_grant` 的 Prisma model。
- `packages/db/migrations/0001_platform_schema_authz_foundation.sql` 定义同名 Postgres tables、enum、RLS baseline 和 `uzmax_app_runtime` 受限 role。
- `packages/db/src/index.ts` 暴露平台表名、`app.org_id` / `app.tenant_id` RLS context key、runtime role 与 role identifier 校验。
- `packages/authz/src/index.ts` 暴露 `AuthzRepository`、`AccessContext` 和纯 resolver；权限事实源只允许来自 `tenant_member` 与 `permission_grant`，不得使用 JWT 或 `user_metadata` 的业务授权 claim。

## RLS Context

平台 RLS baseline 沿用 ADR-001 / ADR-002：

- runtime 查询先在事务内 `SET LOCAL ROLE` 到受限 role。
- 同一事务内注入 `set_config('app.org_id', orgId, true)` 与 `set_config('app.tenant_id', tenantId, true)`。
- 缺失 org/tenant context 时 policy 默认拒绝。
- `tenant_member` 与 `permission_grant` 是后端生成 `AccessContext` 的事实源；后续 API guard 可以用服务端受控路径读取事实源，再把 selected tenant context 注入业务查询。

## API Access Context

`M1-02-api-access-context-shell` 引入最小 Nest API access-context 契约：

- `GET /healthz` 只返回 API shell 存活状态，不包含 secret、连接串或客户数据。
- `GET /readyz` 只返回组件契约状态：identity verifier、authz repository、database、audit 和 access-context contract；缺少 runtime identity/authz 配置时返回 `not_ready` / HTTP 503，staging/prod Supabase 路线未定时不关闭生产 readiness。
- API 请求通过 `Authorization: Bearer <jwt>` 提供 Supabase Auth 身份；后端只调用 Supabase Auth `getUser(jwt)` 取 `user.id`，不得信任 JWT 或 `user_metadata` 中的业务权限 claim。
- selected tenant 来自 `x-tenant-id`、`tenant_id` query 或请求体 `tenant_id`；后端必须用 `tenant_member` 与 `permission_grant` 事实源生成 `AccessContext`，未授权、撤权或伪造 tenant 默认拒绝。
- `GET /me/access-context` 由 `ApiAccessContextGuard` 保护，并要求 `tenant:read` 权限。
- `POST /tenant/switch` 每次重新生成目标 tenant 的 `AccessContext`，要求 `tenant:switch` 权限，不复用旧 context；成功时返回目标 tenant 的 RLS transaction context helper 输出。
- `packages/db/src/index.ts` 的 `createRlsTransactionContext` 输出 `SET LOCAL ROLE` 语句和 `app.org_id` / `app.tenant_id` settings，供后续 repository 在事务内注入；本契约不允许裸用 Prisma 业务查询绕过 context。

M1-02 审计只定义 event port/shape，不新增正式 `audit_log` schema：

| event_type | 必填语义 | 备注 |
|---|---|---|
| `access_context.denied` | `actorUserId`、`tenantId`、`reason`、`occurredAt` | token 已验证但 tenant/access-context 被拒绝时记录 |
| `tenant_switch.allowed` | `actorUserId`、`orgId`、`tenantId`、`membershipVersion`、`occurredAt` | tenant switch 成功且 `tenant:switch` 权限通过 |
| `tenant_switch.denied` | `actorUserId`、`tenantId`、`reason`、`occurredAt` | target tenant 不可用、撤权或缺 `tenant:switch` 权限 |

M1-02 不关闭完整 A-02、B-01 或 B-05：后台 E2E、业务表 RLS、正式审计表/配置版本、发布验收入口仍由 M1-03/M1-04 单独实现。

## Audit And Config Version Foundation

`M1-04-audit-config-version-foundation` 引入第一组正式治理契约：

- `packages/db/prisma/schema.prisma` 定义 `audit_log`、`config_version`、`config_version_domain` 和 `config_version_status`。
- `packages/db/migrations/0002_audit_config_version_foundation.sql` 定义同名 Postgres tables、enum、RLS select/insert baseline 和约束。
- `packages/db/src/index.ts` 暴露治理表名、审计事件类型、配置版本 domain/status 和纯 contract helper。
- `apps/api/src/access-context-core.ts` 将 tenant switch 成功事件升级为正式 audit payload，并新增权限变更、配置保存、配置回滚的 contract methods。

正式 `audit_log` 的 M1 必填语义：

| 字段 | 语义 |
|---|---|
| `actor_user_id` | 执行动作的 Supabase Auth user id；关键动作不得匿名 |
| `org_id` / `tenant_id` | RLS scope，必须匹配当前 `app.org_id` / `app.tenant_id` |
| `event_type` | `tenant_switch.allowed`、`permission_grant.changed`、`config_version.saved`、`config_version.rollback_requested` 等 contract event |
| `module` / `action` | 操作模块与功能，如 `access/tenant_switch`、`authz/permission_change`、`config/save` |
| `object_type` / `object_id` | 可跳回的业务对象；M1-04 只覆盖 tenant、permission grant、config version |
| `content` | JSON object，必须包含 `before` 与 `after` 键 |
| `before_version_id` / `after_version_id` | 配置保存/回滚时引用配置版本；非配置动作可为空 |
| `occurred_at` | 服务端事件时间 |

正式 `config_version` 的 M1 domain/status：

| contract | values |
|---|---|
| `config_domain` | `business_config`、`feature_flag`、`template_copy` |
| `status` | `draft`、`active`、`rolled_back`、`archived` |

M1-04 只关闭 schema/API/admin contract 地基：默认 API 仍使用 contract audit sink，不连接生产数据库；后台只提供审计与配置版本只读入口，不实现完整日志中心、配置中心、角色编辑、feature flag 发布、模板中心或生产 readiness。M1-04 不提交 raw/export/jsonl/csv 样本，不消费真实客户消息，不开启第三方 LLM 客户流量。

`access_context.denied` 是无法安全得到 org/tenant scope 时的 pre-audit 拒绝事件，不直接映射到正式 `audit_log`。`tenant_switch.denied` 在能够解析当前 audit context 时必须使用正式 `AuditLogContract`，包含 `module`、`action`、`object_type`、`content.before` / `content.after` 和当前 tenant scope。

## M2 Channel Conversation Foundation

`M2-01-channel-conversation-db-contracts-foundation` 引入 M2 渠道/对话/消息/工单 DB contracts foundation：

- `packages/db/prisma/schema.prisma` 定义 `channel_connection`、`telegram_update_dedupe`、`conversation`、`message`、`ticket`、`ticket_event` 的 Prisma model mapping、enum/status values 和 tenant-scoped relations。
- `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql` 定义同名 Postgres tables、enum、tenant FK、RLS select/insert/update policies 和 `uzmax_app_runtime` least-privilege grants。
- `packages/db/src/index.ts` 暴露 `channelConversationTableNames`、channel/conversation/message/ticket status values，以及 `createConversationContract`、`createMessageContract`、`createTicketContract` 纯 builders/validators。

M2-01 的正式 SQL 表名为 `conversation`、`message`、`ticket`、`ticket_event`；Prisma model 使用 `ChannelConversation`、`ChannelMessage`、`SupportTicket`、`SupportTicketEvent`，避免泛型 model 名与 M1 pre-M2 tests 的边界语义冲突。

所有 M2-01 tenant-scoped table 都必须：

- 带 `org_id` 与 `tenant_id`。
- FK 到 `tenant(org_id, id)`；跨表引用同时带 scope。
- `enable` + `force row level security`。
- 在缺少 `app.org_id` 或 `app.tenant_id` 时 fail closed。
- 只授予 runtime role `select`、`insert`、`update`；不得授予 delete。

M2-01 does not close C-01/C-02/C-06/D-01/D-02/D-03/I-04. It only provides foundation for later Bot ingress, conversation/handoff/ticket API, admin shell, and realtime specs.

Business-specific schema remains deferred to SPK-01 / ADR-B01. This PR deliberately does not add `business_connection`, customer asset center, order/customer asset tables, Bot runtime, API/admin/worker/WS, LLM, prompts, distill, production traffic, or Business feasibility claims. No raw Telegram payloads or customer content belong in this contract or its evidence.

## M2 Telegram Bot Ingress Contract

`M2-02-telegram-bot-ingress-dedupe-queue` 引入最小 Telegram Bot ingress contract：

- `packages/channels/src/index.ts` 暴露 `telegramBotAllowedUpdates` 与 `normalizeTelegramBotUpdate`，仅把 Telegram Bot `Update` 提取为 bounded internal ingress object。
- 支持的入站类型为 text message、photo/image message、voice message 和 `callback_query`。
- `business_message`、`business_connection`、其他 Business update 和未支持 update type 只进入 `unsupported` / `deferred` classification；SPK-01 / ADR-B01 前不得声明 Business 可行。
- Normalized object 只保留 `providerUpdateId`、`updateKind`、conversation/participant/message external refs、`contentKind`、bounded text、callback data、file ids、`unsupportedReason` 和可选发生时间。
- No raw Telegram payloads, customer samples, screenshots, voice transcripts, token values, phone numbers, addresses, payment data, or support personal accounts belong in this contract.

`apps/api/src/telegram-bot.ts` 暴露最小 webhook core contract，`apps/api/src/app.module.ts` 注册默认 fail-closed shell：

- `TelegramBotWebhookCore` 通过 `X-Telegram-Bot-Api-Secret-Token` 与 configured secret 比对；secret missing 或 mismatch 均 fail closed，且不 enqueue。
- Webhook core 只在 queue port 返回 `accepted`、`deduped` 或 `unsupported` 时返回 2xx contract。
- `TelegramBotIngressQueuePort` 是显式 handoff seam；`InMemoryTelegramBotIngressQueue` 只用于测试和 local contract evidence，按 `providerUpdateId` / Telegram `update_id` dedupe。
- Default `AppModule` maps `POST /telegram/bot/webhook` to a disabled shell using `DisabledTelegramBotIngressQueue`，避免在没有 Redis/BullMQ worker consumer 时声称真实队列 ready。

External API evidence is Telegram Bot API official docs only: https://core.telegram.org/bots/api. The contract relies on official facts that webhook delivery is HTTPS POST with JSON-serialized `Update`, unsuccessful non-2xx webhook responses are retried, `Update` includes types such as `message` and `callback_query`, `allowed_updates` can limit update types, `update_id` is suitable for dedupe, and `secret_token` is delivered in `X-Telegram-Bot-Api-Secret-Token`.

M2-02 provides C-01/C-02 foundation/partial evidence only. It does not close C-01/C-02 completely, does not close D/I items, does not implement DB-backed dedupe, worker consumers, conversation engine, outbound sending, admin UI, real Redis/BullMQ, production deployment, real customer traffic, LLM, or Business capability.

## M2 Conversation Handoff Ticket API Contract

`M2-03-conversation-handoff-ticket-api-contract` 引入最小 conversation / handoff / ticket API contract baseline：

- `packages/capabilities/handoff/src/index.ts` 暴露纯 handoff/ticket helper：`createHumanHandoff`、`createTicketState`、`applyTicketAction`。
- `createHumanHandoff` 将 conversation 标记为 `pending_handoff`，将 AI suspended，并把 in-flight AI messages 标记为 `withdrawn` 或 `pending_cancel`；本 contract 不发送消息。
- Handoff ticket draft 包含 summary、suggested action 和 SLA contract field。SLA 只保存 `policyRef` / optional `dueAt` / `source: config_placeholder`，不由 LLM 或代码生成客户承诺。
- Ticket actions baseline 覆盖 `claim`、`lock`、`note`、`escalate`、`close`、`reopen`，并在 lock 已归属他人时 fail closed，提供多人抢答最小防线。
- `apps/api/src/conversation-ticket.ts` 暴露 in-memory repository/service/controller shell：conversation list/detail 按 `AccessContext.selectedTenantId` 和 `orgId` scope 过滤；filters/status values 对齐 M2-01 `open`、`pending_handoff`、`handoff`、`closed`。
- Default `AppModule` 注册 `ConversationTicketController`、`ConversationTicketService` 和 `InMemoryConversationTicketRepository`，仅作为 local contract/runtime evidence；不声明真实 DB、WS、Redis/BullMQ、worker、admin UI 或 production readiness。

M2-03 provides C-06/D-01/D-02/D-03 contract/partial evidence only. It does not fully close those items, does not close I-04, and does not implement admin UI, WebSocket/realtime, real DB repository, Prisma schema/migration, engine/worker consumer, LLM, prompt/model route, Telegram Business, outbound sending, production deployment, GA-0 or real customer traffic. External API evidence: none (no new external API/SDK/provider/connector/adapter).

## M2-07 Conversation Ticket API HTTP Error Contract

`M2-07-conversation-ticket-api-http-hardening` hardens the M2-03 API shell error boundary without changing public routes or production readiness:

- `conversation not found` and `ticket not found` map to HTTP 404.
- Ticket lock conflicts (`ticket is locked by another user`) map to HTTP 409.
- Missing required fields, invalid conversation status, invalid ticket action type and invalid ticket priority map to HTTP 400.
- Missing `AccessContext` follows the M1 access-context fail-closed style and maps to HTTP 403 at the conversation/ticket controller boundary. Missing or invalid identity remains the existing M1 guard responsibility and maps before the controller.
- Permission/authz failures map to HTTP 403 and must not surface as generic 500 responses.
- Unknown unexpected errors remain unexpected; the controller mapper does not convert arbitrary errors into business HTTP exceptions.

M2-07 also splits the API-local implementation into `conversation-ticket.controller.ts`, `conversation-ticket.errors.ts`, `conversation-ticket.repository.ts`, `conversation-ticket.service.ts` and `conversation-ticket.types.ts`, with `conversation-ticket.ts` kept as the public barrel used by `AppModule`.

Claim and lock semantics are unchanged: `claim` assigns the ticket; `lock` is the exclusive edit guard. Claim-exclusive behavior would require a separate owner product decision and spec.

This contract still does not wire real DB persistence, WebSocket/realtime, worker/engine consumers, admin API clients, production traffic, Telegram Business, LLM/prompt/model route, outbound sending or `message.content` customer plaintext paths. ADR-003/customer-data restrictions remain active for future M3/production work.

## M3 AI Capability Data Contracts Foundation

`M3-01-ai-capability-data-contracts-foundation` 引入 M3 AI capability 的最小 DB contracts foundation：

- `packages/db/prisma/schema.prisma` 定义 `kb_entry`、`kb_stage`、`media_asset`、`quote_record`、`eval_case`、`eval_run`、`eval_result`、`eval_gate`、`llm_call_log` 的 Prisma model mapping、status/category values 和 tenant-scoped relations。
- `packages/db/migrations/0004_ai_capability_data_contracts_foundation.sql` 定义同名 Postgres tables、enum、tenant FK、scope-preserving cross-table FK、RLS select/insert/update policies 和 `uzmax_app_runtime` least-privilege grants。
- `packages/db/src/m3-ai-contracts.ts` 暴露可读版 `m3AiTableNames`、M3 status/category/task values，以及 pure builders/validators for KB refs, media assets, quote records, eval contracts and LLM call logs。
- `packages/db/src/index.ts` provides direct M3 exports while preserving existing DB exports. This keeps legacy data-URL based DB source tests working without a relative barrel import.

所有 M3-01 tenant-scoped table 都必须：

- 带 `org_id` 与 `tenant_id`。
- FK 到 `tenant(org_id, id)`；跨表引用同时带 scope。
- `enable` + `force row level security`。
- 在缺少 `app.org_id` 或 `app.tenant_id` 时 fail closed。
- 只授予 runtime role `select`、`insert`、`update`；不得授予 delete。

Quote contract boundary:

- The quote source of truth is code plus versioned config provenance.
- `quote_record.source` 只允许 `code`。
- `quote_record` 必须保留 structured input ref、code-created result 和 config/version provenance。
- LLM 不得作为价格 source of truth；LLM 只允许在后续 specs 中抽取参数，报价计算必须由 code/config 完成。

LLM call log boundary:

- LLM call log must not store raw prompt or raw completion。
- 允许字段仅限 task、provider/model IDs、route/version refs、token counts、cost/latency、status、trace id、prompt/completion hash、redaction/truncation metadata、fallback/eval/redline summaries and controlled refs。
- ADR-003 dev-only/customer-LLM-blocked 仍生效：no production, GA-0, real customer traffic, customer LLM, prompt/model/persona release or provider route release is approved by M3-01。

Eval persistence boundary:

- `eval_case` stores category, controlled `case_ref`, version, status, quota weight and redacted payload shape only。
- `eval_run` / `eval_result` / `eval_gate` store status, category quotas, refs and summary fields needed for future gate enforcement。
- No raw sample content in git. Raw/export/jsonl/csv, customer plaintext, Telegram payloads, screenshots, voice transcripts, order IDs, phone/address/payment data, support personal accounts, raw prompts and raw completions remain barred from repo evidence。

M3-01 does not close F-01/F-02/F-04/F-05/G-01/G-02/G-03/G-05/G-06/H-01. It only provides foundation for later M3 runtime, eval gate, KB/tutorial, pricing, vision, speech and breaker/redline specs. It does not implement production runtime, API/worker/engine/admin integration, provider adapters, real eval runner, knowledge publish, prompt/model/persona release, customer asset/order connector/distill/Business schema or real customer traffic.

## M3 LLM Gateway Routing Accounting Foundation

`M3-02-llm-gateway-routing-accounting-foundation` 引入 `packages/llm-gateway/src/index.ts` 的纯 package contract：

- task list mirrors M3-01 `llmTasks`: `intent_classify`、`kb_answer`、`vision_diag`、`speech_postprocess`、`summarize`、`profile_update`、`draft_reply`、`distill_daily`、`journey_import`、`eval_judge`。
- `createLlmRouteConfig` validates task、primary/fallback provider refs、timeout、input/output/total token budgets、cost budget and eval gate ref/status metadata。
- `createMockLlmProvider` is a deterministic mock provider/port for tests and local contract evidence only。
- `invokeLlmRoute` tries primary first, then configured fallbacks on deterministic failure、timeout or budget failure。
- Each invocation returns an accounting draft compatible with M3-01 `llm_call_log` shape: task、provider/model IDs、route ref/version、token counts、cost/latency、status、trace id、fallback summary、redaction/truncation metadata and optional prompt/completion hashes。

Boundary:

- This is an accounting draft only; M3-02 does not persist to DB and does not runtime import `packages/db`。
- No real provider, SDK, key, env var, customer LLM, raw sample or customer content is used。
- Accounting drafts must not contain raw prompt or raw completion。
- Customer-facing/draft tasks such as `kb_answer` and `draft_reply` require redaction metadata and reject internal config fields。
- Eval gate status is metadata only; production publish refusal remains M3-03。

## M3 KB Journey Capability Foundation

`M3-04-kb-journey-capability-foundation` 引入 `packages/capabilities/kb/src/index.ts` 的纯 package contract：

- `createKbJourney` normalizes synthetic/controlled journey and stage records, validates controlled journey/stage/material refs and keeps only bounded stage card fields.
- `answerKbJourneyStage` localizes a selected tutorial stage by stage key, title, localized title, aliases or trigger phrases.
- Successful selected output is stage-card-only: status `stage_card`, selected stage ref/key/title/sequence, concise answer, bounded steps, bounded material refs, next action and controlled refs. It does not return the full journey or all stage cards.
- Unknown stage input returns `clarification_required` with bounded stage options and no hallucinated answer.
- Ambiguous stage input returns `handoff_required` with bounded candidate refs and no generated answer.

Boundary:

- This is a pure capability foundation only; it does not persist to DB, import `packages/db`, call `packages/llm-gateway`, send outbound messages, publish knowledge or import another capability package.
- No raw owner tutorial pack, raw customer text, raw prompts, screenshots, voice transcripts or real sample content belongs in this contract or its evidence.
- F-01/H-01 remain foundation-only and not closed: full tutorial closeout still requires the owner material pack and future import/eval/admin evidence.

## M3 Pricing Capability And Quote Record Contract

`M3-05-pricing-capability-and-quote-record-contract` 引入 `packages/capabilities/pricing/src/index.ts` 的纯 package contract：

- `createPricingQuote` accepts structured pricing parameters from controlled sources, including LLM parameter candidates, but rejects any supplied price math such as total/final/LLM price fields or `source: "llm"`.
- Quote totals are calculated only by deterministic code using integer minor units and versioned config provenance (`configVersionId` or `configVersionRef`).
- `createQuoteRecordDraft` converts the code-created quote into an M3-01 compatible `quote_record draft` with `source: "code"`, `status: "created"`, `inputRef`, `result`, `currency`, `totalMinorUnits`, `validUntil` and config provenance.
- Unknown lane/service, missing currency, missing config provenance, negative/decimal/NaN money values and unsafe integer money values fail closed.
- Internal cost/profit/margin/threshold fields are rejected from pricing config/result surfaces; customer-facing quote output may carry controlled refs but must not expose internal pricing parameters.

Boundary:

- This is a pure capability foundation only; it does not persist to DB, import `packages/db`, call `packages/llm-gateway`, send outbound messages, integrate with engine/API/admin/worker or release production pricing.
- No real provider, SDK, pricing API, order connector, customer asset integration, raw samples, customer plaintext, order IDs, screenshots, voice transcripts, raw prompt/completion or secrets belong in this contract or evidence.
- F-04 remains foundation-only and not closed for production: DB persistence, E2E customer asset quote history, engine orchestration and release approval remain future specs.

## M3 Vision Screenshot Diagnostics Foundation

`M3-06-vision-screenshot-diagnostics-foundation` 引入 `packages/capabilities/vision/src/index.ts` 的纯 package contract：

- `createScreenshotDiagnosisInput` accepts only controlled screenshot refs: `storageRef` must use `storage://`, `manifestRef` must use `manifest://`, `redactionRef` must use `redaction://`, plus a supported screenshot kind (`order_page`, `merchant_chat`, `payment_page`).
- Raw screenshot content, data URLs, public URLs, file paths, base64/blob-ish payloads, raw OCR/text, customer plaintext and unknown free-text carrier fields are rejected before diagnosis.
- `evaluateScreenshotDiagnosis` validates synthetic controlled diagnosis candidates with page kind, required signals/checklist, confidence, bounded observations/actions, evidence refs and optional model/provider result refs as controlled refs only; candidate, observation/action and manifest shapes are strict allowlists.
- High-confidence controlled candidates return status `diagnosis_card` with diagnosis code/title, bounded observations/actions and controlled refs.
- Low confidence, missing required signals, ambiguous candidate, explicit uncertainty, unsafe input or unsupported screenshot kind fail closed to `handoff_required` or `uncertain`; the contract must not generate a confident answer.
- `createScreenshotSampleManifest` records count, category counts, `storage://` storage refs, `redaction://` redaction refs, `controlled://` expected-outcome refs, redaction method, access scope and owner confirmation status without raw screenshot content.

Boundary:

- This is a pure capability foundation only; it does not persist to DB, import `packages/db`, call `packages/llm-gateway`, import `packages/evals`, send outbound messages, integrate with engine/API/admin/worker or release production vision.
- No raw screenshots, OCR text, customer plaintext, Telegram payloads, voice transcripts, order IDs, phone/address/payment data, raw prompt/completion or secrets belong in this contract or evidence.
- F-02 remains foundation-only and not closed: full screenshot diagnostics acceptance still requires >=20 owner screenshot samples, real eval evidence and future integration/release approval.

## Verification

本契约的本地验证入口：

- `node --test scripts/tests/m3-vision-screenshot-diagnostics-foundation.test.mjs`
- `node --test scripts/tests/m3-pricing-capability-and-quote-record-contract.test.mjs`
- `node --test scripts/tests/m3-kb-journey-capability-foundation.test.mjs`
- `node --test scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs`
- `UZMAX_RLS_DATABASE_URL=postgresql://user:pass@localhost:5432/db npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs`
- `node --test scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs`
- `node --test scripts/tests/m2-telegram-bot-ingress.test.mjs`
- `node --test scripts/tests/m2-channel-conversation-foundation.test.mjs`
- `node --test scripts/tests/m1-02-api-access-context.test.mjs`
- `node --test scripts/tests/m1-platform-foundation.test.mjs`

SPK-03 / SPK-04 live harness 仍保留为外部环境验证入口：

- `npm run -w @uzmax/db spike:rls-prisma-pool`
- `npm run -w @uzmax/authz spike:dual-auth`

live harness 需要真实 Supabase/Postgres/Auth/Storage 环境变量和 secret；缺失 secret 时应 fail closed，不得用 mock 结果替代。

## Compatibility Boundary

M1-01/M1-02/M1-04 只提供平台 schema/authz 地基、API access-context shell、审计与配置版本 contract，不关闭完整 A-02、B-01、I-07 或生产 B-05：后台多账号 E2E、WebSocket guard、真实数据库审计 repository、业务表 RLS、完整日志中心/配置中心、eval runner、Telegram/AI/订单能力均由后续 spec 单独实现。不得提交 raw/export/jsonl/csv 样本、客户明文、截图或语音转写。
