# M3-02 LLM Gateway Routing Accounting Foundation

## 目标

实现 M3 `llm-gateway` 的纯 package foundation：任务级路由、primary/fallback、timeout/cost/token budgets、deterministic mock provider/port、eval gate metadata hook 和 `llm_call_log` 兼容 accounting draft。

本 PR 只关闭 G-01/G-02 的 foundation slice：无真实 provider、无 provider SDK、无 LLM key、无 customer LLM、无 API/worker/engine/admin integration、无 production/GA-0、无 prompt/model route release、无 eval publish refusal semantics。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本 PR 仅合并 M3-02 gateway package foundation，不代表 production、GA-0、真实客户流量、customer LLM、provider route release、prompt/model/persona release、knowledge publish、M3 closeout 或 1.0 release approval。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-02-llm-gateway-routing-accounting` / `codex/m3-02-llm-gateway-routing-accounting` 中执行 spec、TDD RED/GREEN、gateway implementation、focused test、contracts/evals/evidence updates、validation、commit、push、PR；复核 no external provider/SDK/key/env/customer content、no raw prompt/completion、no DB schema/import/persistence、no test weakening。

## 时间盒

0.5 个工作日。若 route/accounting foundation 无法在预算内通过 focused test 与本地 validation，则关闭或拆小；不得夹带 provider adapter、API/worker/engine/admin、eval runner 或 production work 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M3-02-llm-gateway-routing-accounting-foundation.md`
- `packages/llm-gateway/src/index.ts`
- `scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs`
- `docs/contracts/README.md`
- `docs/evals/README.md`
- `docs/evidence/M3/README.md`
- `docs/evidence/M3/M3-02-llm-gateway-routing-accounting-foundation.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `packages/db` schema/migrations/generated DTOs、apps、worker/API/engine/admin integration、provider SDKs、configs、lockfile、prompts、real eval fixtures、raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、orders、phone/address/payment data、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 1；new source files <= 0；net source LOC <= 400。
- source = `packages/llm-gateway/src/index.ts`。
- test = `scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs`。
- docs = this spec、contracts README、evals README、M3 evidence README、M3-02 evidence。
- generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `llm-gateway`、`llmTasks`、`llm_call_log`、`route`、`fallback`、`provider`、`accounting`、`evalGate`；当前 `packages/llm-gateway/src/index.ts` 只有 placeholder export，M3-01 在 `packages/db/src/m3-ai-contracts.ts` 提供 task/status/log shape，M3-02 应就地扩展 llm-gateway package。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增外部 API/provider/SDK/connector/adapter，不声明 real provider 支持或 production route。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-02-llm-gateway-routing-accounting`，分支必须是 `codex/m3-02-llm-gateway-routing-accounting`。
- Base 必须是 `origin/main` at `3d6666b88646b24634aa952b22708e2569b0fede` at dispatch.
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url`。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-00 spec/evidence、M3-01 spec/evidence、`docs/contracts/README.md`、`docs/evals/README.md`、`packages/llm-gateway/src/index.ts`、`packages/evals/src/index.ts`、`packages/db/src/m3-ai-contracts.ts` 和 related focused tests。
- 若 open PR 或未合并分支与 `packages/llm-gateway` routing/accounting/eval hook touch modules 冲突，停止并报告 BLOCKED。
- ADR-003 dev-only/customer-LLM-blocked 边界仍生效：本 PR 不消费真实客户数据，不存 raw prompt/completion，不让真实客户消息、截图、语音转写或客户档案进入第三方 LLM。
- Owner-input blockers from M3-00 remain open: tutorial material pack, >=20 screenshot samples and Uzbek Latin/Cyrillic/Russian blind review block M3 closeout unless later repo evidence or owner branch decision exists.
- 并发派发证据：single worker, single linked worktree, single branch, single spec. Touch modules are exactly the allowed list above. No schema, migration, lockfile, shared config, CI/guard script, generated artifact or release/production gate edits.
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增本 M3-02 spec，限定 touch list、budget、owner/AI boundary、failure branches、not-doing 和 acceptance mapping。
2. 新增 focused failing test `scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs`，覆盖 task list parity、route validation、fallback on failure/timeout/budget failure、accounting draft shape、安全/redaction boundary 和无 provider SDK/key/customer content。
3. 运行 focused test 并记录 RED failure。
4. 在 `packages/llm-gateway/src/index.ts` 实现纯 contracts：task/status constants、route config builder/validator、mock provider factory/port、invoke route function、budget checks、accounting draft builder。
5. 更新 `docs/contracts/README.md`、`docs/evals/README.md`、M3 evidence README 和 M3-02 evidence；不得 overclaim M3 closeout。
6. 运行 required validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：focused test 在实现前失败，失败原因是 M3-02 gateway exports/behavior 缺失。
- GREEN：`node --test scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs` 通过。
- Gateway exports task list matching M3-01 `llmTasks` values without runtime importing `packages/db`。
- Route config validates primary/fallback provider refs、task、timeout、input/output/total token budgets、cost budget、eval gate ref/status metadata。
- Invocation tries primary, then fallback on deterministic failure、timeout or budget failure。
- Accounting draft records task、providerId、modelId、routeRef/version、token counts、costMicros、latencyMs、status (`succeeded` / `failed` / `fallback`)、traceId、fallbackSummary、redaction/truncation metadata and never raw prompt/completion。
- Customer-facing/draft tasks disallow internal config fields and require redaction metadata。
- No real provider/SDK/key/env/customer content is used。
- Required validation passes or is honestly recorded: focused test, `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run guard:eval-triggers -- --base origin/main`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-02-llm-gateway-routing-accounting-foundation.md --include-worktree`, `npm run test`, `npm run check` if feasible, `git diff --check`, final `git status --short --branch`。

## 失败分支

- 若 worktree 或 branch 不匹配：停止并报告；不得写错 checkout。
- 若发现 open PR 或未合并分支与 llm-gateway routing/accounting shared touch modules 冲突：停止并报告 BLOCKED。
- 若 implementation 需要 provider SDK、LLM key、env vars、real provider calls、customer LLM、raw samples 或 raw prompt/completion：不得合并，收窄为 deterministic mock port 或关闭分支。
- 若 gateway 需要 DB schema/migration/generated DTO changes：停止并拆回 `packages/db` scoped spec；本 PR 不触碰 DB。
- 若 eval gate publish refusal semantics are needed to pass: defer to M3-03; this PR only carries route metadata/status hooks。
- 若 customer-facing/draft tasks need internal cost/threshold/profit config in prompt/input/output：不得合并，改为 redacted metadata/ref-only shape。
- 若 source LOC exceeds budget or lint complexity/line limits fail：收紧 helpers；不得 add parallel source file without new spec/budget。

## 不做什么

- 不实现 production、GA-0、真实客户流量、customer LLM、provider route release、prompt/model/persona release、knowledge publish、AI persona release、Business release 或 1.0 release approval。
- 不实现 external provider/SDK/connector/adapter、API、worker、engine、admin UI、real eval runner、prompt/model route publish refusal、outbound send、storage upload 或 persistence。
- 不修改 DB schema/migrations/generated DTOs，不 runtime import `packages/db`。
- 不提交 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw prompt/completion 或 secrets。
- 不让 LLM 做报价、SLA、成本、订单状态等数值判断。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-02 status | Notes |
|---|---|---|
| F-05 | foundation_queued_not_closed | Customer-facing/draft route inputs require redaction metadata and disallow internal config fields; full redline runner/output guard remains M3-03/M3-08. |
| G-01 | foundation_implemented_not_closed | Task-level route/fallback works against deterministic mock providers only; no provider route release. |
| G-02 | foundation_implemented_not_closed | Accounting draft shape matches M3-01 `llm_call_log` allowed metadata; no persistence or dashboard. |
| G-03 | metadata_hook_only_not_closed | Eval gate ref/status is validated as metadata only; publish refusal semantics remain M3-03. |
| G-06 | not_closed | No eval quota runner or full >=200 closure. |
| J-05 | foundation_updated | This evidence records M3-02 gateway foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at dispatch audit. |

M3-02 closes no production acceptance item. It only provides pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Closeout / Incident 记录

- Incident: none created by this spec at authoring time.
- Existing M2 workspace incident remains recorded under M2 evidence and guarded by workspace isolation rules; this M3-02 work runs in a dedicated linked worktree and does not change that incident or release boundaries.
