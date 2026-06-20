# M3-14 M3 Closeout And Prettier Guard Follow-up

## 目标

修复 M3 signoff 前发现的两个治理瑕疵：

- 让 `scripts/tests/prettier-ignore-boundary.test.mjs` 稳定验证 diff-added `prettier-ignore` marker 检测，而不是依赖 baseline count 扩张间接失败。
- 将 M3-11 worker write-boundary governance、M3-12 safety-critical ignore cleanup、M3-13 prettier-ignore guard 和本 M3-14 follow-up 回填到 M3 closeout 证据。

本 spec 是 M3 signoff 前治理修补 / pre-M4 governance follow-up，不是 M4 开工；不改变 M3 未 owner accepted、owner input blockers、no production、no M4 started 的结论。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本修补只让 M3 closeout 证据更新到当前治理事实，并让 prettier-ignore guard focused test 更稳定；不代表 M3 owner signoff、M4 capability 开工、production release、GA-0、真实客户流量、customer LLM、prompt/model/persona release、knowledge publish 或 1.0 release 签收。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-14-m3-closeout-and-prettier-guard-followup` / `codex/m3-14-m3-closeout-and-prettier-guard-followup` 执行；不得修改 root/main checkout、其他 worktree、业务包、DB/schema、lockfile、generated/dist、customer data、secrets 或 production/release gate。

## 时间盒

0.25 个工作日。若需要修改业务源码、DB/schema、lockfile、generated/dist、CI workflow、package script、runtime guard 语义或 M4 业务能力，停止并报告，不扩大本 PR 范围。

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M3-14-m3-closeout-and-prettier-guard-followup.md`
  - `docs/evidence/M3/M3-14-m3-closeout-and-prettier-guard-followup.md`
  - `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`
  - `docs/evidence/M3/README.md`
  - `scripts/tests/prettier-ignore-boundary.test.mjs`
  - `scripts/guards/prettier-ignore-boundary.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - `scripts/guards/prettier-ignore-boundary.mjs` 只允许在 focused test 证明 guard 本身需要修补时触碰；本 spec 预期只修改测试 fixture 和 docs。
  - 未列出的模块默认不可改。尤其不得触碰 `packages/**`、`apps/**`、`.github/**`、`package.json`、lockfile、generated/dist、raw/export/jsonl/csv、真实客户数据、截图、语音、订单、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 1；new source files <= 0；net source LOC <= 100。预期 source changed files 为 0，除非 guard 本身被证明必须修补。
- test 预算：changed test files <= 1；不删除、不 skip、不弱化既有测试，不扩大 mock 或快照。
- path categories：
  - source: `scripts/guards/prettier-ignore-boundary.mjs` only if needed
  - test: `scripts/tests/prettier-ignore-boundary.test.mjs`
  - docs: this spec, M3-14 evidence, M3 closeout evidence and M3 evidence README
  - config/generated/lock: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `prettier-ignore`、M3-11/M3-12/M3-13/M3-14、closeout 于 `docs/specs`、`docs/evidence/M3`、`scripts/tests`、`scripts/guards`、`package.json` 和 CI workflow；当前缺口是 existing focused test fixture 和 closeout evidence 同步，不需要新增 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：none。本切片不新增外部 API/provider/SDK/connector/adapter。
- 是否需要例外：none。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-14-m3-closeout-and-prettier-guard-followup`。
- 当前分支必须是 `codex/m3-14-m3-closeout-and-prettier-guard-followup`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许只读状态核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、root/main status、open PR 和 no-merged branch 状态。
- 开工前必须重读 `AGENTS.md`、M3-11/M3-12/M3-13 spec/evidence、M3 closeout evidence、M3 README、prettier-ignore guard/test 和 `package.json`。
- 若缺少 `node_modules`，运行 `npm ci`，不得修改 lockfile。

## 实施步骤

1. 复核并记录 focused prettier-ignore boundary test 的当前行为。
2. 将 diff-added marker test 改成 diff-only fixture：commit 前目标 baseline file 少一个 marker，commit 后添加一个 marker，使当前树总数仍等于 frozen baseline，只有 `--base` diff 检测会失败。
3. 将临时 repo 初始化从 `git init -b main` 改为更可移植的 `git init` + `git checkout -B main`。
4. 新增本 M3-14 spec/evidence，记录复核、修复、验证和 PR hygiene。
5. 更新 M3 closeout evidence 和 M3 evidence README，补录 M3-11/M3-12/M3-13/M3-14 治理弧线，保持 M3 未签收、owner-input blockers、no production、no M4 started。
6. 运行 required validation 并记录结果。

## 通过条件

- `node --test scripts/tests/prettier-ignore-boundary.test.mjs` 稳定 6/6。
- `npm run guard:prettier-ignore` 通过。
- `npm run guard:prettier-ignore -- --base origin/main` 通过，或若 branch diff 本身触发预期失败，必须精确解释。
- M3 closeout evidence 明确记录 M3-11/M3-12/M3-13/M3-14 状态和边界。
- M3 closeout 保持 `foundation_queue_complete__owner_inputs_block_closeout` / not M3 owner accepted / no production / no M4 started。
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run lint`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-14-m3-closeout-and-prettier-guard-followup.md --include-worktree`, `git diff --check origin/main...HEAD`, `npm run test`, `npm run check`。

## 失败分支

- 若 worktree or branch differs from expected path/branch: stop and report; do not write in the wrong checkout。
- 若 focused test failure proves guard implementation, not fixture/test portability, needs change: modify only `scripts/guards/prettier-ignore-boundary.mjs` within this spec; do not weaken guard semantics。
- 若 full `npm run check` is blocked by local environment or sandbox, record exact command, exit status and blocker; do not claim pass。
- 若 M3 closeout evidence would require owner acceptance, owner input material, production readiness, real data, provider keys/routes or M4 business work: stop and keep blocked boundary。
- 若 tests need deletion, `.skip` / `.only` / `xit` / `xfail`, assertion weakening, mock expansion or snapshot growth: stop and report。

## 不做什么

- 不启动 M4 业务能力，不实现 production release、GA-0、真实客户流量、customer LLM、provider route release、prompt/persona/model publish、knowledge publish、API/worker/admin integration、DB schema/migration/generated DTO、runtime write jail 或 release gate。
- 不清理业务源码中的现有 baseline marker，不改变 prettier-ignore guard 的冻结 baseline。
- 不修改 `packages/**`、`apps/**`、`.github/**`、`package.json`、lockfile、generated/dist、raw/export/jsonl/csv、真实客户数据、截图、语音、订单、secrets、root/main checkout 或其他 worktree。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-14 status | Notes |
|---|---|---|
| prettier-ignore diff guard | test_hardened | Focused test now verifies diff-only detection instead of relying on baseline count expansion. |
| M3 closeout evidence | follow_up_synced | M3-11 through M3-14 governance arc is recorded. |
| M3 signoff | still_blocked | Owner-input blockers remain unresolved; M3 is not owner accepted. |
| M4 boundary | not_started | No M4 business capability or production/release approval is claimed. |

## Closeout / Incident 记录

- Incident: none created by this spec.
- Workspace isolation remains active: worker branch/worktree only; root/main checkout stays read-only.
