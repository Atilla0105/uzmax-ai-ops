# M2-10 Workspace Guard

## 目标

把 M2-09 已制度化的 workspace isolation 规则转成最小机器 guard：本地阻断 worker 在 primary/root checkout 的 feature branch 上实现，阻断 root/main coordination checkout 带 tracked/untracked 改动或本地 ahead commit；CI 只做安全的有限读取并明确跳过本地物理 worktree 要求。

本 spec 不改变 M2 `ready_for_owner_acceptance` 边界，不实现业务代码、生产发布、dispatch manifest、ADR、多级审批或 pre-commit hook。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M2-10 的轻量机器执法是否足够覆盖 M2 workspace contamination incident 的近期复发风险，并继续负责最终范围、发布、真实账号、真实客户数据、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-workspace-guard` / `codex/workspace-guard` 内执行，先写本 spec，再实现 guard、测试、npm/CI 接入和 M2 incident/evidence wording sync；不得触碰 root checkout `/Users/atilla/Documents/UZMAX智能运营`、其他 worktree 或 allowlist 之外文件。

## 时间盒

0.25 个工作日。若最小 guard 无法在本 touch list 与 source budget 内完成，则停止并改走后续 infra spec，不扩大成复杂治理系统。

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M2-10-workspace-guard.md`
  - `scripts/guards/workspace-isolation.mjs`
  - `scripts/tests/guards.test.mjs`
  - `scripts/tests/workspace-isolation.test.mjs`
  - `package.json`
  - `.github/workflows/ci.yml`
  - `docs/incidents/INC-2026-06-18-m2-worktree-contamination.md`
  - `docs/evidence/M2/M2-channel-conversation-closeout-signoff.md`
  - `docs/evidence/M2/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、lockfile、generated/dist、raw samples、root checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 220、new source files <= 1。
- test/config/docs 预计变更：test = `scripts/tests/workspace-isolation.test.mjs` 增加 workspace guard 正/负例，`scripts/tests/guards.test.mjs` 保持既有 guard 测试并避免 max-lines 超预算；config = `package.json` 与 `.github/workflows/ci.yml` 接入 `guard:workspace`；docs = 本 spec、incident、M2 closeout/evidence README。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `workspace-isolation|workspace guard|guard:workspace|worktree|primary checkout|linked worktree` 于 `scripts`、`package.json`、`.github`、`docs/specs`、`docs/incidents`、`docs/evidence/M2`。现有 guard 只有 doc/eval/forbidden/pr-shape；M2-09 明确 guard enforcement deferred to PR2/future spec，因此新增 `scripts/guards/workspace-isolation.mjs` 作为独立最小 guard 归属合理。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 spec 不新增或调用外部 API/SDK/provider/connector/adapter。
- 是否需要例外：none。

## 文档触发检查

- 结果：updated。
- 判断依据：本 PR 只新增本地/CI guard 脚本、测试、npm/CI wiring，并同步既有 M2 incident/evidence wording；不新增 schema/migration/generated DTO/OpenAPI、eval fixtures、environment validation、observability、release workflow、production runtime、external provider/connector/adapter 或 runbook 触发项。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-workspace-guard`，分支为 `codex/workspace-guard`。
- 禁止修改 root checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert 他人改动。
- 开工前必须重读 `AGENTS.md` §6A、`docs/specs/README.md`、`docs/specs/SPEC-template.md`、`docs/incidents/README.md`、`docs/incidents/INC-2026-06-18-m2-worktree-contamination.md`、`scripts/tests/guards.test.mjs`、相关 `scripts/guards/*.mjs` 与 `scripts/guards/pr-shape/**` 模式、`package.json`、`.github/workflows/ci.yml`。
- 开工前必须记录：`pwd`、`git status --short --branch`、`git branch --show-current`。
- 本 spec 是 guard/CI 全局串行点；当前无并发 worker。若发现并发 worker、跨 worktree 写入、错分支/main 直接提交、secret/customer-data 边界擦边或 gate 绕过迹象，停止并报告影响范围。
- 并发派发证据：无并发 worker；guard/CI/shared config touch list 全局串行。

## 实施步骤

1. 新增本 M2-10 infra spec，限定 touch list、budget、pass/failure/not-doing/acceptance mapping。
2. 新增 `scripts/guards/workspace-isolation.mjs`，只使用 Node stdlib 与 git CLI。
3. 本地非 CI 规则：非 `main` branch 必须在 linked worktree；`main` branch 必须 clean 且不得 ahead upstream；linked feature worktree 允许 dirty。
4. CI 规则：输出 `CI checkout: physical local worktree checks skipped/limited`，可做安全 git 状态读取，但不得要求 linked worktree。
5. 在 `scripts/tests/workspace-isolation.test.mjs` 增加 workspace guard 正/负例；`scripts/tests/guards.test.mjs` 保留既有 guard 测试行为，不删除、不 skip、不弱化既有测试。
6. 在 `package.json` 新增 `guard:workspace` 并接入 `npm run check`；在 CI 接入 `npm run guard:workspace`。
7. 更新 M2 incident 与 M2 evidence，说明 guard 已落地但不改变 M2 owner acceptance、production、GA-0、real traffic、customer LLM、Telegram Business 或 1.0 release 边界。
8. 运行 required validation，复核 diff 只含 allowlist 文件。

## 通过条件

- `npm run format:check` 通过。
- `node --test scripts/tests/guards.test.mjs scripts/tests/workspace-isolation.test.mjs` 通过；`npm run test` 通过。
- `npm run guard:workspace` 在当前 linked feature worktree 通过。
- `CI=true npm run guard:workspace` 通过，并输出 CI physical local worktree checks skipped/limited 说明。
- `npm run guard:doc-triggers` 通过。
- `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-10-workspace-guard.md --include-worktree` 通过。
- `git diff --check` 通过。

## 失败分支

- 若无法可靠区分 linked worktree 与 primary checkout：停止并拆后续 infra spec；不得写假检查。
- 若 CI checkout 被误伤：先降级 CI 路径为明确 skipped/limited，再补本地测试；不得阻断 pull_request/main push。
- 若需要修改 allowlist 之外文件、lockfile 或业务代码：停止并报告，不自扩范围。
- 若测试需要删除、skip、弱化断言或扩大 mock 才能通过：停止并报告，不通过测试弱化合入。
- 若发现 root checkout 或其他 worktree 非本任务改动影响当前 spec：停止并报告影响范围，不 revert 他人改动。

## 不做什么

- 不做 dispatch manifest、ADR、多级审批、复杂 worker scheduler、外部服务、业务代码或生产发布。
- 不安装 pre-commit hook，不新增 git hooks，不强迫 CI 证明本地物理 worktree。
- 不修改 `apps/**`、`packages/**`、lockfile、generated/dist、raw samples、root checkout 或其他 worktree。
- 不声明 M2 accepted、production ready、GA-0 ready、真实客户流量/customer LLM/Telegram Business 可行性/Business 自动回复/1.0 release 已通过。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets。

## 验收映射

| Item | M2-10 status | Notes |
|---|---|---|
| J-05 | governance_guard_follow_up | M2 incident 的 docs-only deferred guard 变成 `guard:workspace` 机器执法。 |
| K-03 | active | 一 spec / 一 PR；本 PR 只实现 M2-10。 |
| K-04 | active | Touch modules explicit；guard/CI shared config 串行；不进入业务模块。 |

M2-10 不关闭任何 1.0 production acceptance item，只把 workspace isolation 规则落成最小本地 guard 和 CI-safe check。

## Closeout / Incident 记录

- Incident：`docs/incidents/INC-2026-06-18-m2-worktree-contamination.md`。
- Institutionalized 状态：从 `institutionalized_in_docs` 推进到 `guarded`，以 `scripts/guards/workspace-isolation.mjs`、`scripts/tests/workspace-isolation.test.mjs`、`package.json` 和 `.github/workflows/ci.yml` 为 guard evidence。
- Evidence：本 spec、M2 closeout Milestone Incidents 段、M2 evidence README、required validation 命令输出。
