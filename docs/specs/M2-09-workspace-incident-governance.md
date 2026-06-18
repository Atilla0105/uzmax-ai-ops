# M2-09 Workspace Incident Governance

## 目标

用最小 docs-only PR 制度化 M2 工作区污染事故闭环：新增轻量 workspace isolation 规则、spec 前置字段、incident 模板和 M2 incident 记录，并把 M2 closeout/evidence index 同步到该治理 follow-up。

本 spec 只处理治理文档，不实现 guard 脚本、不修改 runtime、不改变 M2 `ready_for_owner_acceptance` 状态、不批准 production、GA-0、真实客户流量、customer LLM、Telegram Business 可行性或 1.0 release。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M2 workspace incident 的制度化控制是否足够轻量，继续负责最终范围、发布、真实账号、真实客户数据、LLM key、成本和合规风险决策。

AI agent：在指定 worktree/branch 内执行 docs-only 更新，基于 repo 内可证明事实记录 incident，保持根因判断克制；不得夸大为完整 root cause 已知，不得自扩触碰文件，不得独自 merge/push。

## 时间盒

0.25 个工作日。若事故记录需要超出本 spec allowlist 的文件、脚本或 guard 改动，则停止并报告，由 PR2 或后续 spec 接管。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `AGENTS.md`
  - `docs/specs/M2-09-workspace-incident-governance.md`
  - `docs/specs/README.md`
  - `docs/specs/SPEC-template.md`
  - `docs/incidents/README.md`
  - `docs/incidents/INCIDENT-template.md`
  - `docs/incidents/INC-2026-06-18-m2-worktree-contamination.md`
  - `docs/evidence/M2/M2-channel-conversation-closeout-signoff.md`
  - `docs/evidence/M2/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只允许上述 docs-only governance/evidence 文件。
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples、root checkout 或 guard 脚本。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = AGENTS governance rule、M2-09 spec、spec README/template、incident README/template/record、M2 closeout/evidence index；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `Incident|incident|worktree|workspace isolation|Workspace Isolation|root write|Milestone Incidents|dispatch|worker plan` 于 `AGENTS.md`、`docs/specs`、`docs/evidence/M2`、`docs/adr`、`docs/runbooks`，确认当前缺口是缺少 `docs/incidents` 体系和 workspace isolation 宪法层规则，而不是可扩展的 source 实现。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter。
- 是否需要例外：none。

## 文档触发检查

- 结果：new doc required。
- 判断依据：M2-05 evidence 已记录 root write boundary，且本 spec 将跨任务污染、写到分配 worktree 外、错分支/main 直接提交、secret/customer-data 边界擦边和 gate 绕过列为 incident 触发器；`docs/doc-gates.md` 尚未把 incident 文档纳入 guard 树存在性检查，本 PR 只补 docs-only 制度，PR2 才做 guard。
- 备注：本 PR 新增 `docs/incidents/` 轻量入口，不提前创建 placeholder runbook 或 guard 脚本。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-governance-incident-closure`，分支为 `codex/governance-incident-closure`。
- 禁止修改 root checkout `/Users/atilla/Documents/UZMAX智能运营`。
- 开工前必须重读 `AGENTS.md`、v1.1 PRD、技术架构、后台设计与前端架构、1.0 验收矩阵、`docs/specs/README.md`、`docs/specs/SPEC-template.md`、M2 closeout evidence、M2-05 realtime evidence 和 M2 evidence README。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、`git branch --no-merged main`、`gh pr list --state open`。
- 当前任务是 PR1 docs/governance implementation worker；不独自 merge/push；若看到非本任务改动，先报告。
- 并发派发证据：本 worker 由 coordinator 指定独立 worktree/branch/spec；本 spec 与 PR2 guard 脚本分离，PR2 不得在同一 PR/branch 混入。

## 实施步骤

1. 重读 required docs/evidence，复核 M2-05 root write boundary 与 M2 closeout 状态。
2. 新增本 M2-09 docs-only spec，限定 touch list、budget、failure branch 和 acceptance mapping。
3. 在 `AGENTS.md` 新增轻量 Workspace Isolation / Orchestration Safety 规则。
4. 更新 `docs/specs/README.md` 与 `docs/specs/SPEC-template.md`，补 worktree/branch 前置条件、并发派发证据、incident 触发器和 closeout incident 记录要求。
5. 新增 `docs/incidents/README.md`、`INCIDENT-template.md` 和 M2 worktree contamination incident 记录，保持根因认知克制。
6. 更新 M2 closeout，新增 Milestone Incidents 段，保持 `ready_for_owner_acceptance`。
7. 更新 `docs/evidence/M2/README.md`，索引 M2-09 governance follow-up 和 incident，不宣称 production 或 owner accepted。
8. 运行 required validation，复核 diff 只含 allowlist 文件。

## 通过条件

- `AGENTS.md` 明确一个 worker = 一个 git worktree = 一个 branch = 一个 spec，并规定并发 worker 不共享 checkout，root/main checkout 只做协调/审计/同步/清理/只读核对。
- Spec README/template 包含 worktree/branch 前置条件、并发派发时的 dispatch/worker plan evidence、incident severity triggers 和 closeout incident 记录要求。
- `docs/incidents/` 新增轻量 README/template，覆盖发生了什么、影响、根因/未知、检测、清理、永久控制、institutionalized 状态、证据链接、owner/AI 边界。
- M2 incident 记录只引用仓库可证明事实与本 PR 控制，不夸大完整 root cause；明确缺少先前 incident 记录本身是治理缺陷。
- M2 closeout 保持 `ready_for_owner_acceptance`，新增 incident/cleanup/control 说明，不改成 `accepted`、production、GA-0 或 release。
- `docs/evidence/M2/README.md` 索引 M2-09 follow-up 和 incident，不宣称 production 或 owner accepted。
- `npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-09-workspace-incident-governance.md --include-worktree`、`git diff --check`、`git status --short --branch` 通过或完成记录。

## 失败分支

- 若需要修改 allowlist 之外的文件：停止并报告，不自扩范围。
- 若发现 root checkout 或其他 worker 的非本任务改动：停止并报告影响范围，不 revert 他人改动。
- 若 incident 事实无法被 repo evidence 支撑：把 incident 写成 `needs_owner_context`，明确未知边界，不补写猜测。
- 若 guard 要求脚本或 CI 改动：停止并转 PR2 guard spec。
- 若当前 M2 closeout 证据显示 owner 已明确 accepted 或 production/GA-0 已放行：停止并改走 owner-signoff/release evidence spec，不在本 spec 代签。

## 不做什么

- 不修改 `apps/**`、`packages/**`、`scripts/**`、configs、lockfile、generated/dist、contracts、runbooks、raw samples、root checkout 或 guard 脚本。
- 不实现 `guard:workspace-isolation`、`guard:incident` 或任何 CI/PR2 机制。
- 不声明 M2 accepted、production ready、GA-0 ready、真实客户流量/customer LLM/Telegram Business 可行性/Business 自动回复/1.0 release 已通过。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets。
- 不还原、删除或改写其他 worker 的改动；若发现非本任务改动先报告。

## 验收映射

| Item | M2-09 status | Notes |
|---|---|---|
| J-05 | governance_follow_up | M2 closeout 增补本里程碑 incident 记录，不把事故制度化推迟到 M6。 |
| K-03 | active | 一 spec / 一 PR；PR1 docs governance 与 PR2 guard 分离。 |
| K-04 | active | 触碰模块清单明确；并发 worker 增加 worktree/branch/spec 互斥规则，schema/lockfile/shared config 等全局串行。 |

M2-09 不关闭任何 1.0 production acceptance item，只制度化 M2 工作区污染事故的 docs/governance 控制。

## Closeout / Incident 记录

- Incident：`docs/incidents/INC-2026-06-18-m2-worktree-contamination.md`。
- Institutionalized 状态：`pending_merge`，本 PR 合入后为 `institutionalized_in_docs`; guard enforcement 仍属 PR2/future spec。
- Evidence：`docs/evidence/M2/M2-05-realtime-ws-evidence-if-needed.md` 的 root write boundary、M2 closeout Milestone Incidents 段、本 spec 与 `AGENTS.md` workspace isolation 规则。
