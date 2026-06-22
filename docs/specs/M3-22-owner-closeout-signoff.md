# M3-22 Owner Closeout Signoff

## 目标

记录项目 owner 对 M3 test-stage closeout evidence 的明确签收，将 M3 closeout 状态从 `foundation_queue_complete__test_stage_f02_g04_ready__owner_signoff_pending` 更新为 `owner_accepted_m3_test_stage_closeout_evidence`，并同步 M3 evidence index。本 spec 只记录 M3 里程碑证据签收事实，不实现新功能、不修改 runtime、不批准 production、GA-0、真实客户流量、customer LLM、prompt/model route release、knowledge publish、AI persona release、M4 或 1.0 release。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：项目 owner 已在 Codex 线程中明确回复“如果已经不是no-go那就签收m3收口，然后我会在新的窗口开始m4，你这里只负责跟m3有关的”作为 M3 test-stage closeout evidence 接受输入，日期为 2026-06-22。项目 owner 仍负责 production/GA-0、真实账号、真实客户数据、customer LLM、provider keys/routes、知识发布、AI 人设发布、M4 任务启动、成本、合规和 1.0 release 风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-22-owner-closeout-signoff` / `codex/m3-22-owner-closeout-signoff` 中执行，读取 live docs 与当前 repo state，新增本 spec 和 M3-22 evidence，更新 M3 closeout evidence 与 M3 README，准确记录 owner signoff input，并保留 M3 production/GA-0/real traffic/customer LLM/M4/release 边界。

## 时间盒

0.1 个工作日。若 owner signoff input、当前 worktree/branch、M3 closeout evidence 或 required validation 无法证明，则保持 M3 状态为 `foundation_queue_complete__test_stage_f02_g04_ready__owner_signoff_pending` 并记录 `blocked_needs_owner_signoff_record_refresh`，不得写成 owner accepted。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M3-22-owner-closeout-signoff.md`
- `docs/evidence/M3/M3-22-owner-closeout-signoff.md`
- `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`
- `docs/evidence/M3/README.md`

说明/备注：

本 PR 只允许新增 M3-22 owner signoff docs-only spec/evidence，并就地同步 M3 closeout evidence 与 M3 evidence index。未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples、root checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0；net source LOC <= 0；new source files <= 0。
- path categories：docs = 本 spec、M3-22 evidence、M3 closeout evidence、M3 evidence README；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `owner_signoff_pending`、`owner acceptance`、`owner signoff`、`M3 closeout`、`M3-21`、`M2-11`、`签收` 于 `docs/specs` 与 `docs/evidence`，确认现有 M3 closeout evidence 停留在 owner signoff pending，需要新增 docs-only owner signoff record，不需要新增或修改 source。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，只引用项目 owner 在 Codex 线程中的明确签收输入。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-22-owner-closeout-signoff`。
- 当前分支必须是 `codex/m3-22-owner-closeout-signoff`。
- 禁止修改 root checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert 他人改动。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3 closeout evidence、M3 README、M3-21 spec/evidence、M2-11 owner acceptance pattern 和 `docs/preflight/01-owner-inputs-checklist.md`。
- 开工前必须记录：`pwd`、`git status --short --branch`、`git branch --show-current`、root/main status、open PR 和 no-merged branch 状态。
- 当前 branch 创建基线为 `main` at `8533923`.
- 项目 owner signoff input：用户在本线程说“如果已经不是no-go那就签收m3收口，然后我会在新的窗口开始m4，你这里只负责跟m3有关的”，日期 2026-06-22。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m3-22-owner-closeout-signoff` |
| branch | `codex/m3-22-owner-closeout-signoff` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes, runtime release gates, production configuration, M4 files or customer data.

## 事故与 closeout 记录

- Incident: none at authoring.
- If any raw customer text, raw reply, model output, prompt/route text or secret is detected in generated docs, stop and cleanup before continuing.

## 实施步骤

1. 新增本 M3-22 docs-only spec 和 evidence record。
2. 更新 `docs/evidence/M3/M3-ai-capability-closeout-signoff.md` 的 header status、review notes、signoff、Current Decision、M3-22 ledger、J-05/status mapping、validation/spec compliance 和 Signoff Boundary。
3. 在 closeout evidence 中记录 owner signoff input 原文与日期：2026-06-22。
4. 更新 `docs/evidence/M3/README.md` 的 M3 状态与 M3-22 索引，保持非 production、非 GA-0、非真实客户流量、非 customer LLM、非 prompt/model route release、非 knowledge publish、非 AI persona release、非 M4、非 1.0 release signoff 边界。
5. 运行 required validation，复核 diff 只含 allowlist 文件。

## 通过条件

- Diff 只包含本 spec、M3-22 evidence、M3 closeout evidence 和 M3 README。
- M3 closeout status 更新为 `owner_accepted_m3_test_stage_closeout_evidence` 或同等清晰 token。
- Closeout evidence 记录项目 owner signoff input 原文与日期。
- Closeout evidence 与 README 明确该接受只覆盖 M3 test-stage closeout evidence，不代表 production、GA-0、真实客户流量、customer LLM、prompt/model route release、knowledge publish、AI persona release、M4 或 1.0 release signoff。
- Future-gated production blockers 与 sensitive-data boundary 保留；不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、order IDs、phone/address/payment data、support personal accounts or secrets。
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-22-owner-closeout-signoff.md --include-worktree`, `git diff --check origin/main...HEAD`, and full `npm run check` if feasible.

## 失败分支

- 若 owner signoff input 不是明确签收或含条件：保持 `owner_signoff_pending`，记录待确认条件，不更新为 owner accepted。
- 若 validation 发现 docs-only diff 外的文件变化：停止并清理本 worker 产生的越界改动；不得扩大 touch list。
- 若 evidence wording 误写为 production、GA-0、real traffic、customer LLM、prompt/model route release、knowledge publish、AI persona release、M4 或 1.0 release 已关闭：修正为 M3 test-stage closeout evidence only，不继承错误表述。
- 若发现 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets：关闭本 PR，先执行清理/泄露处置 spec。
- 若当前 worktree/path/branch 与前置条件不一致：停止并报告，不在错误 checkout 写入。

## 不做什么

- 不修改 `apps/**`、`packages/**`、`scripts/**`、configs、lockfile、generated/dist、contracts、runbooks、raw samples、root checkout 或其他 worktree。
- 不实现或改动 production DB repository、API、WebSocket runtime、admin API client、worker/engine integration、queue consumer、real Bot staging/prod config、Telegram Business adapter/UI/API、LLM/provider/prompt/model route、knowledge import/publish、GA-0、M4 或真实客户流量。
- 不批准 production、GA-0、real customer traffic、customer LLM、prompt/model route release、knowledge publish、AI persona release、Business release、M4 或 1.0 release。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息、客服个人账号或 secrets。

## 验收映射

| Item | M3-22 status | Notes |
|---|---|---|
| J-05 | owner_accepted_m3_test_stage_closeout_evidence | 项目 owner 接受 M3 test-stage closeout evidence，不把 M3 证据签收留到 M6 集中补签；production/release/M4 signoff remains later scope. |
| K-03 | active | 一 spec / 一 PR；本 PR 只实现 M3-22 docs-only owner closeout signoff record。 |
| K-04 | active | Touch modules explicit；docs-only；不进入 source/test/config/lock/generated。 |

M3-22 不关闭任何 1.0 production acceptance item，只记录 M3 test-stage closeout evidence 已获项目 owner 明确接受。
