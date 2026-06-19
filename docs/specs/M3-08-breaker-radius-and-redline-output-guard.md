# M3-08 Breaker Radius And Redline Output Guard

## 目标

实现 M3 `packages/engine` 的纯 foundation：user-level、user+capability、capability-level、global breaker radius decision semantics，redline output guard behavior，以及 safe degradation / handoff contract evidence。

本 PR 只提供 foundation-only contract 和证据：不关闭 production F-06/L-02，不接真实流量，不发布 prompt/persona/model route，不做 API/worker/admin/DB persistence。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本 PR 只作为 M3-08 foundation slice，不代表 production、GA-0、真实客户流量、customer LLM、红线样本发布、模型路由发布、AI persona release、F-06/L-02 closeout 或 1.0 release approval。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-08-breaker-radius-redline-output-guard` / `codex/m3-08-breaker-radius-redline-output-guard` 中执行 spec、focused test、pure engine contract、contracts/evidence 更新；复核 engine purity、allowed touch list、PR Hygiene、no raw data/secrets、无 provider claims、无测试弱化，并在 PR 中暴露未完成项。

## 时间盒

0.5 个工作日。若 worktree/branch 不匹配、依赖安装失败、touch list 需要扩大到 production integration、或发现 raw/sensitive sample 内容，停止并报告，不扩大本 PR 范围。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M3-08-breaker-radius-and-redline-output-guard.md`
  - `packages/engine/src/index.ts`
  - `scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs`
  - `docs/contracts/README.md`
  - `docs/evidence/M3/README.md`
  - `docs/evidence/M3/M3-08-breaker-radius-and-redline-output-guard.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 未列出的模块默认不可改。不得触碰 `packages/evals/**`、`packages/db/**`、`packages/llm-gateway/**`、`packages/capabilities/**`、apps、worker/API/admin integration、provider SDKs、configs、lockfile、prompts、real eval fixtures、raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、orders、phone/address/payment data、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 1；new source files <= 0；net source LOC <= 400。
- test 预算：新增 focused Node test <= 1。
- path categories：
  - source: `packages/engine/src/index.ts`
  - test: `scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs`
  - docs: this spec, contracts README, M3 evidence README, M3-08 evidence
  - generated/lock/config: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `breaker`、`redline output`、`redline/output`、`output policy`、`safe degradation`、`handoff`、`engineSafety`、`safety` 于 `packages`、`docs`、`scripts/tests`。当前 M3-03 只提供 eval redline runner，M3-02 只提供 route/accounting boundary，capability packages 只提供各自纯 contract；`packages/engine/src/index.ts` 只有 placeholder export，因此本 PR 就地扩展 engine package。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，不声明 provider 支持或 production route。
- 是否需要例外：none。

## 文档触发检查

- 结果：updated
- 判断依据：`docs/doc-gates.md`。本 PR 更新 contracts/evidence because it introduces an engine contract foundation; it does not trigger provider, environment, runbook, schema, OpenAPI, generated DTO or production release docs.

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-08-breaker-radius-redline-output-guard`，分支为 `codex/m3-08-breaker-radius-redline-output-guard`。
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、`git rev-parse HEAD`、`npm ci`、root/main status。
- Base 必须是 `origin/main` at `f7750cd76f871b527a0de349cc27b3dac99bb2b7` at dispatch after M3-07 merge。
- 开工前必须重读 `AGENTS.md`、`docs/specs/README.md`、`docs/specs/M3-00-ai-capability-readiness-pack.md`、M3-03 evidence、`docs/contracts/README.md`、M3 evidence README、指定 v1.1 根文档条目和当前 code/test files。
- 并发派发证据：single worker, single linked worktree, single branch, single spec; touch modules listed above; no DB schema, shared config, CI/guard script, generated artifact, provider route or production gate edits。

## 实施步骤

1. 新增本 M3-08 spec，限定 touch list、budget、owner/AI boundary、failure branches、not-doing 和 acceptance mapping。
2. 新增 focused failing test `scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs`，覆盖 exports/purity/no forbidden imports、user/capability/global radius decisions、single-user attack not global、systemic risk global、redline output suppression/no echo、false-positive safe numbers、safe degradation/handoff shape、docs/evidence/spec wording。
3. 就地扩展 `packages/engine/src/index.ts`，只暴露 deterministic pure helpers and constants。
4. 更新 `docs/contracts/README.md`、M3 evidence README 和 M3-08 evidence；不得 overclaim F-06/L-02 closeout、production, DB persistence, engine/admin/API/worker integration, provider route or real sample availability。
5. 运行 required validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 记录：focused test 在实现前失败，失败原因是 M3-08 engine exports/behavior/docs/evidence 缺失。
- Engine exports deterministic constants/helpers for breaker scopes, safety statuses, `evaluateBreakerRadius`, `guardRedlineOutput`, and `decideEngineSafetyAction`。
- `packages/engine/src/index.ts` does not import evals/db/llm-gateway/capability packages and contains no provider SDK/env/process usage。
- Single-user attack cannot return global shutdown; user+capability attack scopes to user+capability; repeated capability failure disables only the named capability; systemic/cross-user/cross-capability risk escalates to global safe degradation。
- Redline output guard suppresses customer-facing output that leaks internal config, threshold, cost, profit, margin, private route/budget/guard values and does not echo unsafe output。
- False-positive path allows ordinary synthetic numbers such as weight/size/count, controlled refs and safe generic replies。
- Safe degradation/handoff contract explicitly suppresses outbound answer, requires handoff/ticket or draft hold, and preserves controlled audit/evidence refs only。
- Required validation passes or is honestly recorded: `node --test scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs`, `git diff --check origin/main...HEAD`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-08-breaker-radius-and-redline-output-guard.md --include-worktree`, `npm run check` if feasible, plus final worker/root dual status check。

## 失败分支

- 若 worktree or branch differs from expected path/branch: stop and report; do not write in the wrong checkout。
- 若 implementation requires imports from `packages/evals`, `packages/db`, `packages/llm-gateway` or capability packages: stop and split an integration spec。
- 若 F-06/L-02 production closure requires API/worker/admin/DB persistence or fault injection against real runtime: record future closure path; do not widen scope。
- 若 redline samples or raw customer text are needed: stop; repo evidence may only use synthetic text and controlled refs。
- 若 provider/SDK/key/env/model route/prompt/persona release is needed: stop and defer to a future spec with owner approval。
- 若 validation exposes docs/source/test allowlist violations: remove this worker's out-of-scope changes; do not widen touch list without owner/coordinator direction。

## 不做什么

- 不做 production release、GA-0、真实客户流量、customer LLM、provider/SDK/key/env、模型路由发布、prompt/persona release、knowledge publish、真实红线样本、API/worker/admin/DB persistence、real fault injection、outbound send、storage upload、config center runtime, runbook or incident drill。
- 不修改 `packages/evals/**`、`packages/db/**`、`packages/llm-gateway/**` 或 capability packages；M3-02/M3-03/M3-04/05/06/07 remain compatibility context only。
- 不在 `packages/engine/src/index.ts` 写业务线词汇；engine semantics must stay generic。
- 不关闭 production F-06 or L-02；本 PR 只提供 foundation evidence。

## 验收映射

| Item | M3-08 status | Notes |
|---|---|---|
| F-05 | foundation_supported_not_closed | Redline output guard suppresses internal config/economics/control leakage and does not echo unsafe output; no production output filter integration. |
| F-06 | foundation_implemented_not_closed | Pure breaker radius semantics cover user, user+capability, capability and global decisions; no real fault injection or runtime breaker event persistence. |
| G-05 | foundation_supported_not_closed | False-positive path allows ordinary synthetic business numbers; no admin false-positive dashboard. |
| L-02 | foundation_supported_not_closed | Safe degradation/handoff contract preserves leave-ticket/draft-hold semantics; no GA-0 runtime drill or production leave-ticket path. |
| J-05 | foundation_updated | This evidence records M3-08 engine foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no DB/schema/shared config edits. |

M3-08 does not close any production acceptance item. It only provides pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Closeout / Incident 记录

- Incident: none created by this spec.
- Existing workspace isolation controls remain active; this M3-08 work runs in a dedicated linked worktree and does not change root/main checkout.
