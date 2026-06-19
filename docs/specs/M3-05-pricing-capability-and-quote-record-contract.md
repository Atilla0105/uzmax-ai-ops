# M3-05 Pricing Capability And Quote Record Contract

## 目标

实现 M3 `packages/capabilities/pricing` 的纯 package foundation：code-only quote calculation、LLM parameter extraction boundary、versioned config provenance、deterministic quote result 和 M3-01 `quote_record` draft compatible shape。

本 PR 只关闭 F-04 的 foundation slice：LLM 只能提供结构化参数候选，报价总额由 code + versioned config provenance 计算，并生成可落 `quote_record` 的 draft。它不实现 production、GA-0、真实客户流量、customer LLM、provider route release、engine/admin/API/worker integration、DB persistence、M3 closeout 或 1.0 release approval。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本 PR 仅合并 pricing capability and quote record contract foundation，不代表 production、GA-0、真实客户流量、customer LLM、provider route release、engine/admin/API 集成、M3 closeout、F-04 完整关闭或 1.0 release approval。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-05-pricing-capability-quote-contract` / `codex/m3-05-pricing-capability-quote-contract` 中执行 spec、TDD RED/GREEN、pricing package implementation、focused test、contracts/evidence 更新、validation、commit、push、PR；复核 no capability-to-capability import、no DB schema/migration/generated DTO edit、no DB/LLM/provider/admin/engine/API/worker integration、no raw/customer/sample/secret data、no test weakening，并在 PR 中暴露 foundation-only 边界。

## 时间盒

0.5 个工作日。若 pricing foundation 无法在预算内通过 focused test 与本地 validation，则关闭或拆小；不得夹带 DB schema、real provider、LLM key、engine/API/admin integration、真实报价样例、订单/客户资产、eval fixture 或 production work 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M3-05-pricing-capability-and-quote-record-contract.md`
- `packages/capabilities/pricing/src/index.ts`
- `scripts/tests/m3-pricing-capability-and-quote-record-contract.test.mjs`
- `docs/contracts/README.md`
- `docs/evidence/M3/README.md`
- `docs/evidence/M3/M3-05-pricing-capability-and-quote-record-contract.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `packages/db` schema/migrations/generated DTOs、`packages/db/src/**`、`packages/llm-gateway/**`、`packages/evals/**`、`packages/engine/**`、apps、worker/API/admin integration、provider SDKs、configs、lockfile、prompts、real eval fixtures、raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、orders、phone/address/payment data、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 1；new source files <= 0；net source LOC <= 400。
- source = `packages/capabilities/pricing/src/index.ts`。
- test = `scripts/tests/m3-pricing-capability-and-quote-record-contract.test.mjs`。
- docs = this spec、contracts README、M3 evidence README、M3-05 evidence。
- generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `pricing`、`quote`、`QuoteRecord`、`createQuoteRecordContract`、`totalMinorUnits`、`configVersionRef`、`capabilities/pricing`；当前 `packages/capabilities/pricing/src/index.ts` 只有 placeholder export，M3-01 在 `packages/db/src/m3-ai-contracts.ts` 提供 `quote_record` contract builder，M3-05 应就地扩展 pricing package。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增外部 API/provider/SDK/connector/adapter，不声明 real provider 支持或 production route。
- 是否需要例外：none。

## 文档触发检查

updated

判断依据：`docs/doc-gates.md`。本 PR 新增 pricing package runtime contract，因此更新 `docs/contracts/README.md` 与 M3 evidence README；不新增 schema/migration/generated DTO/OpenAPI、eval fixtures/real eval runner、observability、environment validation、release workflow、production runtime、external provider/connector/adapter 或 runbook 触发项。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-05-pricing-capability-quote-contract`，分支必须是 `codex/m3-05-pricing-capability-quote-contract`。
- Base 必须是 `origin/main` at `6c0f382443d00bab7a3b2162a6ee51596820b4ae` at dispatch after M3-04 merge。
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url`。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-00/M3-01/M3-02/M3-03/M3-04 spec/evidence、`docs/contracts/README.md`、M3 evidence README、`packages/capabilities/pricing/src/index.ts`、`packages/db/src/m3-ai-contracts.ts` 和 related focused tests。
- 若 open PR 或未合并分支与 `packages/capabilities/pricing`、M3 contracts/evidence or allowed docs touch modules 冲突，停止并报告 BLOCKED。
- ADR-003 dev-only/customer-LLM-blocked 边界仍生效：本 PR 不消费真实客户数据，不存 raw prompt/completion，不让真实客户消息、截图、语音转写或客户档案进入第三方 LLM。
- Owner-input blockers from M3-00 remain open: tutorial material pack, >=20 screenshot samples and Uzbek Latin/Cyrillic/Russian blind review block M3 closeout unless later repo evidence or owner branch decision exists.
- 并发派发证据：single worker, single linked worktree, single branch, single spec. Touch modules are exactly the allowed list above. No schema, migration, lockfile, shared config, CI/guard script, generated artifact or release/production gate edits.
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-05-pricing-capability-quote-contract` |
| `git status --short --branch` | `## codex/m3-05-pricing-capability-quote-contract...origin/main`; inherited uncommitted half-finished changes: `M packages/capabilities/pricing/src/index.ts`, `?? docs/specs/M3-05-pricing-capability-and-quote-record-contract.md`, `?? scripts/tests/m3-pricing-capability-and-quote-record-contract.test.mjs` |
| `git branch --show-current` | `codex/m3-05-pricing-capability-quote-contract` |
| `git branch --no-merged main` | no branch output |
| `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` | `[]` |
| base | `HEAD` was `6c0f382443d00bab7a3b2162a6ee51596820b4ae` before edits |
| dependency setup | `node_modules` present at takeover; `npm ci` not rerun because dependencies were already installed |

No open PR conflict or unmerged branch conflict was found at start.

## 实施步骤

1. 新增本 M3-05 spec，限定 touch list、budget、owner/AI boundary、failure branches、not-doing 和 acceptance mapping。
2. 新增 focused failing test `scripts/tests/m3-pricing-capability-and-quote-record-contract.test.mjs`，覆盖 package exports、code-only deterministic quote、LLM parameter candidate boundary、invalid money/config/lane/service fail closed、quote record draft compatible with M3-01 `createQuoteRecordContract`、no sensitive cost/profit/threshold leakage、foundation-only docs/evidence。
3. 运行 focused test 并记录 RED failure。
4. 在 `packages/capabilities/pricing/src/index.ts` 实现纯 exports：pricing status/source constants、pricing config validation、structured parameter validation、deterministic quote calculation、quote record draft builder。
5. 更新 `docs/contracts/README.md`、M3 evidence README 和 M3-05 evidence；不得 overclaim F-04 full closure、production、DB persistence、engine/admin/API integration or real customer LLM。
6. 运行 required validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：focused test 在实现前失败，失败原因是 M3-05 pricing exports/behavior/docs/evidence 缺失。
- GREEN：`node --test scripts/tests/m3-pricing-capability-and-quote-record-contract.test.mjs` 通过。
- Pricing package remains pure: no DB runtime import, no LLM/provider call, no process env, no outbound send, no other capability imports。
- LLM parameter candidates are accepted only as structured parameters; any input carrying calculated total/final/LLM price or `source: "llm"` fails closed。
- Quote calculation is deterministic and uses integer minor units from code + versioned config provenance only。
- Quote result includes traceable `inputRef`, `result`, `currency`, `totalMinorUnits`, `validUntil`, `configVersionRef` or `configVersionId`, `source: "code"` and `status: "created"` when converted to quote record draft。
- Negative, decimal, NaN or unsafe integer money values, missing currency, missing config version, unknown lane and unknown service fail closed。
- Internal cost/profit/margin/threshold fields do not enter quote result or customer-facing summary; controlled refs/metadata may be used instead。
- Required validation passes or is honestly recorded: focused test, `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run depcruise`, `npm run jscpd`, `npm run knip`, `npm run guard:forbidden-terms`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-05-pricing-capability-and-quote-record-contract.md --include-worktree`, `git diff --check`, `npm run check` if feasible, final `git status --short --branch`。

## 失败分支

- 若 worktree 或 branch 不匹配：停止并报告；不得写错 checkout。
- 若发现 open PR 或未合并分支与 pricing capability/contracts/evidence touch modules 冲突：停止并报告 BLOCKED。
- 若 implementation 需要 `packages/db` schema/migration/generated DTO changes 或 `packages/db/src/**` edits：停止并拆回 DB scoped spec；本 PR 不触碰 DB。
- 若 implementation 需要 provider SDK、LLM key、env vars、real provider calls、customer LLM、raw samples、raw prompt/completion、customer plaintext、orders、screenshots、voice transcripts 或 Telegram payloads：不得合并，收窄为 pure contract or close branch。
- 若 quote calculation needs order/customer asset connector or real pricing API：停止并拆到 later scoped spec；本 PR 只做 code/config foundation。
- 若 output needs internal cost/profit/margin/threshold fields to explain pricing：不得合并，改为 controlled refs/metadata or owner-reviewed future spec。
- 若 source LOC exceeds budget or lint complexity/line limits fail：收紧 helpers；不得 add parallel source file without new spec/budget。

## 不做什么

- 不实现 production、GA-0、真实客户流量、customer LLM、real provider route release、prompt/model/persona release、AI persona release、Business release、M3 closeout、F-04 full closure 或 1.0 release approval。
- 不实现 DB persistence、Prisma schema/migration、generated DTO、API、worker、engine orchestration、admin UI、real eval fixtures、real pricing provider/adapter、order connector/customer asset integration、outbound send、storage upload、confirmation queue 或 distill。
- 不修改 `packages/db/src/**`；M3-01 `createQuoteRecordContract` remains the existing compatibility target.
- 不提交 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw prompt/completion 或 secrets。
- 不让 LLM 做报价、SLA、成本、订单状态等数值判断。
- 不泄露 internal cost/profit/margin/threshold fields into quote result or customer-facing output。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-05 status | Notes |
|---|---|---|
| F-04 | foundation_implemented_not_closed | Code-only deterministic quote calculation and quote record draft contract exist for synthetic controlled fixtures; DB persistence, E2E and production quote flow remain future. |
| F-05 | foundation_supported_not_closed | Pricing output excludes internal cost/profit/margin/threshold fields; broader redline output guard remains M3-08/future integration. |
| D-04 | foundation_queued_not_closed | Quote record draft shape can support future customer asset quote history; no customer asset center integration. |
| J-05 | foundation_updated | This evidence records M3-05 pricing foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at dispatch audit. |

M3-05 closes no production acceptance item. It only provides pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Closeout / Incident 记录

- Incident: none created by this spec at authoring time.
- Existing M2 workspace incident remains recorded under M2 evidence and guarded by workspace isolation rules; this M3-05 work runs in a dedicated linked worktree and does not change that incident or release boundaries.
