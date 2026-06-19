# M3-03 Eval Gate Redline Runner

## 目标

实现 M3 `packages/evals` 的纯 eval gate/redline runner foundation，覆盖 M3 eval category/status vocabulary、manifest/ref/redacted payload shape validation、category quota fail-closed、internal threshold/cost/profit/margin/config leakage detection，以及 prompt/knowledge/model route/persona publish refusal decision semantics。

本 PR 只关闭 G-03/F-05 的 foundation slice：prompt/knowledge/model route/persona publish cannot bypass a passed eval gate result. It does not implement production publish API, admin UI, API/worker/engine integration, persistence, provider calls, real eval fixtures, prompt/model/persona release, knowledge publish, M3-08 breaker radius/output guard, GA-0 or real customer traffic.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本 PR 只合并 pure eval gate/redline runner foundation，不代表 production、GA-0、真实客户流量、customer LLM、provider route release、prompt/model/persona release、knowledge publish、M3 closeout、G-06 full 200 closure 或 1.0 release approval。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-03-eval-gate-redline-runner` / `codex/m3-03-eval-gate-redline-runner` 中执行 spec、TDD RED/GREEN、evals package implementation、focused test、eval/evidence docs、validation、commit、push、PR；复核 no raw samples/customer content/raw prompt/completion、no DB schema/migration、no real provider/SDK/key/env、no production publish integration、no test weakening。

## 时间盒

0.5 个工作日。若 eval gate/redline runner foundation 无法在预算内通过 focused test 与本地 validation，则关闭或拆小；不得夹带 API/admin/worker/engine、provider、DB schema、M3-08 breaker/output guard、real fixture 或 production release work 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M3-03-eval-gate-redline-runner.md`
- `packages/evals/src/index.ts`
- `scripts/tests/m3-eval-gate-redline-runner.test.mjs`
- `docs/evals/README.md`
- `docs/evidence/M3/README.md`
- `docs/evidence/M3/M3-03-eval-gate-redline-runner.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `packages/db` schema/migrations/generated DTOs、`packages/llm-gateway`、apps、worker/API/engine/admin integration、provider SDKs、configs、lockfile、prompts、real eval fixtures、raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、orders、phone/address/payment data、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 1；new source files <= 0；net source LOC <= 450，且 `packages/evals/src/index.ts` 尽量保持普通源文件 <= 400 行。
- source = `packages/evals/src/index.ts`。
- test = `scripts/tests/m3-eval-gate-redline-runner.test.mjs`。
- docs = this spec、evals README、M3 evidence README、M3-03 evidence。
- generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `M3-03`、`evaluateM3`、`m3RequiredCategory`、`redline`、`publish gate`、`evalGate`、`evalCategories`、`EvalGateStatus`；当前只有 M1 seed runner、M3-01 DB contract vocabulary 与 M3-02 metadata hook，M3-03 应就地扩展 `packages/evals/src/index.ts`。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增外部 API/provider/SDK/connector/adapter，不声明 real provider 支持或 production route。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-03-eval-gate-redline-runner`，分支必须是 `codex/m3-03-eval-gate-redline-runner`。
- Base 必须是 `origin/main` at `15801bd896700a7bb19d029fd5cfab59f57ec8ad` at dispatch.
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url`。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-00/M3-01/M3-02 spec/evidence、`docs/evals/README.md`、`docs/contracts/README.md`、`packages/evals/src/index.ts`、`scripts/tests/eval-gate.test.mjs`、`scripts/guards/eval-trigger-paths.mjs`、M3-01/M3-02 focused tests。
- 若 open PR 或未合并分支与 `packages/evals` eval gate/redline runner touch modules 冲突，停止并报告 BLOCKED。
- ADR-003 dev-only/customer-LLM-blocked 边界仍生效：本 PR 不消费真实客户数据，不存 raw prompt/completion，不让真实客户消息、截图、语音转写或客户档案进入第三方 LLM。
- Owner-input blockers from M3-00 remain open: tutorial material pack, >=20 screenshot samples and Uzbek Latin/Cyrillic/Russian blind review block M3 closeout unless later repo evidence or owner branch decision exists.
- 并发派发证据：single worker, single linked worktree, single branch, single spec. Touch modules are exactly the allowed list above. No schema, migration, lockfile, shared config, CI/guard script, generated artifact or release/production gate edits.
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增本 M3-03 spec，限定 touch list、budget、owner/AI boundary、failure branches、not-doing 和 acceptance mapping。
2. 新增 focused failing test `scripts/tests/m3-eval-gate-redline-runner.test.mjs`，覆盖 M3 category/status parity、safe payload shape、quota fail-closed、redline leakage/false-positive behavior、publish refusal semantics and safe summaries。
3. 运行 focused test 并记录 RED failure。
4. 在 `packages/evals/src/index.ts` 实现纯 exports：M3 categories/status constants、`createM3EvalCase`、`detectRedlineLeakage`、`evaluateM3EvalGate`、`decideM3PublishGate`、`m3RequiredCategoryQuotas` and safe evidence summary builders。
5. 更新 `docs/evals/README.md`、M3 evidence README 和 M3-03 evidence；不得 overclaim M3 closeout、production publish API、admin UI、real fixtures、full G-06 closure 或 M3-08 breaker/output guard。
6. 运行 required validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：focused test 在实现前失败，失败原因是 M3-03 eval runner exports/behavior/docs 缺失。
- GREEN：`node --test scripts/tests/m3-eval-gate-redline-runner.test.mjs` 通过。
- Runner category/status constants match M3-01 persisted vocabulary where relevant without runtime importing `packages/db`。
- Gate run accepts only manifest/ref/redacted payload shapes and rejects raw prompt/completion/customer text。
- Category quotas fail closed: missing `redline_attack`、`redline_false_positive`、`language` or required target category coverage blocks gate pass。
- Redline checks detect internal threshold/cost/profit/margin/config leakage in prompt/context/output-shaped strings, while normal business numbers in redacted false-positive cases do not block a passed gate。
- Publish decision refuses prompt/knowledge/model_route/persona changes unless matching eval gate result is `passed`, not stale, and has required categories/quotas/redline checks。
- Failed/blocked/pending/stale gate results refuse publish with safe reason codes。
- Runner evidence summaries expose only aggregate status, reason codes, category counts and controlled refs; no raw sample content or raw prompt/completion leaks into summaries。
- Required validation passes or is honestly recorded: focused test, `npm run eval:minimal`, `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run guard:eval-triggers -- --base origin/main`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-03-eval-gate-redline-runner.md --include-worktree`, `npm run test`, `npm run check` if feasible, `git diff --check`, final `git status --short --branch`。

## 失败分支

- 若 worktree 或 branch 不匹配：停止并报告；不得写错 checkout。
- 若发现 open PR 或未合并分支与 eval gate/redline shared touch modules 冲突：停止并报告 BLOCKED。
- 若 implementation 需要 real fixtures、raw samples、raw prompt/completion、customer plaintext、screenshots、voice transcripts、provider SDK、LLM key、env vars、real provider calls 或 customer LLM：不得合并，收窄为 synthetic/redacted/ref-only contract 或关闭分支。
- 若 runner 需要 DB schema/migration/generated DTO changes：停止并拆回 DB scoped spec；本 PR 不触碰 DB。
- 若 publish refusal requires API/admin/worker/engine integration：defer to future integration spec；M3-03 only returns pure refusal decision semantics。
- 若 breaker radius/output guard behavior is needed to pass：defer to M3-08；M3-03 may return redline/publish refusal decisions only。
- 若 G-06 full >=200 closure is needed：defer to later full eval-set spec；M3-03 only enforces foundation quotas against provided cases/results。
- 若 source LOC exceeds budget or lint complexity/line limits fail：收紧 helpers；不得 add parallel source file without new spec/budget。

## 不做什么

- 不实现 production、GA-0、真实客户流量、customer LLM、provider route release、prompt/model/persona release、knowledge publish、AI persona release、Business release、M3 closeout 或 1.0 release approval。
- 不实现 API、worker、engine、admin UI、provider adapter、real eval fixtures、real eval judge provider calls、prompt/model route release integration、outbound send、storage upload、persistence、M3-08 breaker radius/output guard 或 full G-06 200 target closure。
- 不修改 DB schema/migrations/generated DTOs，不 runtime import `packages/db`。
- 不提交 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw prompt/completion 或 secrets。
- 不让 LLM 做报价、SLA、成本、订单状态等数值判断。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-03 status | Notes |
|---|---|---|
| F-05 | foundation_implemented_not_closed | Redline leakage detector blocks internal threshold/cost/profit/margin/config leakage in prompt/context/output-shaped strings; no production output guard or breaker radius. |
| G-03 | foundation_implemented_not_closed | Pure publish decision semantics refuse prompt/knowledge/model_route/persona publish unless the matching eval gate passes required quotas/redline checks. No production publish API/admin integration. |
| G-05 | foundation_queued_not_closed | Redline false-positive cases can pass when marked passed and leak-free; no admin false-positive dashboard. |
| G-06 | partial_foundation_not_closed | Required foundation categories/quotas fail closed for supplied cases/results; full 1.0 >=200 target remains future. |
| J-05 | foundation_updated | This evidence records M3-03 eval gate foundation; no release signoff. |
| K-02 | foundation_supported | `packages/evals/**` remains eval-triggered by existing guard; no guard widening in this PR. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at dispatch audit. |

M3-03 closes no production acceptance item. It only provides pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Closeout / Incident 记录

- Incident: none created by this spec at authoring time.
- Existing M2 workspace incident remains recorded under M2 evidence and guarded by workspace isolation rules; this M3-03 work runs in a dedicated linked worktree and does not change that incident or release boundaries.
