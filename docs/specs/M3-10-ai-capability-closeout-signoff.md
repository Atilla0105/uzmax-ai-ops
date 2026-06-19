# M3-10 AI Capability Closeout Signoff

## 目标

归档 M3 AI capability foundation queue 的 docs-only closeout/no-go 记录：确认 M3-01 through M3-09 foundation PRs 已完成并合并，当前 GitHub branch/PR hygiene 干净，同时诚实记录 M3 closeout 仍被 owner inputs 阻断。

本 PR 的目标状态是 `foundation_queue_complete__owner_inputs_block_closeout`。它不是 M3 owner 签收完成，不是 production、GA-0、真实客户流量、customer LLM、prompt/model route release、knowledge publish、AI persona release、Business release 或 1.0 release approval。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认是否接受本 PR 作为 M3 foundation queue complete / closeout no-go 记录，并继续负责 phase-one tutorial material pack、>=20 screenshot diagnostic samples、Uzbek Latin/Cyrillic/Russian blind review、真实客户数据、customer LLM、LLM keys/provider route、knowledge publish、AI persona release、GA-0、成本、合规和 1.0 release 风险决策。当前没有 owner 输入证明 M3 closeout 已完成或 owner 已将这些 blocker 显式分支。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-10-ai-capability-closeout-signoff` / `codex/m3-10-ai-capability-closeout-signoff` 中执行；重读 AGENTS、四份 v1.1 根文档、M3-00 readiness pack、M3 evidence README/readiness pack、M3-01 through M3-09 evidence、owner-input checklist 和 M3-07/M3-09 incident records；刷新 git/GitHub hygiene；新增 M3-10 spec/evidence；更新 M3 evidence index/readiness current status；把 M3-07/M3-09 incidents 从 `pending_merge` 更新为已合并后的文档制度化状态；记录 repeat-class follow-up 决策；运行 validation；commit、push、create PR。

## 时间盒

0.25 个工作日。若 M3-01 through M3-09 合并事实、current GitHub hygiene、owner-input blocker 状态、allowed touch list 或 validation 无法被当前 repo/GitHub 状态证明，则不得使用 `foundation_queue_complete__owner_inputs_block_closeout`，改为 `blocked_needs_current_state_or_owner_input_refresh` 并停止扩展范围。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M3-10-ai-capability-closeout-signoff.md`
  - `docs/evidence/M3/README.md`
  - `docs/evidence/M3/M3-ai-capability-readiness-pack.md`
  - `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`
  - `docs/incidents/INC-2026-06-19-m3-07-root-main-worktree-pollution.md`
  - `docs/incidents/INC-2026-06-19-m3-09-root-main-worktree-pollution.md`
- 说明/备注：
  - 本 PR 只允许新增 M3-10 docs-only closeout/no-go spec/evidence，并就地同步 M3 evidence index、readiness current status 和两个已合并 incident 的制度化状态。
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples、screenshots、voice transcripts、customer plaintext、Telegram payloads、orders、phone/address/payment data、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = this spec、M3 evidence README、M3 readiness pack status sync、M3 closeout/no-go evidence、M3-07/M3-09 incident records；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `M3-10`、`ai-capability-closeout`、`foundation_queue_complete`、`owner_inputs`、`institutionalized_in_docs`、`pending_merge`、`closeout` 于 `docs/specs`、`docs/evidence/M3` 和 `docs/incidents`，确认当前缺口是 M3 closeout/no-go 文档记录与 incident 状态同步，不需要新增或修改 source。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；不释放 real provider route。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-10-ai-capability-closeout-signoff`，分支必须是 `codex/m3-10-ai-capability-closeout-signoff`。
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/M3-00-ai-capability-readiness-pack.md`、`docs/evidence/M3/README.md`、`docs/evidence/M3/M3-ai-capability-readiness-pack.md`、`docs/evidence/M3/M3-01*` through `M3-09*`、`docs/preflight/01-owner-inputs-checklist.md`、`docs/incidents/README.md`、M3-07/M3-09 incident records。
- 若 worktree 没有 `node_modules`，先运行 `npm ci`。
- 开工前必须执行 `git fetch --prune`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url`。
- Current-state baseline before this docs diff: `HEAD` = `origin/main` = `1ae6b0ec8d60eb25623b78f600d588d88debc052` after M3-09 merge.
- M3-01 through M3-09 foundation queue must be verified as merged to `main`; otherwise this PR cannot use `foundation_queue_complete__owner_inputs_block_closeout`。
- Owner-input blockers remain unresolved unless repo evidence or owner branch decision exists:
  - phase-one tutorial material pack: expected evidence `docs/evidence/M3/tutorial/tutorial-materials-manifest.md` and `docs/evidence/M3/tutorial/journey-import-report.md`;
  - screenshot diagnostic samples >=20: expected evidence `docs/evidence/M3/vision/screenshot-cases-manifest.md` and `docs/evidence/M3/vision/eval-run-report.md`;
  - Uzbek Latin/Cyrillic/Russian blind review: expected evidence `docs/evidence/M3/language-blind-review/blind-review-report.md`。
- ADR-003 customer-data boundary remains active: no real customer messages, screenshots, voice transcripts or customer profiles may enter third-party LLM paths without future owner/governance signoff。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m3-10-ai-capability-closeout-signoff` |
| branch | `codex/m3-10-ai-capability-closeout-signoff` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes, runtime release gates or production configuration.

## 事故与 closeout 记录

- M3 known incidents:
  - `docs/incidents/INC-2026-06-19-m3-07-root-main-worktree-pollution.md`
  - `docs/incidents/INC-2026-06-19-m3-09-root-main-worktree-pollution.md`
- Both incidents are no longer `pending_merge` after their PRs merged to `main`; this PR updates their institutionalized state to `institutionalized_in_docs` because the incident records and per-slice controls are now in repo evidence.
- The repeat class is path-agnostic edit tools writing into root/main despite shell workdir checks. Existing M2 `guard:workspace` plus incident docs catch workspace status and encode stop/report behavior, but they do not technically bind `apply_patch` targets to an assigned worktree. M3-10 therefore recommends a future governance/guard/runbook spec before the next broad parallel milestone if the project owner wants stronger machine enforcement. This PR does not implement that guard because it is docs-only and outside the allowed touch list.

## 实施步骤

1. 新增本 M3-10 docs-only spec，限定 touch list、budget、owner/AI boundary、failure branches、not-doing 和 acceptance mapping。
2. 新增 `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`，记录 M3 queue merged facts、current GitHub hygiene、owner-input blockers、release non-approval、incident status changes、validation 和 no-go decision。
3. 更新 `docs/evidence/M3/README.md`，把 current status 指向 M3-10 closeout/no-go evidence，并更新 M3-07/M3-09 incident 状态说明。
4. 更新 `docs/evidence/M3/M3-ai-capability-readiness-pack.md` 的 current status，使 readiness pack 不再停留在 M3-00 queue-open 状态。
5. 更新 M3-07/M3-09 incident records，把 `pending_merge` 改为 `institutionalized_in_docs`，并在 M3-09 中记录 broader guard/runbook follow-up recommendation。
6. 运行 required validation，复核 diff 只含 allowlist docs files，完成 spec compliance review 与 docs quality review。

## 通过条件

- M3-10 spec contains required fields, docs-only scope, machine-readable touch modules, source budget 0/0/0, preconditions, implementation steps, pass criteria, failure branches, not-doing and acceptance mapping.
- M3 closeout evidence records current state as `foundation_queue_complete__owner_inputs_block_closeout`, not owner-accepted/closed.
- Evidence explicitly verifies M3-01 through M3-09 foundation queue completion and current GitHub hygiene.
- Evidence records unresolved owner-input blockers and uses `blocked_until_owner_input_or_owner_branch_decision` for M3 closeout blockers without claiming the owner explicitly branched them.
- PR states no production/GA-0/real traffic/customer LLM/prompt/model route release/knowledge publish/AI persona release/1.0 release approval.
- Acceptance mapping is honest: M3 foundation queue done; F-01/F-02/G-04 and full G-06/H-01/I-01 remain not closed; J-05 evidence rolling archive updated; K-03/K-04 active; production/release not approved.
- M3-07 and M3-09 incident statuses are updated from `pending_merge` to a status allowed by `docs/incidents/README.md`; M3-09 records the repeat-class broader guard/runbook follow-up decision without implementing a new guard.
- Diff only includes the six allowed docs files.
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-10-ai-capability-closeout-signoff.md --include-worktree`, `git diff --check origin/main...HEAD`, and full `npm run check` if feasible.

## 失败分支

- 若 worktree 或 branch 不匹配：停止并报告；不得写错 checkout。
- 若 root/main checkout 出现本 worker 写入痕迹：停止，报告影响范围，并进入 incident/cleanup path。
- 若 M3-01 through M3-09 合并事实、main CI 或 GitHub hygiene 无法证明：使用 `blocked_needs_current_state_refresh`，不得声明 foundation queue complete。
- 若 owner-input evidence for tutorial material pack, >=20 screenshot samples or blind review is absent and no owner branch decision exists：M3 closeout remains `blocked_until_owner_input_or_owner_branch_decision`；不得写成 accepted/closed。
- 若 wording implies production, GA-0, real customer traffic, customer LLM, prompt/model route release, knowledge publish, AI persona release or 1.0 release approval：修正文案后再验证。
- 若 validation exposes docs-only allowlist violations：停止并移除本 worker out-of-scope changes；不得扩大 touch list。
- 若 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone/address/payment data、support personal accounts or secrets appear：关闭本 PR 并执行 cleanup/incident handling before further work。

## 不做什么

- 不实现 runtime/source code、DB schema、migrations、generated DTOs、OpenAPI、providers、adapters、prompt/model routes、eval fixtures、eval runner、admin UI、API/worker/engine integration、tests、guard scripts 或 runbooks。
- 不声明 M3 owner accepted、production-ready、GA-0、real customer traffic、customer LLM、prompt/model route release、knowledge publish、AI persona release、Business release 或 1.0 release approval。
- 不提交 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw prompt/completion 或 secrets。
- 不实现新的 workspace guard；只记录 M3-09 repeat-class follow-up recommendation。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-10 status | Notes |
|---|---|---|
| F-01 | foundation_done_owner_input_blocked_not_closed | M3-04 stage localization/stage-card-only foundation merged; full tutorial closeout remains blocked by phase-one tutorial material pack and journey import/eval evidence. |
| F-02 | foundation_done_owner_input_blocked_not_closed | M3-06 screenshot diagnostics foundation merged; closeout remains blocked by >=20 owner screenshot samples and eval run evidence. |
| F-03 | foundation_done_not_closed | M3-07 speech contract foundation merged; real/integration voice sample flow and provider/spike decisions remain future. |
| F-04 | foundation_done_not_closed | M3-05 pricing contract foundation merged; DB persistence/E2E quote flow remain future. |
| F-05 | foundation_supported_not_closed | M3-02/M3-03/M3-05/M3-06/M3-08 foundation evidence supports redline/context boundaries; production output filter remains future. |
| F-06 | foundation_done_not_closed | M3-08 breaker radius/output guard foundation merged; real fault injection/runtime persistence remains future. |
| G-01 | foundation_done_not_closed | M3-02 route/fallback foundation merged with mock providers only; no real provider route release. |
| G-02 | foundation_done_not_closed | M3-01/M3-02 accounting/log contracts merged; no persistence dashboard or real provider calls. |
| G-03 | foundation_and_ui_partial_not_closed | M3-03 publish refusal semantics and M3-09 local UI evidence merged; no production publish API/admin integration. |
| G-04 | owner_input_blocked_not_closed | Uzbek Latin/Cyrillic/Russian blind review evidence is absent; strong-model routing/optimization remains locked/frozen by v1.1 rules. |
| G-05 | foundation_supported_not_closed | M3-03/M3-08 false-positive/output guard foundation exists; no admin false-positive dashboard closure. |
| G-06 | partial_foundation_full_not_closed | Seed/foundation quota shapes exist, but full 1.0 >=200 set and category quota closure remain future. |
| H-01 | partial_foundation_not_closed | M3-01/M3-04/M3-09 knowledge/resource foundation evidence merged; no real knowledge publish, owner tutorial pack, media upload or persistence closure. |
| I-01 | local_ui_partial_not_closed | M3-09 local knowledge/eval shell merged; full desktop core remains broader 1.0. |
| J-05 | evidence_rolling_archive_updated | M3 evidence is recorded per slice and now rolled up in M3-10 no-go evidence; no release signoff. |
| K-03 | active | One spec / one PR maintained; this branch implements only M3-10. |
| K-04 | active | M3 queue/touch module discipline recorded; M3-10 has no schema/lock/shared config changes. |

M3-10 does not close M3 as owner accepted. It records `foundation_queue_complete__owner_inputs_block_closeout` and keeps production/release decisions blocked.
