# M3-13 Pre-M4 Prettier Ignore Guard

## 目标

新增最小防扩散 guard，冻结当前代码/测试路径中的 `prettier-ignore` baseline，防止 M3 owner signoff 前继续扩散 formatter bypass。

本 spec 是 M3 signoff 前治理 / pre-M4 governance preparation，不是 M4 业务能力开工；不清理业务源码、不改变运行行为、不关闭任何 M4/GA-0/1.0 验收项。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只增加最小防扩散控制，baseline 冻结不代表 M3 owner signoff、M4 capability 开工、production release、GA-0 或真实客户流量签收。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-13-pre-m4-prettier-ignore-guard` / `codex/m3-13-pre-m4-prettier-ignore-guard` 执行；复核不触碰业务源码、DB/schema、lockfile、generated/dist、客户数据、root/main checkout 或其他 worktree。

## 时间盒

0.5 个工作日。若需要智能分类器、全仓清理、DB/schema/lockfile、业务源码修改、运行时 sandbox/jail 或超出允许 touch list 的改动，则停止并报告，不扩大本 PR 范围。

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M3-13-pre-m4-prettier-ignore-guard.md`
  - `docs/evidence/M3/M3-13-pre-m4-prettier-ignore-guard.md`
  - `scripts/guards/prettier-ignore-boundary.mjs`
  - `scripts/tests/prettier-ignore-boundary.test.mjs`
  - `package.json`
  - `.github/workflows/ci.yml`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 未列出的模块默认不可改。尤其不得触碰 `packages/evals/**`、`packages/engine/**`、`packages/llm-gateway/**`、`packages/db/**` 源码、apps、lockfile、generated/dist、真实客户数据、截图、语音、订单或 secrets。

## 变更预算与路径分类

- source 预算：changed source files <= 1；new source files <= 1；net source LOC <= 300。
- path categories：
  - source: `scripts/guards/prettier-ignore-boundary.mjs`
  - test: `scripts/tests/prettier-ignore-boundary.test.mjs`
  - config: `package.json`, `.github/workflows/ci.yml`
  - docs: this spec and M3 evidence
  - generated/lock: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索现有 `prettier-ignore` 分布和 existing guard/test patterns；当前需求是独立最小防扩散 guard，扩展 workspace/worker isolation guard 会混合不同治理职责，因此新增 `scripts/guards/prettier-ignore-boundary.mjs` 归属为 M3 signoff 前 formatter-bypass boundary。
- 外部 API/SDK/provider/connector/adapter 依据：none。本切片不新增外部 API/provider/SDK/connector/adapter。
- 是否需要例外：none。

## Baseline

冻结 baseline：

| File | Count |
|---|---:|
| `packages/evals/src/index.ts` | 10 |
| `packages/engine/src/index.ts` | 9 |
| `packages/llm-gateway/src/index.ts` | 4 |
| `packages/db/src/index.ts` | 47 |
| `packages/db/src/m3-ai-contracts.ts` | 9 |
| `packages/capabilities/speech/src/index.ts` | 5 |
| `packages/capabilities/vision/src/index.ts` | 2 |
| `scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs` | 3 |
| total | 89 |

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-13-pre-m4-prettier-ignore-guard`，分支必须是 `codex/m3-13-pre-m4-prettier-ignore-guard`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许只读状态核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、root/main status。
- 开工前必须重读 `AGENTS.md`、M3-12 spec/evidence、`package.json`、`.github/workflows/ci.yml`、workspace/worker boundary guards、`scripts/tests/guards.test.mjs`。
- 若缺少 `node_modules`，运行 `npm ci`。

## 实施步骤

1. 新增 `scripts/guards/prettier-ignore-boundary.mjs`，扫描 monitored code/test paths: `apps/`、`packages/`、`scripts/` 的 JS/TS/MJS/CJS/TSX/JSX 文件；docs/specs 和 docs/evidence prose 不参与。
2. guard 内 marker 使用字符串拼接，避免 guard/test 文件自匹配。
3. 若 baseline 文件计数超过 baseline、任一非 baseline monitored source/test 文件含 marker、或 monitored total > 89，则失败。
4. 支持 `--base <ref>`，只对 monitored source/test paths 中新增 marker diff line 失败。
5. 新增 focused tests 覆盖 baseline pass、existing file expansion fail、new monitored file fail、diff-added marker fail、docs prose ignored、total expansion fail。
6. 新增 `guard:prettier-ignore` npm script，并接入 `npm run check` 与 CI format 后步骤。
7. 运行 required validation 并记录 evidence。

## 通过条件

- Guard 在当前 baseline 下通过，且在扩散 fixture 下失败。
- CI 在 `format:check` 后运行 `npm run guard:prettier-ignore -- --base "${{ steps.guard-base.outputs.base }}"`。
- Required validation passes or is honestly recorded: focused test, guard with and without `--base`, `npm run format:check`, `npm run lint`, `npm run guard:workspace`, explicit worker-boundary, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-13-pre-m4-prettier-ignore-guard.md --include-worktree`, `git diff --check origin/main...HEAD`, `npm run test`, `npm run check` if feasible.

## 失败分支

- 若 worktree or branch differs from expected path/branch: stop and report; do not write in the wrong checkout.
- 若 implementation requires changing business source, DB/schema, lockfile, generated/dist or real data paths: stop and split a new owner-approved spec.
- 若 tests fail because guard permits expansion or self-matches its own marker: repair the guard/tests; do not lower assertions.
- 若 full `npm run check` is blocked by local environment or external secrets/infrastructure, record exact failure; do not claim pass.

## 不做什么

- 不启动 M4 业务能力，不实现 production release、GA-0、真实客户流量、customer LLM、provider route release、prompt/persona/model publish、knowledge publish、API/worker/admin integration、DB schema/migration/generated DTO 或 runtime write jail。
- 不清理业务源码中的现有 baseline marker，不做智能分类器，不修改 M3-12 cleanup 结果。
- 不提交 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw prompt/completion 或 secrets。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-13 status | Notes |
|---|---|---|
| formatter bypass spread | guarded | Existing baseline is frozen by count, new monitored files and diff-added markers. |
| M3 signoff boundary | pre_M4_governance | This does not mark M3 accepted or M4 started. |
| behavior | unchanged | No product or package source behavior change is allowed. |
| release | not_closed | No GA-0, production, owner release or 1.0 acceptance is claimed. |

## Closeout / Incident 记录

- Incident: none created by this spec.
- Workspace isolation remains active: worker branch/worktree only; root/main checkout stays read-only.
