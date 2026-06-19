# M3-11 Pre-M4 Worker Write-Boundary Governance

## 目标

在 M3 owner signoff 前，把 M3-07/M3-09 重复出现的 root/main worktree 污染事故转成 pre-M4 governance preparation：新增 worker write-boundary guard/harness，用于从 linked worker worktree 检查 assigned worktree 绑定和 root/main checkout 污染状态，并把结果接入本地 `npm run check`。

本 spec 不表示后续里程碑已启动，不实现 M4 业务能力、运行时写入 jail、provider/connector、生产发布或真实数据流程。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M3 signoff 前治理和进入 M4 前 worker write-boundary preflight 的风险接受边界，尤其是 runtime/harness 预防与 in-repo 检测/取证的分工。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-11-pre-m4-worker-write-boundary-governance` / `codex/m3-11-pre-m4-worker-write-boundary-governance` 执行，实现独立 guard、测试、文档、证据和 npm script；不得修改 root/main checkout、其他 worktree、业务包、apps、lockfile、generated/dist 或真实/敏感样本。

## 时间盒

0.25 个工作日。若需要复杂 scheduler、pre-commit hook、sandbox runtime 或跨工具 jail，停止并拆后续 infra spec。

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `AGENTS.md`
  - `docs/specs/`
  - `docs/evidence/`
  - `docs/runbooks/worker-worktree-boundary.md`
  - `scripts/guards/worker-write-boundary.mjs`
  - `scripts/tests/worker-write-boundary.test.mjs`
  - `package.json`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 未列出的模块默认不可改，尤其不得触碰 `packages/evals/**`、`packages/engine/**`、`packages/llm-gateway/**`、`packages/db/**`、`apps/**`、lockfile、generated/dist、raw/export/jsonl/csv、真实客户数据、截图、语音、订单、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 260、new source files <= 1。
- test 预算：新增 focused Node test <= 1 file，不删除、不 skip、不弱化既有测试。
- docs/config 预计变更：本 spec、M3 evidence、worker boundary runbook、`AGENTS.md` 窄规则、`package.json` npm script/check 串联。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `workspace-isolation|guard:workspace|worktree|root/main|write-boundary` 于 `AGENTS.md docs scripts package.json`。现有 `scripts/guards/workspace-isolation.mjs` 是当前 checkout isolation guard；M3-11 pre-M4 governance preparation 需要 worker 从 linked worktree 检查 assigned path 与 primary root/main 污染，因此新增 `scripts/guards/worker-write-boundary.mjs` 作为独立 harness/forensic guard，避免大改既有入口。
- 外部 API/SDK/provider/connector/adapter 依据：none。
- 是否需要例外：none。

## 文档触发检查

updated

依据：本 spec 新增治理 guard 与 runbook，未新增 schema/migration/generated DTO/OpenAPI、eval fixtures、production runtime、external provider/connector/adapter 或 release workflow。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-11-pre-m4-worker-write-boundary-governance`。
- 当前分支必须是 `codex/m3-11-pre-m4-worker-write-boundary-governance`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只能用于只读状态核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、root/main `git status --short --branch`。
- 若 worktree 没有 `node_modules`，先运行 `npm ci`，不得修改 lockfile。

## Worktree / branch 前置条件

| item | value |
|---|---|
| assigned worktree | `/Users/atilla/Documents/uzmax-m3-11-pre-m4-worker-write-boundary-governance` |
| assigned branch | `codex/m3-11-pre-m4-worker-write-boundary-governance` |
| root/main checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main use | read-only status/evidence only |

## 并发派发证据

This worker is concurrent with a separate cleanup worker touching `packages/evals/**`, `packages/engine/**`, and `packages/llm-gateway/**`. M3-11 does not touch those packages, `packages/db/**`, apps, lockfile, generated/dist, provider routes or production gates. This guard/config slice is a pre-M4 governance preparation point for its own branch and must not be mixed with business cleanup.

## 事故与 closeout 记录

- M3-07 incident: `docs/incidents/INC-2026-06-19-m3-07-root-main-worktree-pollution.md`
- M3-09 incident: `docs/incidents/INC-2026-06-19-m3-09-root-main-worktree-pollution.md`
- M3 closeout: `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`

This spec implements the M3 closeout follow-up recommendation without claiming that an in-repo guard can prevent every absolute-path edit tool from writing outside the assigned worktree.

## 实施步骤

1. 新增 `scripts/guards/worker-write-boundary.mjs`。
2. 支持 `UZMAX_ASSIGNED_WORKTREE` / `--assigned-worktree`，验证当前 git top-level realpath 等于 assigned worktree。
3. 支持 `UZMAX_PRIMARY_ROOT` / `--primary-root`，或从 `git worktree list --porcelain` 找到 main root；从 linked worker 检查 root/main 是否 clean、是否在 main、是否 ahead upstream、upstream 是否可读，并验证 explicit primary root 与 worker 属于同一 git worktree topology。
4. CI 模式输出 physical multi-worktree/root-main enforcement limited/skipped，仅做可行的当前 git 状态读取。
5. 新增 focused tests：linked worker 正常通过、assigned mismatch 失败、CI explicit assigned mismatch 失败、primary root 缺失发现失败、wrong explicit primary root 失败、root off-main 失败、root/main dirty 失败、root ahead upstream 失败、root upstream unreadable 失败。
6. 将 `guard:worker-boundary` 接入 `npm run check`，放在 `guard:workspace` 后。
7. 更新 `AGENTS.md`、runbook 和 M3 evidence，明确 runtime/harness 负责预防，in-repo guard 负责检测/取证。

## 通过条件

- `node --test scripts/tests/worker-write-boundary.test.mjs` 通过。
- `node --test scripts/tests/workspace-isolation.test.mjs scripts/tests/worker-write-boundary.test.mjs` 通过。
- `npm run format:check` 通过。
- `npm run guard:workspace` 通过。
- `npm run guard:worker-boundary` 通过。
- `npm run test` 通过。
- `npm run check` 可行时通过；不可行时记录精确原因。
- `git diff --check origin/main...HEAD` 通过。
- final worker/root dual status clean or only intended worker diff, root/main clean.

## 失败分支

- 若无法可靠读取 assigned worktree 或 root/main status：停止并记录 limited evidence；不得伪造通过。
- 若 CI 被误伤：CI 路径降级为明确 limited/skipped，并保留本地 focused tests。
- 若需要修改 allowlist 之外文件、lockfile、业务包、apps、DB schema、generated/dist 或真实/敏感数据：停止并报告，不扩大本 PR。
- 若发现 root/main 或其他 worktree 被污染：停止当前写入，报告影响范围，进入 incident/cleanup path。
- 若测试需要删除、skip、弱化断言或扩大 mock 才能通过：停止并报告。

## 不做什么

- 不表示后续里程碑已启动，不实现 M4 业务能力。
- 不声明 repo 内 guard 能阻止所有绝对路径编辑工具。
- 不新增 pre-commit hook、scheduler、复杂 worker orchestrator、sandbox runtime、provider/connector/adapter、生产发布或真实数据流程。
- 不修改 `packages/evals/**`、`packages/engine/**`、`packages/llm-gateway/**`、`packages/db/**`、`apps/**`、lockfile、generated/dist、raw/export/jsonl/csv、真实客户数据、截图、语音、订单或 secrets。
- 不 push、不创建 PR、不 merge。

## 验收映射

| Item | M3-11 status | Notes |
|---|---|---|
| J-05 | governance_preflight_added | M3 incident follow-up becomes executable detection/evidence. |
| K-03 | active | One spec / one branch / one commit slice. |
| K-04 | active | Explicit touch list; concurrent cleanup package paths excluded. |
