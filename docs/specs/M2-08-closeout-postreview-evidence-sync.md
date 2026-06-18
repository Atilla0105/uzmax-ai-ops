# M2-08 Closeout Postreview Evidence Sync

## 目标

同步 M2 closeout/signoff 证据中的 post-review 事实，把 M2-06 closeout PR #32 与 M2-07 owner-review follow-up PR #33 合并后的 `main` commit、CI、当前分支/PR 清洁状态补入 M2 里程碑记录。本 spec 只修正 M2 证据与当前仓库事实的追溯性，不实现新功能、不修改 runtime、不批准 production、GA-0、真实客户流量、customer LLM、Telegram Business 可行性或 1.0 release。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M2 closeout evidence 是否可接受，并继续负责 production/GA-0/真实账号/真实客户数据/customer LLM/成本/合规/1.0 release 风险决策。当前没有项目 owner 对 M2 final acceptance/signoff 的明确签收输入。

AI agent：读取 live docs 与当前 `git`/`gh` 事实，更新 M2 closeout evidence 和必要索引，准确记录 M2-07 已解决的 conversation/ticket API HTTP status quality gap，同时保留 M2-06 的 production、GA-0、real traffic、customer LLM、Business 和后续 gate 边界；不得把 `ready_for_owner_acceptance` 改成 `accepted`。

## 时间盒

0.1 个工作日。若 PR #32/#33、CI、当前 `main`、branch/PR hygiene 或 M2-07 evidence 无法被当前 repo/GitHub 状态证明，则保持 M2 closeout 为 `ready_for_owner_acceptance` 但标记 `blocked_needs_postreview_evidence_refresh`，不得写成 accepted。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M2-08-closeout-postreview-evidence-sync.md`
  - `docs/evidence/M2/M2-channel-conversation-closeout-signoff.md`
  - `docs/evidence/M2/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只允许新增 M2-08 docs-only sync spec，并就地同步 M2 closeout evidence 与 M2 evidence index。
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples 或敏感材料。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = 本 spec、M2 closeout evidence、M2 evidence README；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `M2-06|M2-07|M2-08|closeout|ready_for_owner_acceptance|PR #33|27745068913|27745400807|9bce892` 于 `docs/specs` 与 `docs/evidence/M2`，确认当前缺口是 M2 closeout evidence 未同步 PR #32/#33 合并事实、post-merge main CI 和 M2-07 owner-review follow-up 结论，不需要新增或修改 source。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，只引用 GitHub PR/CI 证据。
- 是否需要例外：none。

## 文档触发检查

- 结果：updated。
- 判断依据：`docs/doc-gates.md`。本 PR 只同步既有 M2 evidence/spec 索引；不新增 schema/migration/generated DTO/OpenAPI、eval fixtures、environment validation、observability、release workflow、production runtime、external provider/connector/adapter 或 runbook 触发项。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m2-08-closeout-postreview-sync`，分支为 `codex/m2-08-closeout-postreview-sync`。
- 开工前必须重读 `AGENTS.md`、v1.1 PRD、技术架构、后台设计与前端架构、1.0 验收矩阵、`docs/doc-gates.md`、M2-06/M2-07 specs/evidence 和 M2 evidence README。
- PR #32 M2-06 closeout 已合并到 `main`，merge commit `7bcb7e1a6c8c10a2a521a321c558c7070ace7667`；PR check run `27738958992` success completed at `2026-06-18T05:38:51Z`；post-merge main CI run `27739818105` success, created at `2026-06-18T05:55:24Z`, updated at `2026-06-18T06:01:23Z`, headSha `7bcb7e1a6c8c10a2a521a321c558c7070ace7667`。
- PR #33 M2-07 conversation ticket API HTTP hardening 已合并到 `main`，merge commit `9bce892c71398ed7d6798b8ed92af648cb570749`，merged at `2026-06-18T08:00:45Z`；PR check run `27745068913` success completed at `2026-06-18T08:00:25Z`；post-merge main CI run `27745400807` success, created at `2026-06-18T08:00:49Z`, updated at `2026-06-18T08:06:44Z`, headSha `9bce892c71398ed7d6798b8ed92af648cb570749`。
- Current M2 final project owner acceptance remains pending unless live repo evidence says otherwise.
- Branch/PR hygiene 必须在开工前记录：`git status --short --branch`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,url,isDraft`。

## 实施步骤

1. 读取 live docs、M2-06/M2-07 specs/evidence、M2 README 和 current `git`/`gh` facts。
2. 新增 M2-08 docs-only spec，限定 touch list、budget、pass/failure/not-doing/acceptance mapping。
3. 更新 M2 closeout evidence 的 `source_files`、review notes、current main hash、PR ledger、acceptance mapping、follow-up blockers、branch/PR hygiene 和 validation as-needed。
4. 明确记录 M2-07 resolved the concrete API HTTP status quality gap: not found 404, lock conflict 409, validation/domain errors 400, access/authz failures 403, unexpected errors preserved, actorUserId spoofing coverage restored, null/non-object body handled as 400 and 300-line conversation-ticket file split.
5. 保留 M2-07 非目标：不改变 claim vs lock 语义，不接入 production DB/WS/worker/admin API/real traffic/customer LLM/message.content customer plaintext paths。
6. 必要时微调 `docs/evidence/M2/README.md`，让 M2 index 不落后于 M2-07 merge。
7. 运行 required validation，完成 spec compliance review 与 docs quality review。

## 通过条件

- Diff 只包含本 spec、M2 closeout evidence 和必要的 `docs/evidence/M2/README.md` wording sync。
- M2 closeout status 保持 `ready_for_owner_acceptance`，不写成 `accepted`。
- Closeout evidence 可追溯到 PR #25-#33 including PR #32/#33 merge commits、merged dates、PR check runs、post-merge main CI run IDs/URLs/conclusion 和当前 `origin/main` hash。
- Closeout evidence 明确 M2-07 已解决 owner-review API HTTP status quality gap，但 production DB、WS/polling、worker/engine、admin API client、real customer traffic、customer LLM、Business feasibility/auto-reply、GA-0、M3/M4/M6 gates 仍 future-gated。
- Sensitive data boundary unchanged: no raw Telegram payloads、customer plaintext、screenshots、voice transcripts、order IDs、phone/address/payment data、support personal accounts or secrets。
- `npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-08-closeout-postreview-evidence-sync.md --include-worktree`、`git diff --check` 通过。

## 失败分支

- 若 PR #32/#33 或 CI facts 无法被当前 GitHub 状态证明：保留 evidence status 为 `ready_for_owner_acceptance`，新增 `blocked_needs_postreview_evidence_refresh` note 并停止。
- 若发现项目 owner 已明确接受 M2：停止本 docs-only sync，改走 owner-signoff-record spec，不在本 spec 代签。
- 若 M2-07 evidence 与 merged code/CI 不一致：停止并拆 M2-07 evidence correction spec。
- 若发现 evidence 声称 production、GA-0、real traffic、customer LLM、Business feasibility 或 1.0 release 已关闭但 live docs 不支持：修正为 future-gated，不继承错误表述。
- 若 doc-trigger guard 要求新增其他文档：停止并拆新 docs-only spec，避免 placeholder manuals。

## 不做什么

- 不修改 `apps/**`、`packages/**`、`scripts/**`、configs、lockfile、generated/dist、contracts、runbooks、raw samples 或 root worktree。
- 不实现或改动 production DB repository、WebSocket/polling runtime、admin API client、worker/engine integration、queue consumer、real Bot staging/prod config、Telegram Business adapter/UI/API、LLM/prompt/model route、GA-0 或真实客户流量。
- 不改变 `claim` vs `lock` 产品语义；`claim` 仍只是分配，`lock` 仍是独占编辑防线。
- 不声明 production、GA-0、real customer traffic、customer LLM、Telegram Business feasibility、Business auto-reply、1.0 release 或 M2 final acceptance 已通过。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets。

## 验收映射

| Item | M2-08 status | Notes |
|---|---|---|
| D-01 | evidence_synced_after_owner_review_fix | M2-07 HTTP hardening makes conversation API not-found/validation/body-shape cases explicit at the API contract boundary; production DB/UI remains future work. |
| D-02 | evidence_synced_after_owner_review_fix | M2-07 maps handoff ticket not-found and required/domain errors to explicit HTTP statuses; notification/real repository remains future work. |
| D-03 | evidence_synced_after_owner_review_fix | M2-07 maps lock conflicts to 409 and preserves claim vs lock semantics; multi-account production E2E remains future work. |
| B-04 | evidence_synced_after_owner_review_fix | M2-07 maps access/authz failures to 403 and restored actorUserId spoofing coverage. |
| I-04 | not_closed | No WS/realtime/polling production integration in this docs sync or M2-07. |
| J-05 | postreview_sync | M2 closeout evidence is synchronized after owner-review follow-up instead of deferring stale evidence to M6. |
| K-03 | active | One spec / one PR for M2-08 docs-only sync. |
| K-04 | active | Touch modules explicit; no source/test/generated/lock/config changes. |

M2-08 does not close 1.0 production acceptance. It only keeps the M2 milestone evidence package accurate after the merged M2-07 owner-review follow-up.
