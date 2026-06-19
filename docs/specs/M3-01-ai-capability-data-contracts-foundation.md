# M3-01 AI Capability Data Contracts Foundation

## 目标

建立 M3 AI 能力的最小 DB/schema/RLS/contracts 地基，覆盖 knowledge/tutorial/material refs、quote records、eval case/run/result/gate contracts 与 LLM call accounting/log contracts。

本 PR 是 M3 的 `packages/db` schema/contracts 全局串行点，只为后续 LLM gateway、eval gate、KB/tutorial、pricing、vision、speech 和 redline/breaker specs 提供稳定持久化契约。不实现 production、GA-0、真实客户流量、customer LLM、provider route release、prompt/model/persona release、knowledge publish、raw samples、runtime capability、admin UI、worker/API/engine integration、customer asset/order connector/distill/Business schema。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M3-01 只合并 DB/schema/contracts foundation，不代表 production、GA-0、真实客户流量、customer LLM、provider route release、prompt/model/persona release、knowledge publish、M3 closeout 或 F/G/H/J/K 验收项关闭。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-01-ai-data-contracts` / `codex/m3-01-ai-data-contracts` 中执行 spec、TDD RED/GREEN、schema/RLS/contracts、contracts/evals docs 与 evidence 更新；复核 `packages/db` 全局串行、allowed touch list、PR Hygiene、无 raw/customer/sample/secret 数据、无 provider claims、无测试弱化，并在 PR 中暴露未完成项。

## 时间盒

0.5 个工作日。若最小 schema/RLS/contracts 无法在预算内通过 focused test、Prisma validate 与本地 validation，则关闭本分支或拆小；不得夹带 runtime、provider、Business、customer asset、order connector、distill、admin 或 production 工作继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M3-01-ai-capability-data-contracts-foundation.md`
- `docs/contracts/README.md`
- `docs/evals/README.md`
- `docs/evidence/M3/README.md`
- `docs/evidence/M3/M3-01-ai-capability-data-contracts-foundation.md`
- `packages/db/prisma/schema.prisma`
- `packages/db/migrations/0004_ai_capability_data_contracts_foundation.sql`
- `packages/db/src/index.ts`
- `packages/db/src/m3-ai-contracts.ts`
- `scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 apps、其他 packages、package-lock、configs、generated/dist、prompts、real fixtures、raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、orders、phone/address/payment data、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 3；new source files <= 1；net source LOC <= 600。
- source = `packages/db/prisma/schema.prisma`、`packages/db/src/index.ts`、`packages/db/src/m3-ai-contracts.ts`。
- docs = this spec、contracts README、evals README、M3 evidence README、M3-01 evidence。
- generated = SQL migration `packages/db/migrations/0004_ai_capability_data_contracts_foundation.sql`。
- test = `scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs`。
- lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `kb_entry`、`kb_stage`、`media_asset`、`quote_record`、`eval_case`、`eval_run`、`eval_result`、`eval_gate`、`llm_call_log`、`M3 AI`、`LLM`、`Quote`。当前只有 v1.1 根文档、M3-00 readiness queue/evidence、M0 LLM data-processing evidence 和 M2-01 DB pattern 引用，没有可扩展的 M3 DB contract helper；`packages/db/src/index.ts` 已接近普通源文件 400 行预算，因此新增允许的 `packages/db/src/m3-ai-contracts.ts` 作为 M3 contract helper 归属，`index.ts` 仅 re-export。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增外部 API/provider/connector/adapter，不声明 provider 支持或 production route。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-01-ai-data-contracts`，分支必须是 `codex/m3-01-ai-data-contracts`。
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-00 spec/evidence、M3 evidence README、M2-01 spec/evidence、`docs/contracts/README.md`、`docs/evals/README.md`、`packages/db/prisma/schema.prisma`、`packages/db/src/index.ts` 和 M2-01 focused test。
- 开工前必须执行 `git fetch --prune`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url`。
- `packages/db` schema 变更为全局串行点；若 open PR 或未合并分支触碰 DB/schema/contracts/migration/DTO generator 并与本 spec 冲突，停止并报告 BLOCKED。
- ADR-003 dev-only/customer-LLM-blocked 边界仍生效：本 PR 不消费真实客户数据，不存 raw prompt/completion，不让真实客户消息、截图、语音转写或客户档案进入第三方 LLM。
- Owner-input blockers from M3-00 remain open: tutorial material pack, >=20 screenshot samples and Uzbek Latin/Cyrillic/Russian blind review block M3 closeout unless later repo evidence or owner branch decision exists.
- 并发派发证据：single worker, single linked worktree, single branch, single spec. This is the only active DB/schema PR at dispatch audit; touch modules are exactly the allowed list above. Schema, migration, Prisma model, generated DTO/contracts and shared data shape are globally serial.
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增本 M3-01 spec，限定 touch list、budget、DB global serial point、owner/AI boundary、failure branches、not-doing 和 acceptance mapping。
2. 新增 focused failing test `scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs`，覆盖 Prisma model/table mapping、SQL migration/RLS/grants、DB contract exports、contracts/evals docs 和 no-scope tables。
3. 运行 `node --test scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs`，记录 RED failure。
4. 在 Prisma schema 中新增最小 M3 models/enums：`kb_entry`、`kb_stage`、`media_asset`、`quote_record`、`eval_case`、`eval_run`、`eval_result`、`eval_gate`、`llm_call_log`。所有新表 tenant-scoped，带 `org_id`、`tenant_id`、tenant FK 和 scope-preserving cross-table FKs。
5. 新增 SQL migration `0004_ai_capability_data_contracts_foundation.sql`，包含 create type/table/index、forced RLS、基于 `app.org_id` / `app.tenant_id` 的 fail-closed select/insert/update policies、runtime role select/insert/update grants；不得 grant delete。
6. 在 `packages/db/src/m3-ai-contracts.ts` 暴露 M3 table names、status/category values 和纯 builders/validators；在 `packages/db/src/index.ts` 提供 data-URL-test-friendly direct exports，保持既有 exports。
7. 更新 `docs/contracts/README.md`、`docs/evals/README.md` 与 M3 evidence README，记录 M3 contract/eval persistence boundary、no production/customer LLM/raw sample boundary 和未关闭项。
8. 新增 M3-01 evidence，记录 scope、not-included boundaries、RED/GREEN、Prisma validate、validation table、acceptance mapping、sensitive-data boundary、future closure paths。
9. 运行 required validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：focused test 在实现前失败，失败原因是 M3 schema/migration/contracts/docs/evidence 缺失。
- GREEN：`node --test scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs` 通过。
- `UZMAX_RLS_DATABASE_URL=postgresql://user:pass@localhost:5432/db npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma` 通过。
- `npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run guard:doc-triggers`、`npm run guard:workspace`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-01-ai-capability-data-contracts-foundation.md --include-worktree`、`npm run test`、`git diff --check`、`git status --short --branch` 通过。
- 若 reasonable，运行 full `npm run check`；否则记录为什么 PR CI 是 full gate。
- 所有新增 tenant-scoped table 均带 `org_id`、`tenant_id`、tenant FK、force RLS、缺失 `app.org_id` / `app.tenant_id` fail closed。
- runtime role 只有 select/insert/update，无 delete。
- LLM call log 不存 raw prompt/completion，只允许 task、provider/model、route/version refs、token counts、cost/latency、status、trace id、redaction/truncation metadata、fallback/eval/redline summaries、hash/ref metadata。
- Quote record 支持 code-created quote result 和 config/version provenance，不允许 LLM-calculated price as source of truth。
- Eval case/run/result/gate 支持 gate status 与 category quotas；repo evidence 不提交 raw sample content。

## 失败分支

- 若 worktree 或 branch 不匹配：停止并报告；不得写错 checkout。
- 若发现 open PR 或未合并分支与 DB/schema/contracts 全局串行点冲突：停止并报告 BLOCKED。
- 若 schema/RLS 需要 customer asset、order connector、distill、Business 或 production schema：停止并拆到后续 M4/M5/M3 scoped spec；本 PR 只保留 M3 data-contract foundation。
- 若必须新增 full quick reply/template/candidate systems 才能验证：停止并拆分；本 PR 不实现完整 quick reply/template/candidate/distill 系统。
- 若 LLM call log 设计需要 raw prompt/completion/customer plaintext：不得合并，收窄为 hash/ref/redaction metadata 或关闭分支。
- 若 quote schema 让 LLM price 成为 source of truth：不得合并，改为 code/config provenance 或拆 spec。
- 若 eval docs/evidence 需要 raw sample content in git：不得合并，改为 manifest/ref/redacted payload shape only。
- 若 `packages/db/src/m3-ai-contracts.ts` 超过 lint line/complexity budget：收紧 helpers；不得把大量 logic 塞回 `index.ts`。

## 不做什么

- 不实现 production、GA-0、真实客户流量、customer LLM、provider route release、prompt/model/persona release、knowledge publish、AI persona release、Business release 或 1.0 release approval。
- 不实现 API、worker、engine、admin UI、provider adapter、runtime capability、real eval runner、prompt/model route、outbound send、storage upload、knowledge publish 或 confirmation queue。
- 不新增 customer asset/order connector/distill/Business schema。
- 不新增 full quick reply/template/candidate systems。
- 不提交 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw prompt/completion 或 secrets。
- 不让 LLM 做报价、SLA、成本、订单状态等数值判断；报价 source of truth 只能是 code/config + `quote_record` provenance。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-01 status | Future closure path |
|---|---|---|
| F-01 | foundation_queued_not_closed | `kb_entry`/`kb_stage` refs support later M3-04 tutorial stage localization; full tutorial closeout remains blocked by owner material pack |
| F-02 | foundation_queued_not_closed | `eval_case`/`eval_result` and `media_asset` refs can support later M3-06 screenshot diagnostics evidence; closeout remains blocked by >=20 owner screenshot samples |
| F-04 | foundation_queued_not_closed | `quote_record` supports code-created quote result and config/version provenance; pricing runtime remains M3-05 |
| F-05 | foundation_queued_not_closed | `llm_call_log` stores redaction/truncation/hash/ref summaries only; redline/context leakage checks remain M3-02/M3-03/M3-08 |
| G-01 | foundation_queued_not_closed | `llm_call_log` route/version refs support later M3-02 routing/fallback contracts |
| G-02 | foundation_queued_not_closed | `llm_call_log` provides accounting/log schema foundation; no cost dashboard or real provider calls |
| G-03 | foundation_queued_not_closed | `eval_gate`/`eval_run`/`eval_result` support later M3-03 publish-refusal semantics |
| G-05 | foundation_queued_not_closed | eval result/gate redline summaries support later false-positive tracking and admin evidence |
| G-06 | foundation_queued_not_closed | eval case/run/gate quotas support later full quota runner; no raw samples and no full >=200 closure claimed |
| H-01 | foundation_queued_not_closed | `kb_entry`/`kb_stage`/`media_asset` refs support later knowledge/resource management; no knowledge publish |
| J-05 | foundation_updated | M3-01 evidence records milestone contract foundation; no release signoff |
| K-03 | active | One spec / one PR |
| K-04 | active | This is the M3 `packages/db` global serial point; future overlapping specs must wait |

M3-01 closes no production acceptance item. It only provides DB/schema/contracts foundation for later specs and preserves all M3 closeout owner-input blockers.

## Closeout / Incident 记录

- Incident: none created by this spec at authoring time.
- Existing M2 workspace incident remains recorded under M2 evidence and guarded by workspace isolation rules; this M3-01 work runs in a dedicated linked worktree and does not change that incident or release boundaries.
