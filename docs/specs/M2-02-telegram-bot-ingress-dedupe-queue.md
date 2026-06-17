# M2-02 Telegram Bot Ingress Dedupe Queue

## 目标

实现最小 Telegram Bot webhook ingress / 归一化 / 本地幂等去重 / queue handoff baseline，为后续 M2 对话、接管、工单和 worker specs 提供安全入口。本 PR 只覆盖 Bot 入站 shell：验 secret、提取有限字段、按 `update_id` 去重、把可处理消息交给显式 queue port，并把 unsupported/deferred 更新安全确认。

本 PR 不实现 Telegram Business、出站发送、LLM、conversation engine、admin UI、worker consumer processing、真实 Redis/BullMQ、生产部署或真实客户流量。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M2-02 只合并 Bot ingress baseline，不代表 Bot production-ready、正式 webhook 已配置、真实客户流量、Telegram Business 可行、customer LLM、GA-0 或 M2 closeout。

AI agent：执行 spec、TDD RED/GREEN、官方 Telegram Bot API 依据核对、最小 runtime/contract/evidence 实现；复核触碰模块、PR Hygiene、无 DB schema 变更、无 raw Telegram payload/customer data、无 Business 自动化、无测试弱化，并在 PR 中暴露未完成项。

## 时间盒

0.5 个工作日。若最小 normalizer / webhook core / in-memory queue port 无法在预算内通过 focused test 与本地 validation，则关闭本分支或拆小；不得夹带 DB schema、Business、engine、worker、admin 或真实队列继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M2-02-telegram-bot-ingress-dedupe-queue.md`
- `docs/evidence/M2/M2-02-telegram-bot-ingress-dedupe-queue.md`
- `docs/contracts/README.md`
- `packages/channels/src/index.ts`
- `apps/api/src/telegram-bot.ts`
- `apps/api/src/app.module.ts`
- `scripts/tests/m2-telegram-bot-ingress.test.mjs`

说明/备注：

本 PR 只允许上述文件。未列出的模块默认不可改，尤其不得触碰 `packages/db/**`、`packages/engine/**`、`packages/capabilities/**`、`apps/admin/**`、`apps/worker/**`、`package-lock.json`、configs、generated files、raw payload/customer sample files。

## 变更预算与路径分类

- source 预算：changed source files <= 3、net source LOC <= 600、new source files <= 1。
- path categories：docs = spec/contracts/evidence；source = `packages/channels/src/index.ts`、`apps/api/src/telegram-bot.ts`、`apps/api/src/app.module.ts`；test = `scripts/tests/m2-telegram-bot-ingress.test.mjs`；generated = none；lock = none；config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `telegram`、`bot`、`webhook`、`queue`、`callback_query`、`update_id`、`business_message`；当前只有 v1.1 文档、M2-00/M2-01 specs/evidence/contracts、M0 Telegram manifest 和 DB schema 引用，没有可扩展的 Bot runtime。`apps/api/src/telegram-bot.ts` 是允许路径内的最小 API ingress shell 归属；`packages/channels/src/index.ts` 是允许路径内的 channel 归一化归属。
- 外部 API/SDK/provider/connector/adapter 依据：Telegram Bot API official docs only: https://core.telegram.org/bots/api。Relevant facts used: webhooks send HTTPS POST requests containing JSON-serialized `Update`; Telegram retries unsuccessful non-2xx webhook responses; `Update` has update types including `message` and `callback_query`; `allowed_updates` can limit update types; `update_id` is the dedupe key for repeated/out-of-order webhook updates; `secret_token` is echoed as `X-Telegram-Bot-Api-Secret-Token`.
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 `main` 已合并 M2-00 readiness pack 和 M2-01 DB/contracts foundation。
- 本分支必须从最新 `origin/main` 创建，且开工前完成 `git fetch --prune origin`、`git status --short --branch`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,url`。
- M2-01 已提供 `channel_connection` 与 `telegram_update_dedupe` foundation；本 PR 不触碰 `packages/db/**`，DB-backed dedupe/repository 属后续 work。
- SPK-01 Telegram Business 仍未关闭；本 PR 只把 `business_message` / `business_connection` 类更新标记为 unsupported/deferred，不新增 Business schema、feature flag、adapter 或可行性结论。
- ADR-003 仍阻断真实客户消息进入第三方 LLM；本 PR 不消费真实客户数据、Telegram payload files、screenshots、voice transcripts、订单号、电话、地址或支付信息。

## 实施步骤

1. 新增 focused failing test `scripts/tests/m2-telegram-bot-ingress.test.mjs`，覆盖 Bot update normalization、secret fail-closed、in-memory queue dedupe、unsupported/deferred handling 和 contract docs。
2. 运行 `node --test scripts/tests/m2-telegram-bot-ingress.test.mjs`，记录 RED failure。
3. 在 `packages/channels/src/index.ts` 新增纯 helper/types，把最小 Telegram Bot `Update` 归一化为 bounded internal ingress object：text message、photo/image message、voice message、callback_query、unsupported/deferred update。
4. 在 `apps/api/src/telegram-bot.ts` 新增最小 webhook core/service/controller：检查 `X-Telegram-Bot-Api-Secret-Token` 与 env/configured secret；未配置或不匹配 fail closed；成功时 normalize 并调用 queue port。
5. 新增显式 queue port 和 in-memory test implementation；默认 AppModule 使用 disabled queue，不声称真实 Redis/BullMQ ready。
6. 更新 `apps/api/src/app.module.ts` 注册 webhook controller/service、disabled queue provider 和 secret env provider。
7. 更新 `docs/contracts/README.md` 与 M2 evidence manifest，记录 contract、TDD、validation、未关闭项和 external API evidence。
8. 运行 focused GREEN 与 full validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：focused test 在实现前失败，失败原因是 M2-02 Bot ingress runtime/contracts 缺失。
- GREEN：`node --test scripts/tests/m2-telegram-bot-ingress.test.mjs` 通过。
- `npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run depcruise`、`npm run jscpd`、`npm run test`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-02-telegram-bot-ingress-dedupe-queue.md`、`npm run build` 通过。
- Webhook handler 只有 accepted、deduped 或 unsupported/deferred contract 才返回 2xx；missing/mismatched secret 和 disabled queue 返回非-2xx，不 enqueue。
- Normalized ingress object 不保存 raw Telegram payload wholesale，只保留 bounded provider update id、update kind、external refs、content kind、text/callback data/file ids 和 unsupported reason。
- Duplicate `update_id` 在 queue port 层 dedupe；DB-backed dedupe/repository 保留给后续 work。
- 本 PR 不触碰 DB schema、engine、capabilities、admin、worker、lockfile、configs、generated files 或 raw payload/customer samples。

## 失败分支

- 若 Bot webhook shell 需要 DB repository 才能保证去重：保留本地 queue-port contract 与 tests，DB-backed repository 拆到后续 M2 spec；不得修改 `packages/db/**`。
- 若真实 Redis/BullMQ 必须同步实现才能验证：停止在显式 queue port，不合入真实队列；worker/Redis/BullMQ 拆到后续 work。
- 若 Business update handling 需要 schema/feature flag/adapter：停止并等待 SPK-01/ADR-B01；本 PR 只允许 deferred unsupported classification。
- 若 secret 配置无法明确 fail closed：不得合并 webhook shell。
- 若 official Telegram Bot API docs 与实现假设冲突：以官方 docs 改 spec/evidence/code；不得引用 blog 或编造平台行为。

## 不做什么

- 不实现 Telegram Business、Business schema/feature flag/adapter、Business 自动回复、Business 草稿发送或 Business 可行性结论。
- 不实现出站 Bot 发送、素材发送、LLM、conversation engine、handoff/ticket API、admin UI、worker consumer processing、WebSocket、真实 Redis/BullMQ、生产部署、GA-0 或真实客户流量。
- 不修改 `packages/db/**`、`packages/engine/**`、`packages/capabilities/**`、`apps/admin/**`、`apps/worker/**`、`package-lock.json`、configs 或 generated files。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payload files、screenshots、voice transcripts、订单号、电话、地址、支付信息或客服个人账号。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M2-02 status | Future closure path |
|---|---|---|
| C-01 | foundation_partial_evidence | Bot text/image/voice/callback updates normalize and hand off to explicit queue port with local dedupe; staging bot and worker processing remain later |
| C-02 | foundation_partial_evidence | Unsupported/deferred updates return safe contract without retry loop; unreachable/blocking and broader Telegram edge cases remain later |
| C-03 / C-04 / C-05 | remains_SPK-01 | Telegram Business remains pending SPK-01 / ADR-B01; no feasibility claim |
| D-01 | not_closed | Conversation filters/states remain M2-04 admin/API work |
| D-02 | not_closed | Handoff/ticket creation, summary, SLA and notification remain M2-03 |
| D-03 | not_closed | Ticket claim/lock/note/escalate/close/reopen remain M2-03/M2-04 |
| I-01 | not_closed | Desktop conversation/ticket workflows remain M2-04 and broader 1.0 |
| I-04 | not_closed | WS/realtime or degraded polling evidence remains M2-05 |
| J-05 | active | M2-02 evidence records milestone acceptance progress without M6 pile-up |
| K-03 | active | One spec / one PR |
| K-04 | active | Touch list is explicit; `packages/db` remains untouched and serial for future DB work |

M2-02 does not close C-01/C-02 completely and does not close any D/I item. It only provides Bot ingress foundation/partial evidence for later M2 specs.
