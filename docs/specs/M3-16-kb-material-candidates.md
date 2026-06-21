# M3-16 KB Material Candidates

## 目标

从项目 owner 提供的高频 QA 文件和本机受控脱敏 Telegram 样本中提炼 M3 知识库候选包，补齐 `docs/evidence/M3/tutorial/` 下的教程素材 manifest 与 journey import draft evidence。

本 spec 只生成候选知识材料与证据，不写入正式知识库，不发布知识，不新增 runtime/source code，不关闭 M3，不启动 M4，不放行 production、GA-0、真实客户流量、customer LLM、prompt/model/persona release 或 1.0 release。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认是否接受本 PR 作为“知识库候选包已生成、进入 owner review”的记录；如果 owner 在本 PR 周期内完成审核，AI agent 可将证据状态更新为 `owner_review_completed_no_corrections_provided` 或记录 owner 提供的修正项。后续仍需确认是否允许进入正式知识库、导入、评测或发布流程。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-16-kb-material-candidates` / `codex/m3-16-kb-material-candidates` 中执行；读取已脱敏本地材料，提炼通用知识，不提交原始聊天、原始截图、客户明文、Telegram payload、订单号、电话、地址、支付信息、客服个人账号、raw prompt/completion 或 secrets。

## 时间盒

0.5 个工作日。若候选生成需要提交原始材料、未脱敏内容、真实客户明文、数据库写入、正式知识发布、LLM provider 调用或 runtime integration，则停止并保持候选状态。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M3-16-kb-material-candidates.md`
- `docs/evidence/M3/M3-16-kb-material-candidates.md`
- `docs/evidence/M3/tutorial/tutorial-materials-manifest.md`
- `docs/evidence/M3/tutorial/journey-import-report.md`
- `docs/evidence/M3/tutorial/kb-candidate-pack.md`
- `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`
- `docs/evidence/M3/README.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw/export/jsonl/csv、客户明文、Telegram payload、screenshots、voice transcripts、orders、phone/address/payment data、support personal accounts、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0；net source LOC <= 0；new source files <= 0。
- path categories：docs = this spec、M3-16 evidence、tutorial manifest、journey import report、candidate pack、M3 closeout evidence sync、M3 evidence README。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `M3-16`、`tutorial-materials-manifest`、`journey-import-report`、`kb-candidate`、`knowledge material`、`知识候选`、`FAQ`、`FQA`、`Telegram`。当前缺口是 owner-provided knowledge material 候选 evidence，不是 runtime implementation。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 spec 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-16-kb-material-candidates`。
- 当前分支必须是 `codex/m3-16-kb-material-candidates`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许只读核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、root/main status、open PR 和 no-merged branch 状态。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-04 spec/evidence、M3 closeout evidence、M3 README、`docs/preflight/01-owner-inputs-checklist.md`。
- 输入材料只允许来自本机受控路径：
  - `/Users/atilla/Documents/agent_startup_60_high_frequency_QA.md`
  - `/Users/atilla/Documents/聊天记录_脱敏样本/MANIFEST.md`
  - `/Users/atilla/Documents/聊天记录_脱敏样本/telegram_real_seed80_redacted_review.jsonl`
  - `/Users/atilla/Documents/聊天记录_脱敏样本/telegram_real_candidates_redacted.jsonl`
- 输入材料不得复制进仓库；仓库只记录 hash、count、review status、source ref 和提炼后的候选知识。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m3-16-kb-material-candidates` |
| branch | `codex/m3-16-kb-material-candidates` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes, runtime release gates or production configuration.

## 事故与 closeout 记录

- Incident: none at authoring.
- If any raw/customer/secret content is detected in generated docs, stop and cleanup before continuing.

## 实施步骤

1. 记录 source material hashes、line counts、review status、storage boundary。
2. 从 60 条高频 QA 提炼 canonical knowledge candidates、journey stages、处理边界、handoff triggers。
3. 用脱敏 Telegram 样本补充真实问法覆盖、intent/language counts 和模板 evidence refs，不复制原始问答内容。
4. 生成 `tutorial-materials-manifest.md`、`journey-import-report.md` 和 `kb-candidate-pack.md`。
5. 更新 M3 closeout/README：tutorial blocker 从 `absent` 更新为 `candidate_owner_review_completed_not_published`，但 M3 closeout 仍 blocked。
6. 运行 required validation 并记录结果。

## 通过条件

- Candidate pack covers service intro, account/address, order/prealert/inbound, route/pricing/timing, restricted goods, customs/tax, billing/payment/storage, pickup/delivery and after-sales claims.
- Candidate pack records source refs by QA ids and Telegram sample ids/hashes only; it does not paste raw customer messages or raw Telegram payloads.
- `tutorial-materials-manifest.md` records source file hashes, review status, output artifacts and owner review record.
- `journey-import-report.md` records import draft status, stage keys, evidence refs, blockers and non-publish boundary.
- M3 closeout remains `foundation_queue_complete__owner_inputs_block_closeout`; screenshot samples and blind review remain blocked.
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-16-kb-material-candidates.md --include-worktree`, `git diff --check origin/main...HEAD`, and full `npm run check` if feasible.

## 失败分支

- 若 worktree or branch differs from expected path/branch: stop and report; do not write in the wrong checkout.
- 若 input materials contain unredacted customer identifiers or the repo diff would include raw content: stop, remove generated files and report the boundary issue.
- 若 candidate content requires owner business decision, current price table, account credentials, real API data, legal/compliance judgment or unsupported platform claims: mark as `owner_review_required` or `handoff_required`; do not publish.
- 若 knowledge generation requires DB write, admin UI import, provider route, prompt/model/persona release or eval gate closure: stop and split a future spec.
- 若 validation exposes out-of-scope changes: remove them; do not widen the touch list.

## 不做什么

- 不写入正式知识库，不生成 production knowledge version，不发布 prompt、知识、模型路由或 AI 人设。
- 不提交原始 FAQ 文件、raw Telegram exports、raw/export/jsonl/csv、客户明文、Telegram payload、截图、语音转写、订单号、电话、地址、支付信息、客服个人账号、raw prompt/completion 或 secrets。
- 不实现 DB persistence、API、worker、engine orchestration、admin UI、storage upload、eval fixtures、provider adapter、outbound send、confirmation queue 或 distill。
- 不启动 M4，不放行 M3 owner signoff、GA-0、真实客户流量、customer LLM、Business release 或 1.0 release。

## 验收映射

| Item | M3-16 status | Notes |
|---|---|---|
| F-01 | candidate_owner_review_completed_not_closed | Tutorial/knowledge candidate pack exists and owner review is recorded; future import/eval evidence is still required before closeout. |
| H-01 | material_candidate_owner_reviewed_partial | Knowledge facts/journeys/stages/material refs are drafted as evidence and owner-reviewed; no DB/admin/publish closure. |
| G-03 | not_closed | No production publish path or eval gate release; knowledge publish remains blocked until later gate. |
| J-05 | evidence_updated | M3 evidence now records generated candidate pack instead of absent tutorial material evidence. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only touch list; no schema/lock/shared config changes. |

M3-16 does not close M3. It converts one M3 blocker from missing input to owner-reviewed candidate material; future import/eval/publish gates, screenshot samples and blind-review blockers stay active.
