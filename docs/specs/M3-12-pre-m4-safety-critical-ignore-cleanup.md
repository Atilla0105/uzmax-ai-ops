# M3-12 Pre-M4 Safety Critical Ignore Cleanup

## 目标

清理 M3 安全关键基础设施中的逻辑型 `// prettier-ignore`，让 eval 发布门、redline、breaker、LLM routing/accounting/budget/metadata 等安全控制逻辑重新受 formatter 可读性约束。

本 spec 是 M3 owner signoff 前治理 / pre-M4 safety cleanup，不是 M4 业务能力开工；不新增产品功能、不关闭任何 M4/GA-0/1.0 验收项。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只允许安全关键逻辑可读性清理，不代表 M3 owner signoff、M4 capability 开工、production release、GA-0 或真实客户流量签收。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-12-pre-m4-safety-critical-ignore-cleanup` / `codex/m3-12-pre-m4-safety-critical-ignore-cleanup` 执行；复核行为零变化、无测试弱化、无 mock 扩大、无治理文件/guard/package/runbook 触碰、无 root/main 写入。

## 时间盒

0.5 个工作日。若 cleanup 需要新增业务能力、DB/schema、guard/harness/package 变更、或跨出允许 touch list，则停止并报告，不扩大本 PR 范围。

## Spec 类型

cleanup

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/`
  - `docs/evidence/`
  - `packages/evals/src/index.ts`
  - `packages/engine/src/index.ts`
  - `packages/llm-gateway/src/index.ts`
  - `scripts/tests/m3-eval-gate-redline-runner.test.mjs`
  - `scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs`
  - `scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本实现预计不修改测试；测试路径仅允许在行为等价验证确有必要时补充。
  - 未列出的模块默认不可改。尤其不得触碰 `scripts/guards/**`、`package.json`、`AGENTS.md`、`docs/runbooks/**`、lockfile、generated/dist、apps、`packages/db/**`、真实客户数据、截图、语音、订单、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 3；new source files <= 0；net source LOC <= 600。
- path categories：
  - source: `packages/evals/src/index.ts`, `packages/engine/src/index.ts`, `packages/llm-gateway/src/index.ts`
  - test: focused tests listed above only if behavior-equivalence coverage needs adjustment
  - docs: this spec and M3 evidence
  - generated/lock/config: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 touched files 内 `prettier-ignore`；目标逻辑均可在原文件内就地展开或拆局部变量，新增 source 文件会扩大 cleanup 表面且不符合现有 focused test 的单文件 load 模型。
- 外部 API/SDK/provider/connector/adapter 依据：none。本切片不新增外部 API/provider/SDK/connector/adapter。
- 是否需要例外：none。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-12-pre-m4-safety-critical-ignore-cleanup`，分支必须是 `codex/m3-12-pre-m4-safety-critical-ignore-cleanup`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许只读状态核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、root/main status。
- 开工前必须重读 `AGENTS.md` 和目标源码/测试：`packages/evals/src/index.ts`、`packages/engine/src/index.ts`、`packages/llm-gateway/src/index.ts`、`scripts/tests/m3-eval-gate-redline-runner.test.mjs`、`scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs`、`scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs`。
- 若缺少 `node_modules`，运行 `npm ci`。

## 实施步骤

1. 创建本 M3-12 spec 与 evidence，限定 cleanup 范围、touch list、预算和 owner/AI 边界。
2. 清理 `packages/evals/src/index.ts` 中 eval case/result、redline leakage、gate evaluation、publish decision、category counts、active/backed result、redline reasons、safe payload 等逻辑型 ignore。
3. 清理 `packages/engine/src/index.ts` 中 breaker decision、safety action parts、degradation/handoff contract 等逻辑型 ignore。
4. 清理 `packages/llm-gateway/src/index.ts` 中 route budget、provider order/map、timeout promise、telemetry/hash validation、metadata string decision 等逻辑型 ignore。
5. 保留纯常量/枚举/manifest 表型 ignore；不追求全仓全删。
6. 运行 focused tests 和 required validation，记录 evidence。

## 通过条件

- 安全关键逻辑型 `prettier-ignore` 已从目标函数和判断中移除。
- 剩余 `prettier-ignore` 仅为常量、枚举、静态 manifest、类型表或大表型结构。
- 行为零变化：focused M3 eval gate、breaker/output guard、LLM gateway routing/accounting tests 全部通过。
- Required validation passes or is honestly recorded: focused tests, `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run guard:forbidden-terms`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-12-pre-m4-safety-critical-ignore-cleanup.md --include-worktree`, `git diff --check origin/main...HEAD`, `npm run check` if feasible, final worker/root status。

## 失败分支

- 若 worktree or branch differs from expected path/branch: stop and report; do not write in the wrong checkout。
- 若 cleanup requires changing behavior, status codes, reason codes, exported API, provider behavior, eval gate semantics or breaker semantics: stop and split a behavior spec。
- 若 tests fail because behavior changed: revert or repair only this worker's changes; do not lower assertions or expand mocks。
- 若 guard/harness/package/runbook changes are required: stop and defer to the parallel governance worker。
- 若 source line/complexity limits fail: compact local structure or preserve table-shaped ignore; do not add new source files unless a follow-up spec approves it。

## 不做什么

- 不启动 M4 业务能力，不实现 production release、GA-0、真实客户流量、customer LLM、provider route release、prompt/persona/model publish、knowledge publish、API/worker/admin integration、DB schema/migration/generated DTO、guard/harness/package/runbook governance work。
- 不处理 `packages/db/**` bulk ignore，不清理全仓常量/枚举表型 ignore。
- 不提交 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw prompt/completion 或 secrets。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-12 status | Notes |
|---|---|---|
| safety readability | cleanup_implemented | Logic-shaped formatter bypasses removed from eval gate/redline, breaker/output guard and LLM gateway accounting/budget/metadata logic. |
| behavior | unchanged | Existing focused tests remain authoritative behavior evidence. |
| pre-M4 boundary | M4_not_started | This cleanup does not implement or close M4 business capability and does not mark M4 as started. |
| release | not_closed | No GA-0, production, owner release or 1.0 acceptance is claimed. |

## Closeout / Incident 记录

- Incident: none created by this spec.
- Workspace isolation remains active: worker branch/worktree only; root/main checkout stays read-only.
