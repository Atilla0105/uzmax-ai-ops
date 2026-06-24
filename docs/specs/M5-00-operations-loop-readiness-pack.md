# M5-00 Operations Loop Readiness Pack

## 目标

打开 M5 仅用于 spec-governed 的 operations loop 工作：distill health guardrails、confirmation queue、AI member console、analytics center、log center 和 template center。本 PR 只创建 M5 entrypoint docs 和 evidence index，不实现 runtime/source/schema/config/lock 变更，不创建 M5-01 到 M5-08 的实现 spec 文件。

M5 should let owner/operators process candidate changes quickly, see distill health/downshift alerts, control AI member state, and review logs/analytics/templates, without implying release approval.

M5-00 合并后只表示 `m5_readiness_opened__not_accepted`：允许后续 M5 slices 按队列逐个开工，但 M5 尚未 accepted。它不批准下文 `不做什么` 中列出的 release、production、customer-data 和 customer-LLM 边界。

M5 scope 来自 live v1.1 docs：`UZMAX智能运营系统-PRD-v1.1.md` 的 REQ-G03、REQ-T06、REQ-T08、REQ-T11、REQ-T12、REQ-A05；`UZMAX智能运营系统-技术架构-v1.1.md` 的 §4、§6.2、§9、§11；`UZMAX智能运营系统-后台设计与前端架构-v1.1.md` 的模板中心、确认队列、AI 成员、分析与日志；`UZMAX智能运营系统-1.0验收矩阵-v1.1.md` 的 H-01..H-07、I-02、I-06、I-07、J-05。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：项目 owner 确认是否允许从 M4 owner accepted milestone evidence 状态进入 M5 spec queue，并继续负责 GA-0、production readiness、真实账号、真实客户/订单数据、customer LLM、LLM keys/provider release、production Redis/worker deployment、external SaaS onboarding、成本、合规和 1.0 release 风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m5-00-operations-loop-readiness-pack` / `codex/m5-00-operations-loop-readiness-pack` 中执行，重读 AGENTS、spec contract、v1.1 根文档、M4 evidence closeout 和当前 repo/GitHub 状态；记录 M5 queue、current-state audit、parallelism rules、sensitive-data boundary、acceptance mapping 和 validation evidence；不替 owner 做 production、GA-0、customer LLM、真实数据、真实外部 SaaS 或 1.0 release 结论。

## 时间盒

0.2 个工作日。若当前 worktree/branch、M4 owner accepted milestone evidence、GitHub branch/PR hygiene、doc validation 或 allowed touch list 无法证明，则不得标记为 `m5_readiness_opened__not_accepted`，改为记录 `blocked_needs_current_state_or_m4_closeout_refresh`。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5-00-operations-loop-readiness-pack.md`
  - `docs/evidence/M5/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只允许新增 M5 docs-only readiness spec 和 M5 evidence index。
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples、root checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = 本 spec、M5 evidence README；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `M5`、`distill health`、`confirmation queue`、`确认队列`、`AI 成员`、`分析中心`、`日志中心`、`模板中心`、`蒸馏健康` 于 AGENTS、四份 v1.1 根文档、`docs/specs`、`docs/evidence`、`docs/contracts` 和 ADR-003，确认当前缺口是 M5 readiness/spec queue entrypoint，不是 implementation source 归属。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，不声明 production provider、production Redis/worker、external SaaS onboarding 或 release support。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m5-00-operations-loop-readiness-pack`，分支为 `codex/m5-00-operations-loop-readiness-pack`。
- 禁止修改 root checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须重读 `AGENTS.md`、`docs/specs/README.md`、v1.1 PRD、技术架构、后台设计与前端架构、1.0 验收矩阵、`docs/evidence/M4/README.md`、`docs/evidence/M4/M4-47-owner-closeout-signoff.md`。
- 开工前必须记录到 M5 evidence：`pwd`、`git status --short --branch`、`git branch --show-current`、root/main status、`gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft`、root `git branch --no-merged main`。
- 当前 worker `HEAD` 与 `origin/main` 在开工前均为 `a317b6ca5d45768176bf9a69555ab9764bf3605f`。
- M4 current status is `owner_accepted_m4_milestone_evidence` only. That state does not approve production, GA-0, real customer traffic, customer LLM, production Redis/worker deployment, formal alert routing, real customer/order data, production eval gate or 1.0 release.
- M5 status after this docs-only entrypoint is readiness/opening only, not accepted.
- ADR-003 customer-data boundary remains active: no real customer messages, raw prompts/completions, customer plaintext, screenshots, voice transcripts or customer profiles may enter third-party LLM paths without future owner/governance signoff.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5-00-operations-loop-readiness-pack` |
| branch | `codex/m5-00-operations-loop-readiness-pack` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. Touch modules are exactly the allowed list above. This PR does not touch schema, migrations, lockfile, shared config, CI/guard scripts, global generated artifacts, release/production gates, provider routes, runtime deployment, source/test code, M6 scope or customer/order data.

For future M5 workers:

- Workers must use distinct physical worktree paths, distinct branches and non-overlapping machine-readable touch lists.
- `packages/db` schema and migrations are global serial.
- Lockfile, shared config, CI/guard scripts, global generated artifacts and release/production gates are global serial.
- Workers may run in parallel only when touch lists are disjoint and no shared serial point is touched.
- Root/main checkout remains coordination/read-only only.

## 事故与 closeout 记录

- Incident: none created by this spec.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before further M5 work.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear, close this docs PR and perform cleanup/incident handling before continuing.

## 实施步骤

1. 新增本 M5-00 docs-only spec，限定 touch list、budget、preconditions、future slices、parallelism、failure branches、not-doing 和 acceptance mapping。
2. 新增 `docs/evidence/M5/README.md`，记录 start audit、M5 current readiness/opening status、M5-01..M5-08 planned slices、acceptance mapping、sensitive-data boundary 和 validation evidence。
3. 不创建 `M5-01` through `M5-08` future implementation spec files；只记录 planned queue。
4. 运行 required validation，复核 diff 只含 allowlist files。

## M5 Planned Slices

| Order | Planned slice / PR | Goal | Concise touch area | Serial / parallel rule |
|---:|---|---|---|---|
| 1 | `M5-01-db-contract-foundation` | Establish operations-loop persistence/contracts for distill health, confirmation queue, AI member state/performance, analytics/log/template references. | `packages/db/**`, schema/migrations/generated DTO or contract docs only if triggered | Global serial; must land before M5-02..M5-07 rely on persistent contracts. |
| 2 | `M5-02-distill-guardrails` | Enforce candidate cap, 7-day pass-rate calculation, low-pass-rate downshift, owner alert/audit recovery contract. | `packages/distill/**`, distill worker/cron subpaths only as scoped | Depends on M5-01; serial with any worker/cron touch or shared distill scheduler touch. |
| 3 | `M5-03-confirmation-queue-api` | API contracts for approve/edit/discard/conflict diff and no unconfirmed formal writes. | confirmation-queue API/controller/service/repository subpaths | Depends on M5-01/M5-02 contracts; serial with API routing/authz touch if shared files overlap. |
| 4 | `M5-04-confirmation-queue-admin` | Admin confirmation queue flow, keyboard-first cards, amber health banner, mobile pass/discard fallback. | confirmation-queue admin feature/API-client subpaths, frontend patterns as scoped | Depends on M5-03; can run with non-admin/non-API slices only if touch lists are disjoint. |
| 5 | `M5-05-ai-member-console` | AI member state, capability toggles, manual offline, breaker offline, emergency stop/recovery audit and mobile emergency fallback. | ai-member API/admin feature subpaths, audit event contracts as scoped | Serial with M5-06 if audit/log shared paths overlap; no production AI persona release. |
| 6 | `M5-06-logs-analytics` | Analytics fixed board/dimensions and log center query/readback for login, presence and operation logs. | analytics/log API/admin feature subpaths, metric aggregation subpaths as scoped | Depends on M5-01; serial with shared audit/log/metric paths; no raw message scan or broad export data committed. |
| 7 | `M5-07-template-center` | Group template center for knowledge, AI member, config and eval templates; copy-to-tenant creates independent versions. | template-center API/admin feature subpaths, `packages/ops-assets/**` template subpaths as scoped | Depends on M5-01; serial with schema/config/template shared paths; no external SaaS onboarding. |
| 8 | `M5-08-integration-smoke-closeout` | Integration smoke, evidence index sync, M5 closeout readiness/signoff request after prior slices. | `docs/evidence/M5/**`, scoped smoke/e2e paths if prior specs allow | Must run after M5-01..M5-07 are merged, or explicitly superseded/deferred by owner-approved evidence with affected items still `not_closed`; not M6 release hardening. |

## 并行规则

- M5-01 is the first and global serial point for `packages/db` schema, migrations, generated DTO/contracts and shared data shape.
- M5-02 owns distill scheduler/guardrail behavior; M5-03/M5-04 must not create any direct formal knowledge/profile/eval write bypass around confirmation.
- M5-03 and M5-05/M5-06/M5-07 may not run in parallel if they touch the same API routing/module/authz/audit files.
- M5-04, M5-05, M5-06 and M5-07 may run in parallel only when admin feature directories, API clients and UI pattern touch lists are disjoint.
- `packages/db` schema/migrations, lockfile, shared config, CI/guard scripts, global generated artifacts and release/production gates remain global serial.
- Capability packages remain isolated; `packages/capabilities/*` must not import each other. Composition stays in `engine` or explicit API/worker orchestration.
- `apps/admin` only calls API/WS/contracts and must not import backend packages.

## 通过条件

- M5-00 spec contains required fields from `docs/specs/README.md`, M5 scope from live v1.1 docs, future slices M5-01..M5-08, serial/parallel rules, release boundaries, sensitive-data boundary and acceptance mapping.
- M5 evidence README records current-state facts: assigned worktree/branch, root/main read-only status, open PR list, no-merged branch audit, M4 `owner_accepted_m4_milestone_evidence` only, and M5 status `m5_readiness_opened__not_accepted`.
- Diff only includes the two allowlist docs files.
- This PR creates no future implementation specs and changes no `apps/**`, `packages/**`, `scripts/**`, lockfile, config, generated/dist, raw samples, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- Required validation passes or is honestly recorded: `npm ci` if `node_modules` missing, `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-00-operations-loop-readiness-pack --root /Users/atilla/Documents/UZMAX智能运营`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-00-operations-loop-readiness-pack.md --include-worktree`, `git diff --check origin/main...HEAD`.

## 失败分支

- If worktree or branch differs from the expected path/branch: stop and report; do not write in the wrong checkout.
- If M4 status is not owner accepted for milestone evidence or current GitHub hygiene cannot be proven: set M5 status to `blocked_needs_m4_or_repo_hygiene_refresh`; do not open M5 queue.
- If wording implies M5 accepted, M6 release hardening, GA-0 opening, production readiness, real customer traffic/data, customer LLM, production Redis/worker deployment, external SaaS onboarding, automatic knowledge write without confirmation or 1.0 release approval: correct wording before merge.
- If validation exposes docs-only allowlist violations: stop and remove this worker's out-of-scope changes; do not widen the allowlist.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: close this PR and perform cleanup/incident handling before further M5 work.
- If doc-trigger guard requires new docs beyond this scope: stop and split into a separate docs-only spec; do not create placeholder manuals.

## 不做什么

- 不实现 runtime/source code、DB schema、migrations、generated DTOs、OpenAPI、providers、adapters、prompt/model routes、eval runner、admin UI、API/worker/engine integration、tests、fixtures、CI/guard scripts、config 或 lockfile 变更。
- 不创建 `M5-01` through `M5-08` implementation spec files；this pack only records the planned queue。
- 不声明 M5 accepted、M6 release hardening complete、GA-0 opened、production-ready、real customer traffic/data allowed、customer LLM allowed、production Redis/worker deployed、external SaaS onboarded、automatic knowledge write without confirmation allowed 或 1.0 release approved。
- 不提交 raw/export/jsonl/csv、screenshots、voice transcripts、customer plaintext、Telegram payloads、order IDs、phone/address/payment data、support personal accounts、raw prompts/completions、LLM keys 或 secrets。
- 不绕过 confirmation queue 自动写正式知识库、客户档案或 eval set。

## 验收映射

| Item | M5-00 status | Future closure path |
|---|---|---|
| H-01 | queued_not_closed | M5 may contribute confirmation-backed updates through M5-03/M5-04 and template governance through M5-07. Full facts/journeys/stages/materials edit, import, publish and media-upload closure remains future-scoped unless a dedicated M5 implementation spec explicitly covers that full workflow. |
| H-02 | queued_not_closed | M5-03/M5-04 must prove distill candidates require human approve/edit/discard before formal write. |
| H-03 | queued_not_closed | M5-03/M5-04 must prove conflict candidates require side-by-side diff and cannot be skipped into formal storage. |
| H-04 | queued_not_closed | M5-07 covers template copy to tenant with independent versioning. |
| H-05 | not_primary_m5_scope_not_closed | Future template/material refs must preserve storageRef-as-source and Telegram file_id-as-cache; runbook/evidence closure remains outside M5-00. |
| H-06 | queued_not_closed | M5-07 may cover reusable quick-reply/template governance if scoped; public/private quick-reply search/classification/import/export is not closed by M5-00. |
| H-07 | queued_not_closed | M5-01/M5-02/M5-04/M5-06 cover distill health daily cap, pass rate, downshift, owner alert, manual recovery and audit evidence. |
| I-02 | queued_not_closed | M5-04 covers mobile confirmation queue fallback; M5-05 covers AI emergency stop/recovery fallback. |
| I-06 | queued_not_closed | M5-06 covers fixed analytics board, dimensions and export governance. |
| I-07 | queued_not_closed | M5-05/M5-06 cover AI member state/action audit and login/presence/operation log center evidence. |
| J-05 | opened_for_m5 | M5 evidence entrypoint created so M5 evidence is not deferred to M6; no release signoff. |
| K-03 | active | One spec / one PR; this PR only implements M5-00 docs-only readiness pack. |
| K-04 | active | M5 queue and global serial/parallel rules recorded; schema, lockfile, shared config, CI/guard, generated artifacts and release/production gates stay serial. |

M5-00 closes no production acceptance item. It only opens future spec-governed M5 work while recording closeout blockers and release boundaries.
