# M2-06 Channel Conversation Closeout Signoff

## 目标

归档 M2 channel/conversation queue 的里程碑 closeout 证据：复核 PR #25-#31、main CI、M2 specs/evidence、ADR-B01、I-04 no-WS 分支和未完成项，把 M2 状态整理为 `ready_for_owner_acceptance`。

本 PR 只做 docs-only closeout。M2-06 关闭的是 M2 里程碑证据队列，不代表 production、GA-0、真实客户流量、customer LLM、Telegram Business 可行性、1.0 release 或完整 1.0 验收关闭。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认是否接受 M2 channel/conversation milestone evidence closeout，并继续负责 production/GA-0/真实账号/真实客户数据/customer LLM/成本/合规/1.0 release 风险决策。当前没有项目 owner 对 M2 final release/signoff 的明确签收输入。

AI agent：读取 live docs 与当前 git/gh 事实，更新 closeout spec/evidence/index，诚实标注未关闭项、敏感数据边界、branch/PR hygiene 和 validation；不得替 owner 声明生产发布、真实流量、Business 可行、customer LLM 或 1.0 release signoff。

## 时间盒

0.25 个工作日。若 PR ledger、main CI、M2 evidence 或 branch/PR hygiene 无法被当前 GitHub/repo 状态证明，则保持 closeout 为 `blocked_needs_evidence_refresh`，不得写成 accepted。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M2-06-channel-conversation-closeout-signoff.md`
  - `docs/evidence/M2/M2-channel-conversation-closeout-signoff.md`
  - `docs/evidence/M2/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只允许新增 M2-06 closeout spec/evidence 并更新 M2 evidence index。
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples 或敏感材料。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = 本 spec、M2 closeout evidence、M2 evidence README；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `M2-06|channel-conversation-closeout|closeout-signoff|ready_for_owner_acceptance`，确认现有 M2-06 仅在 M2-00 queue/readiness pack 中被列为 future closeout，尚无 closeout spec/evidence 文件；已检索 `M2-06|signoff|closeout|realtime|Business|I-04` 于 `apps packages scripts`，结果只命中既有 M2 tests/admin shell/auth spike references，未发现需要新增或修改 source 的 closeout 实现归属。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter。Telegram Bot API 与 Telegram Business 官方链接只作为前序 M2-02/ADR-B01 背景证据，本 closeout 不从外部文档推导任何新平台能力。
- 是否需要例外：none。

## 文档触发检查

- 结果：updated。
- 判断依据：`docs/doc-gates.md`。本 PR 只更新既有 M2 evidence 索引并新增 closeout evidence；不新增 schema/migration/generated DTO/OpenAPI、eval fixtures、environment validation、observability、release workflow、production runtime、外部 provider/connector/adapter 或 runbook 触发项。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m2-06-closeout`，分支为 `codex/m2-06-channel-conversation-closeout`；不得修改 root worktree `/Users/atilla/Documents/UZMAX智能运营`。
- 开工前重读 `AGENTS.md`、v1.1 PRD、技术架构、后台设计与前端架构、1.0 验收矩阵、`docs/doc-gates.md`、M2-00 至 M2-05 specs、M2 evidence、ADR-B01。
- 当前 `origin/main` 必须可验证为 PR #31 merge commit `8571e401e1d116ce90b6090a6a916ab6cc6bb133`，且 M2 PR #25-#31 与 main CI success 可由 `gh` 复核。
- Branch/PR hygiene 必须在开工前记录：`git status --short --branch`、`git branch --no-merged main`、`gh pr list --state open`。
- ADR-B01/SPK-01 当前为 conservative closure：Business 模块当前 M2 branch 只能按 C-03b 关闭，不得声明 Business 已实测可行或平台不可行。
- M2-05 当前为 `documented_no_ws_branch_for_m2`：I-04 未满足 1.0 production。

## 实施步骤

1. 读取 live docs 与 M2 evidence，复核 M2 queue 是否均已合并或明确分支。
2. 用 `git`/`gh` 复核 `origin/main`、PR #25-#31 merge commits/merged dates、main CI run IDs/URLs/conclusion、open PR 和未合并分支。
3. 用 `rg` 检索 M2-06/signoff/closeout/realtime/Business/I-04，并记录 no-source 结论。
4. 新增 M2-06 spec，限定 docs-only touch list、budget、pass/failure/not-doing/acceptance mapping。
5. 新增 M2 closeout evidence，记录 current decision、PR ledger、acceptance mapping、follow-up blockers、sensitive-data boundary、branch/PR hygiene 和 validation。
6. 更新 `docs/evidence/M2/README.md`，把 M2 evidence index 指向 closeout 记录并保留非 production/GA-0/1.0 release 边界。
7. 运行 required validation，完成 spec compliance review 与 docs quality review。

## 通过条件

- Diff 只包含本 spec、M2 closeout evidence 和 `docs/evidence/M2/README.md`。
- Closeout evidence header 包含 evidence_id、milestone、acceptance_items、status、created_at/updated_at、owner/AI boundary、source_files、sensitive_data_location、redaction_status、review_notes、signoff。
- PR ledger #25-#31 包含 merge commit、merged date、main CI run ID/URL/conclusion，且来自当前 `gh`/`git` verification。
- Acceptance mapping 明确区分 M2 scope partial/closed governance 与 1.0 production 未关闭项；不得声明 production、GA-0、real traffic、customer LLM、Business feasibility 或 1.0 release closeout。
- Follow-up blockers 包含 production DB repo、production WS/polling、admin API client、worker/engine integration、real Bot staging/production config、Business disabled/no feasibility、no customer LLM、no GA-0/real traffic、M3/M4/M6 gates。
- Sensitive-data boundary 明确禁止 raw Telegram payloads、customer plaintext、screenshots、voice transcripts、order IDs、phone/address/payment/support personal accounts/secrets 入 repo。
- `npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-06-channel-conversation-closeout-signoff.md --include-worktree`、`git diff --check` 通过。

## 失败分支

- 若 `origin/main` 或 PR #25-#31 ledger 与当前 GitHub 状态不一致：保持 evidence `blocked_needs_ledger_refresh`，记录差异，不创建 ready signoff。
- 若 open PR 或未合并分支显示有冲突 M2 work：保持 `blocked_needs_branch_pr_hygiene`，先清理或标记 superseded。
- 若发现 M2 evidence 声称 production/1.0 closure 但 live docs 不支持：修正 closeout 口径为 milestone evidence only，不继承错误表述。
- 若 Business evidence 不是 ADR-B01 conservative branch：停止并先同步 SPK-01/ADR-B01 evidence。
- 若 I-04 已有真实 production WS/polling evidence：停止并改引用真实证据；不得保留 no-WS status。
- 若 doc-trigger guard 要求新增其他文档：停止并拆新 docs-only spec，避免 placeholder manuals。

## 不做什么

- 不修改 `apps/**`、`packages/**`、`scripts/**`、configs、lockfile、generated/dist、contracts、runbooks、raw samples 或 root worktree。
- 不实现 production DB repository、WebSocket/polling runtime、admin API client、worker/engine integration、queue consumer、real Bot staging/prod config、Telegram Business adapter/UI/API、LLM/prompt/model route、GA-0 或真实客户流量。
- 不声明 C-01/C-02/C-06/D-01/D-02/D-03/I-01/I-04 已完整满足 1.0 production。
- 不声明 Telegram Business 可行、不可行或自动回复可用；只沿用 ADR-B01 当前 conservative closure。
- 不写 production 或 GA-0 release signoff；项目 owner final acceptance 当前待定。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets。

## 验收映射

| Item | M2-06 status | Notes |
|---|---|---|
| C-01 | foundation_partial_evidence_for_m2_scope | M2-02 provides Bot ingress normalization/dedupe/queue-port foundation; staging bot, DB-backed dedupe, worker and production config remain future blockers. |
| C-02 | foundation_partial_evidence_for_m2_scope | M2-02 safe unsupported/deferred handling is partial M2 evidence; broader Telegram edge cases remain future work. |
| C-03 | not_current_branch | ADR-B01 did not enter the full Business feasible branch. |
| C-03b | closed_by_C-03b_branch_for_m2 | ADR-B01/SPK-01 conservative closure makes Business closed/disabled the current M2 branch. |
| C-04 | not_current_branch | No Business draft sending branch is enabled. |
| C-05 | not_current_branch | No real support-person message visibility/anti-race evidence exists. |
| C-05b | not_current_branch | No partial-feasibility branch or substitute anti-race mechanism is enabled. |
| C-06 | contract_or_ui_partial_evidence_for_m2_scope | M2-03/M2-04 record contract/display evidence; engine/worker production concurrency remains future work. |
| D-01 | contract_or_ui_partial_evidence_for_m2_scope | M2-03 API contract and M2-04 local UI cover partial filters/states evidence; production API/UI data path remains future work. |
| D-02 | contract_or_ui_partial_evidence_for_m2_scope | M2-03 ticket summary/suggested action/SLA placeholder evidence is partial; notification/real repo remain future work. |
| D-03 | contract_or_ui_partial_evidence_for_m2_scope | M2-03 state machine and M2-04 UI shell are partial; multi-account production lock/E2E remains future work. |
| I-01 | local_ui_partial_evidence_not_full_1_0 | M2-04 covers local conversation/ticket shell only; broader desktop core remains open. |
| I-04 | documented_no_ws_branch_for_m2_not_closed_for_1_0_production | M2-05 records no-WS/degraded branch; production WS/polling and latency/freshness evidence remain future work. |
| J-05 | closed_for_m2_governance | M2 evidence is rolled up during M2 instead of deferred to M6; owner acceptance remains pending. |
| K-03 | closed_for_m2_governance | M2-00 through M2-06 each use one spec / one PR. |
| K-04 | closed_for_m2_governance | M2 queue and touch-module boundaries are recorded; DB schema was serial. |

M2-06 does not close 1.0 production acceptance. It prepares the M2 milestone evidence package for project owner review/acceptance.
