# M2-11 Owner Acceptance Record

## 目标

记录项目 owner 对 M2 channel/conversation milestone evidence 的明确接受，将 M2 closeout/signoff evidence 从 `ready_for_owner_acceptance` 更新为 `owner_accepted_m2_milestone_evidence`，并同步 M2 evidence index。本 spec 只记录 M2 里程碑证据签收事实，不实现新功能、不修改 runtime、不批准 production、GA-0、真实客户流量、customer LLM、Telegram Business 可行性、Business auto-reply 或 1.0 release。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：项目 owner 已在 Codex 线程中明确回复“OK，那m2基本上没有什么问题了，签收。”作为 M2 milestone evidence 接受输入，日期为 2026-06-18。项目 owner 仍负责 production/GA-0、真实账号、真实客户数据、customer LLM、Telegram Business、Business auto-reply、成本、合规和 1.0 release 风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m2-11-owner-acceptance` / `codex/m2-11-owner-acceptance` 中执行，读取 live docs 与当前 repo state，新增本 spec，更新 M2 closeout evidence 与 M2 README，准确记录 owner acceptance input，并保留 M2 follow-up blockers、sensitive-data boundary、production/GA-0/real traffic/customer LLM/Business/release 边界。

## 时间盒

0.1 个工作日。若 owner acceptance input、当前 worktree/branch、M2 closeout evidence 或 required validation 无法证明，则保持 M2 状态为 `ready_for_owner_acceptance` 并记录 `blocked_needs_owner_acceptance_record_refresh`，不得写成 owner accepted。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M2-11-owner-acceptance-record.md`
  - `docs/evidence/M2/M2-channel-conversation-closeout-signoff.md`
  - `docs/evidence/M2/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只允许新增 M2-11 owner acceptance docs-only spec，并就地同步 M2 closeout evidence 与 M2 evidence index。
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples、root checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = 本 spec、M2 closeout evidence、M2 evidence README；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `owner_accepted|owner accepted|owner acceptance|签收|ready_for_owner_acceptance|pending_acceptance|M2 current|M2 当前状态` 于 `docs/specs`、`docs/evidence/M2` 与 `docs/evidence/M1`，确认现有 M2 closeout evidence 仍停留在 `ready_for_owner_acceptance` / `pending_acceptance`，需要新增 docs-only owner acceptance record，不需要新增或修改 source。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，只引用项目 owner 在 Codex 线程中的明确签收输入。
- 是否需要例外：none。

## 文档触发检查

- 结果：updated。
- 判断依据：`docs/doc-gates.md`。本 PR 只同步既有 M2 evidence/spec 索引；不新增 schema/migration/generated DTO/OpenAPI、eval fixtures、environment validation、observability、release workflow、production runtime、external provider/connector/adapter 或 runbook 触发项。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m2-11-owner-acceptance`，分支为 `codex/m2-11-owner-acceptance`。
- 禁止修改 root checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert 他人改动。
- 开工前必须重读 `AGENTS.md`、v1.1 PRD、技术架构、后台设计与前端架构、1.0 验收矩阵、`docs/doc-gates.md`、M2 closeout evidence、M2 README、M1-09 owner signoff spec/evidence pattern 和相邻 M2 specs。
- 开工前必须记录：`pwd`、`git status --short --branch`、`git branch --show-current`。
- 当前 `HEAD`、`origin/main` 与 `main` 在开工前均为 `3dc2fe9da5136f1213dfefe2935ff4520ae89d91`。
- 开工前 `gh pr list --state open --json number,title,headRefName,url,isDraft` 返回 `[]`；`git branch --no-merged main` 无输出。
- 项目 owner acceptance input：用户在本线程说“OK，那m2基本上没有什么问题了，签收。”，日期 2026-06-18。
- 并发派发证据：单 worker、单 linked worktree、单 branch、单 docs spec；触碰模块仅限本 spec、M2 closeout evidence、M2 README；无 `packages/db` schema、lockfile、共享 config、CI/guard 脚本、全局生成物或 release/production 门禁改动。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增本 M2-11 docs-only spec，限定 touch list、budget、pass/failure/not-doing/acceptance mapping。
2. 更新 `docs/evidence/M2/M2-channel-conversation-closeout-signoff.md` 的 header status、owner/AI boundary、review notes、signoff、Current Decision、acceptance mapping、incident boundary wording、validation/spec review wording 和 Signoff 表。
3. 在 closeout evidence 中记录 owner acceptance input 原文与日期：2026-06-18，“OK，那m2基本上没有什么问题了，签收。”
4. 更新 `docs/evidence/M2/README.md` 的 M2 状态与 M2-11 索引，保持非 production、非 GA-0、非真实客户流量、非 customer LLM、非 Telegram Business 可行性、非 Business auto-reply、非 1.0 release signoff 边界。
5. 运行 required validation，复核 diff 只含 allowlist 文件。

## 通过条件

- Diff 只包含本 spec、`docs/evidence/M2/M2-channel-conversation-closeout-signoff.md` 和 `docs/evidence/M2/README.md`。
- M2 closeout status 更新为 `owner_accepted_m2_milestone_evidence` 或同等清晰 token。
- Closeout evidence 记录项目 owner acceptance input 原文与日期。
- Closeout evidence 与 README 明确该接受只覆盖 M2 milestone evidence，不代表 production、GA-0、真实客户流量、customer LLM、Telegram Business 可行性、Business auto-reply 或 1.0 release signoff。
- Follow-up blockers 与 sensitive-data boundary 保留；不提交 raw Telegram payloads、customer plaintext、screenshots、voice transcripts、order IDs、phone/address/payment data、support personal accounts or secrets。
- `npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:workspace`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-11-owner-acceptance-record.md --include-worktree`、`git diff --check`、`git status --short --branch` 通过或如实记录失败/慢命令。

## 失败分支

- 若 owner acceptance input 不是明确签收或含条件：保持 `ready_for_owner_acceptance`，记录待确认条件，不更新为 owner accepted。
- 若 validation 发现 docs-only diff 外的文件变化：停止并清理本 worker 产生的越界改动；不得扩大 touch list。
- 若 evidence wording 误写为 production、GA-0、real traffic、customer LLM、Business feasibility、Business auto-reply 或 1.0 release 已关闭：修正为 milestone evidence only，不继承错误表述。
- 若发现 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets：关闭本 PR，先执行清理/泄露处置 spec。
- 若当前 worktree/path/branch 与前置条件不一致：停止并报告，不在错误 checkout 写入。

## 不做什么

- 不修改 `apps/**`、`packages/**`、`scripts/**`、configs、lockfile、generated/dist、contracts、runbooks、raw samples、root checkout 或其他 worktree。
- 不实现或改动 production DB repository、WebSocket/polling runtime、admin API client、worker/engine integration、queue consumer、real Bot staging/prod config、Telegram Business adapter/UI/API、LLM/prompt/model route、GA-0 或真实客户流量。
- 不改变 `claim` vs `lock` 产品语义；`claim` 仍只是分配，`lock` 仍是独占编辑防线。
- 不批准 production、GA-0、real customer traffic、customer LLM、Telegram Business feasibility、Business auto-reply 或 1.0 release。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets。

## 验收映射

| Item | M2-11 status | Notes |
|---|---|---|
| J-05 | owner_accepted_m2_milestone_evidence | 项目 owner 接受 M2 milestone evidence，不把 M2 证据签收留到 M6 集中补签；production/release signoff remains later scope. |
| K-03 | active | 一 spec / 一 PR；本 PR 只实现 M2-11 docs-only owner acceptance record。 |
| K-04 | active | Touch modules explicit；docs-only；不进入 source/test/config/lock/generated。 |

M2-11 不关闭任何 1.0 production acceptance item，只记录 M2 milestone evidence 已获项目 owner 明确接受。

## Closeout / Incident 记录

- Incident：none created by this spec。
- Existing M2 incident `docs/incidents/INC-2026-06-18-m2-worktree-contamination.md` remains recorded and guarded by M2-09/M2-10 evidence; this owner acceptance record does not change incident root-cause boundaries or release gates。
