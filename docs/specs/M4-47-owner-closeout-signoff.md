# M4-47 Owner Closeout Signoff

## 目标

记录项目 owner 对 M4 milestone evidence 的明确签收，将 M4 状态从 `m4_ready_for_owner_closeout_review` 更新为 `owner_accepted_m4_milestone_evidence`，并同步 M4 evidence index。本 spec 只记录 M4 里程碑证据签收事实，不实现新功能、不修改 runtime、不批准 production、GA-0、真实客户流量、customer LLM、生产 Redis/worker 部署、正式告警路由、真实客户/订单数据、production eval gate 或 1.0 release。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：项目 owner 已在 Codex 线程中明确回复“m4可以签收了，通过。”作为 M4 milestone evidence 接受输入，日期为 2026-06-24。项目 owner 仍负责 production/GA-0、真实账号、真实客户数据、customer LLM、生产 Redis/worker、正式告警路由、生产 eval gate、成本、合规和 1.0 release 风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-47-owner-closeout-signoff` / `codex/m4-47-owner-closeout-signoff` 中执行，读取 live docs 与当前 repo/GitHub 状态，新增本 spec 和 M4-47 evidence，更新 M4 README，准确记录 owner signoff input，并保留 M4 future-gated blockers、sensitive-data boundary、production/GA-0/real traffic/customer LLM/release 边界。

## 时间盒

0.1 个工作日。若 owner signoff input、当前 worktree/branch、M4 closeout evidence、post-M4-46 CI 或 required validation 无法证明，则保持 M4 状态为 `m4_ready_for_owner_closeout_review` 并记录 `blocked_needs_owner_signoff_record_refresh`，不得写成 owner accepted。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-47-owner-closeout-signoff.md`
  - `docs/evidence/M4/M4-47-owner-closeout-signoff.md`
  - `docs/evidence/M4/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只允许新增 M4-47 owner closeout signoff docs-only spec/evidence，并就地同步 M4 evidence index。
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples、root checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = 本 spec、M4-47 evidence、M4 evidence README；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `m4_ready_for_owner_closeout_review`、`owner closeout`、`owner signoff`、`签收`、`M4-46`、`M3-22`、`M2-11`、`M1-09` 于 `docs/specs` 与 `docs/evidence`，确认现有 M4 evidence 停留在 owner closeout review ready，需要新增 docs-only owner signoff record，不需要新增或修改 source。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，只引用项目 owner 在 Codex 线程中的明确签收输入、当前 repo/GitHub PR/CI 状态和既有 M4 evidence。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m4-47-owner-closeout-signoff`，分支为 `codex/m4-47-owner-closeout-signoff`。
- 禁止修改 root checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert 他人改动。
- 开工前必须重读 `AGENTS.md`、v1.1 PRD、技术架构、后台设计与前端架构、1.0 验收矩阵、`docs/specs/README.md`、`docs/doc-gates.md`、M4 README、M4-46 evidence、M3-22 owner signoff pattern、M2-11 owner acceptance pattern 和 M1-09 owner signoff pattern。
- 开工前必须记录：`pwd`、`git status --short --branch`、`git branch --show-current`、root/main status、open PR 和 no-merged branch 状态。
- 当前 worker `HEAD` 与 `origin/main` 在开工前均为 `69f44feac57ec780b354536a4ca4f0646daae5dc`。
- M4-46 main push CI 已成功，run `28061860448` / job `83077665952`，head SHA `69f44feac57ec780b354536a4ca4f0646daae5dc`。
- 开工前 root/main status 为 `## main...origin/main`；`gh pr list --state open --json number,title,headRefName,url,isDraft` 返回 `[]`；`git branch --no-merged main` 无输出。
- 项目 owner signoff input：用户在本线程说“m4可以签收了，通过。”，日期 2026-06-24。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m4-47-owner-closeout-signoff` |
| branch | `codex/m4-47-owner-closeout-signoff` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes, runtime release gates, production configuration, M5/M6 scope or customer/order data.

## 事故与 closeout 记录

- Incident: none created by this spec.
- Pre-branch hygiene cleanup: before creating this worker, coordinator removed untracked stale duplicate paths `docs/evidence/M4/spikes 2/`, `docs/specs/M4-46-audit-closeout-readiness 2.md`, `scripts/tests/m4-audit-closeout-readiness.test 2.mjs`; pruned stale worktree metadata for non-existent worker paths; and deleted local stale branches for merged PRs #102, #103, #104 and #106. After cleanup, root/main was clean, open PR list was `[]`, and `git branch --no-merged main` had no output.
- If any raw customer/order text, real order ID, model output, prompt/route text or secret is detected in generated docs, stop and cleanup before continuing.

## 实施步骤

1. 新增本 M4-47 docs-only spec。
2. 新增 `docs/evidence/M4/M4-47-owner-closeout-signoff.md`，记录 owner signoff input 原文、日期、start audit、M4 evidence basis、boundary、validation 与 review。
3. 更新 `docs/evidence/M4/README.md` 的 M4 状态与 M4-47 索引，保持非 production、非 GA-0、非真实客户流量、非 customer LLM、非生产 Redis/worker、非正式告警路由、非 production eval gate、非 1.0 release signoff 边界。
4. 运行 required validation，复核 diff 只含 allowlist 文件。

## 通过条件

- Diff 只包含本 spec、`docs/evidence/M4/M4-47-owner-closeout-signoff.md` 和 `docs/evidence/M4/README.md`。
- M4 status 更新为 `owner_accepted_m4_milestone_evidence` 或同等清晰 token。
- Evidence 记录项目 owner signoff input 原文与日期。
- Evidence 与 README 明确该接受只覆盖 M4 milestone evidence，不代表 production、GA-0、真实客户流量、customer LLM、生产 Redis/worker、正式告警路由、真实客户/订单数据、production eval gate 或 1.0 release signoff。
- Follow-up blockers 与 sensitive-data boundary 保留；不提交 raw CSV/XLSX/export/jsonl、真实订单/客户数据、客户明文、Telegram payloads、screenshots、voice transcripts、order IDs、phone/address/payment data、support personal accounts or secrets。
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-47-owner-closeout-signoff.md --include-worktree`, `git diff --check origin/main...HEAD`, `git status --short --branch`.

## 失败分支

- 若 owner signoff input 不是明确签收或含条件：保持 `m4_ready_for_owner_closeout_review`，记录待确认条件，不更新为 owner accepted。
- 若 M4-46 main push CI 或当前 `main` 状态无法被当前 GitHub/repo 状态证明：保持 `m4_ready_for_owner_closeout_review`，记录缺口并停止。
- 若 validation 发现 docs-only diff 外的文件变化：停止并清理本 worker 产生的越界改动；不得扩大 touch list。
- 若 evidence wording 误写为 production、GA-0、real traffic、customer LLM、生产 Redis/worker、正式告警路由、production eval gate 或 1.0 release 已关闭：修正为 M4 milestone evidence only，不继承错误表述。
- 若发现 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets：关闭本 PR，先执行清理/泄露处置 spec。
- 若当前 worktree/path/branch 与前置条件不一致：停止并报告，不在错误 checkout 写入。

## 不做什么

- 不修改 `apps/**`、`packages/**`、`scripts/**`、configs、lockfile、generated/dist、contracts、runbooks、raw samples、root checkout 或其他 worktree。
- 不实现或改动 production DB repository、formal auth runtime、Admin owner production flow、worker/Redis deployment、formal alert routing、external order API connector、XLSX parser、real eval fixtures、LLM/provider judge、production eval gate、M5/M6 或真实客户/订单流量。
- 不批准 production、GA-0、real customer traffic、customer LLM、production worker/Redis deployment、formal alert routing、real customer/order data, production eval gate 或 1.0 release。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets。

## 验收映射

| Item | M4-47 status | Notes |
|---|---|---|
| B-01 | owner_accepted_m4_milestone_evidence | Owner accepts current M4 RLS/customer/order smoke evidence; full durable SQL/RLS matrix remains future scope. |
| B-05 | owner_accepted_m4_milestone_evidence | Owner accepts M4 restore audit persistence smoke evidence; audit query UI and production audit runtime remain future scope. |
| D-04 | owner_accepted_m4_milestone_evidence | Owner accepts M4 customer asset runtime workflow evidence; full aggregation remains future scope. |
| D-05 | owner_accepted_m4_milestone_evidence | Owner accepts M4 restore runtime smoke evidence; owner production flow remains future scope. |
| D-07 | owner_accepted_m4_milestone_evidence | Owner accepts M4 field/tag runtime smoke evidence; analysis reuse remains future scope. |
| E-01 | not_current_blocker__no_api_for_m4 | No usable API docs/sandbox credentials for current M4 branch; future API reopening requires owner-provided evidence and spec/ADR update. |
| E-02 | owner_accepted_m4_milestone_evidence | Owner accepts no-API import snapshot main-path evidence for M4; XLSX parser, production worker deployment and real import sample evidence remain future scope. |
| E-03 | owner_accepted_m4_milestone_evidence | Owner accepts stale/missing warning M4 evidence; persisted warning storage remains future scope. |
| E-04 | owner_accepted_m4_milestone_evidence | Owner accepts controlled no-fabrication bridge evidence; real fixtures, provider judge and production eval gate remain future scope. |
| I-01 | owner_accepted_m4_milestone_evidence | Owner accepts M4 desktop path smoke/readiness evidence; broader desktop core and formal production auth remain future scope. |
| J-02 | owner_accepted_m4_milestone_evidence | Owner accepts M4 queue/runtime/security smoke evidence; production Redis/worker deployment and formal alert routing remain future scope. |
| J-05 | owner_accepted_m4_milestone_evidence | M4 evidence is signed during M4 rather than deferred to M6; production/release signoff remains later scope. |
| K-03 | active | One spec / one PR; this PR only implements M4-47 docs-only owner closeout signoff record. |
| K-04 | active | Touch modules explicit; docs-only; no source/test/config/lock/generated changes. |

M4-47 不关闭任何 1.0 production acceptance item，只记录 M4 milestone evidence 已获项目 owner 明确接受。
