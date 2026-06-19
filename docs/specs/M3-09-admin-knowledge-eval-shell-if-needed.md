# M3-09 Admin Knowledge Eval Shell If Needed

## 目标

为 M3 增加最小后台知识/资源与 eval gate evidence shell：在现有 React/Vite admin shell 中展示事实、旅程、阶段、素材四类知识/资源的本地管理结构，并展示 production eval gate failed 状态、失败项与 prompt/knowledge/model route 发布被 gate 阻断的语义。

本 PR 只提供 synthetic/local admin UI shell 与 Playwright evidence，用于 H-01/I-01/G-03 的 partial/foundation evidence。它不实现 production API、真实知识发布、真实 eval fixture、真实 provider/customer LLM、prompt/model route release、GA-0、M3 closeout、full desktop core 或 1.0 release approval。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本 PR 只合并 M3 后台本地 UI shell 和证据，不代表 production-ready、真实 API、真实知识发布、真实 eval fixture、真实 provider/customer LLM、GA-0、M3 closeout、full H-01/I-01/G-03 closure 或 1.0 release approval。Owner 仍负责教程素材包、截图样例、乌语/俄语盲评、真实客户数据、LLM key/provider release、知识发布、成本、合规和发布风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed` / `codex/m3-09-admin-knowledge-eval-shell-if-needed` 中执行；重读 AGENTS、四份 v1.1 根文档、M3-00 readiness pack、M3 evidence README、M3-03/M3-04 spec/evidence、现有 admin source 与 Playwright；记录 start audit、实现本地 shell、扩展 Playwright、更新 evidence、完成 spec compliance review/code quality review、validation、commit、push、PR；复核 no backend import、no DB/capability/eval/runtime import、no sensitive sample content、no lock/config/generated churn、no test weakening。

## 时间盒

0.5 个工作日。若本地 admin shell 无法在预算内通过 Playwright 与 required validation，则记录失败并停止或拆小；不得夹带 API/worker/engine/DB/capabilities/evals/llm-gateway/provider/production gate runtime work 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M3-09-admin-knowledge-eval-shell-if-needed.md`
- `docs/incidents/INC-2026-06-19-m3-09-root-main-worktree-pollution.md`
- `docs/evidence/M3/README.md`
- `docs/evidence/M3/M3-09-admin-knowledge-eval-shell-if-needed.md`
- `apps/admin/src/App.tsx`
- `apps/admin/src/M3KnowledgeEvalShell.tsx`
- `apps/admin/src/m3-knowledge-eval-shell.css`
- `apps/admin/tests/design.spec.ts`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `packages/db` schema/migrations/generated DTOs、`packages/evals/**`、`packages/capabilities/**`、`packages/engine/**`、`packages/llm-gateway/**`、`packages/authz/**`、`packages/channels/**`、`apps/api/**`、`apps/worker/**`、`apps/cron/**`、lockfile、shared config、CI/guard scripts、generated/dist、real eval fixtures、provider SDKs、prompts、model routes、real API clients、raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone/address/payment data、support personal accounts、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 3；new source files <= 2；net source LOC <= 450。
- source = `apps/admin/src/App.tsx`、`apps/admin/src/M3KnowledgeEvalShell.tsx`、`apps/admin/src/m3-knowledge-eval-shell.css`。
- test = `apps/admin/tests/design.spec.ts`。
- docs = this spec、incident record、M3 evidence README、M3-09 evidence。
- generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `M3Knowledge`、`KnowledgeEval`、`knowledge eval`、`eval gate`、`production gate`、`Knowledge and resources`、`M3-09`、`知识与资源`、`评测中心`、`M2ConversationTicketShell`、`admin shell`、`synthetic local`。当前 admin 只有 M1 group/tenant/release shell 与 M2 conversation/ticket shell；没有现成 M3 knowledge/eval component 可扩展。`apps/admin/src/App.tsx` 已接近 React 组件文件长度限制，因此新增 `M3KnowledgeEvalShell.tsx` 与 scoped CSS，`App.tsx` 只挂载。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，不声明 real provider support、real eval runner、production route 或 knowledge publish。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed`，分支必须是 `codex/m3-09-admin-knowledge-eval-shell-if-needed`。
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current` 并写入 M3-09 evidence。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/M3-00-ai-capability-readiness-pack.md`、`docs/evidence/M3/README.md`、M3-03/M3-04 spec/evidence、现有 admin source 和 Playwright 测试。
- 若 worktree 没有 `node_modules`，先运行 `npm ci`，不得修改 lockfile。
- 若 open PR 或未合并分支与本 spec touch modules 冲突，停止并报告 BLOCKED。
- ADR-003 dev-only/customer-LLM-blocked 边界仍生效：本 PR 不消费真实客户数据，不存 prompt/completion/customer sample content，不让真实客户消息、截图、语音转写或客户档案进入第三方 LLM。
- Owner-input blockers from M3-00 remain open: tutorial material pack, >=20 screenshot samples and Uzbek Latin/Cyrillic/Russian blind review block M3 closeout unless later repo evidence or owner branch decision exists.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed` |
| branch | `codex/m3-09-admin-knowledge-eval-shell-if-needed` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes or production release gates.

## 事故与 closeout 记录

- Incident: `docs/incidents/INC-2026-06-19-m3-09-root-main-worktree-pollution.md`.
- During M3-09 implementation, a relative `apply_patch` wrote this worker's files into root/main checkout `/Users/atilla/Documents/UZMAX智能运营` instead of the assigned worktree. The worker stopped before commit/push/PR. Coordinator sealed the polluted tracked diff at `/tmp/uzmax-m3-09-root-pollution.t5hQeY/tracked.patch`, sealed untracked files at `/tmp/uzmax-m3-09-root-pollution.t5hQeY/untracked.tgz`, cleaned root/main, and verified root/main clean before this worker resumed.
- Permanent controls for this PR: edits must use absolute paths or `git -C /Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed`; relative-path `apply_patch` is prohibited; after any migration/archive restore/large edit/formatter/generated write, run both assigned-worktree and root/main `git status --short --branch`.
- If this worker detects cross-worktree write, wrong branch/main commit, secret/customer-data boundary issues, gate bypass, or repeated process failure, it must stop and create or reference `docs/incidents/` per `docs/specs/README.md`.

## 实施步骤

1. 新增本 M3-09 spec，限定 touch list、budget、owner/AI boundary、failure branches、not-doing 和 acceptance mapping。
2. 新增 M3-09 evidence 并更新 M3 evidence README，记录 synthetic/local shell boundary and partial-only H-01/I-01/G-03 mapping。
3. 在 `apps/admin/src/M3KnowledgeEvalShell.tsx` 实现 synthetic/local knowledge/resource + eval gate UI：事实、旅程、阶段、素材四类可见；production gate failed；失败项可见；prompt/knowledge/model route publish/save/release actions disabled/blocked。
4. 在 scoped CSS 中实现高密度 operations tool 布局，使用现有 tokens/classes，无 inline style，无 landing page/hero。
5. 在 `App.tsx` 挂载 M3 shell，保持 M1/M2 shell 现有测试能力。
6. 扩展 Playwright 覆盖 desktop、320px mobile floor、four knowledge/resource types、failed eval gate、disabled blocked actions、sensitive text absence、no horizontal overflow。
7. 运行 required validation，完成 spec compliance review 与 code quality review。

## 通过条件

- Admin shell 扩展现有 `App.tsx` + M2 shell 模式，不新造平行后台架构。
- Admin 仍为纯前端/API-client 边界：除 React、`@uzmax/ui-tokens/tokens.css` 和本地 CSS/组件外，不 import 后端包、DB、capabilities、engine、evals、llm-gateway、authz、channels 等业务包。
- UI 是 high-density operations tool，不是 landing page；使用表格/列表/标签/状态，使用 tokens/CSS classes，无组件内字面量 style。
- Four knowledge/resource types are visible: facts, journeys, stages, materials.
- Eval gate shows production gate failed/blocked state, failed items, and prompt/knowledge/model route release refusal semantics.
- Publish/save/production actions are disabled or visibly blocked.
- Wording remains honest: synthetic/local shell only; no production-ready, real API, real knowledge publish, real eval fixture, real provider/customer LLM, GA-0 or 1.0 release claim.
- Playwright covers M3 shell desktop and 320px mobile with no horizontal overflow and sensitive text absence.
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-09-admin-knowledge-eval-shell-if-needed.md --include-worktree`, `git diff --check origin/main...HEAD` or equivalent, focused Playwright / `npm run playwright`, and `npm run check` if feasible.
- No lockfile, generated/dist, shared config, CI/guard script, backend runtime, DB schema or capability package changes.

## 失败分支

- 若 worktree 或 branch 不匹配：停止并报告；不得写错 checkout。
- 若 open PR or unmerged branch conflicts with this touch list：停止并报告 BLOCKED。
- 若 UI 需要 real API/WS/DB/schema/eval runner/provider to pass：保留 synthetic/local shell，真实 integration 拆到后续 spec；不得扩大本 PR 范围。
- 若 eval gate semantics need runtime publish API/admin API：只展示 M3-03 foundation refusal semantics；runtime publish path remains future。
- 若 knowledge/resource management needs real owner tutorial pack, real fixture, storage upload or knowledge publish：只展示 local controlled shell and blockers；不得提交 sensitive source material。
- 若 wording implies production readiness, real API, real knowledge publish, real eval fixture, real provider/customer LLM, GA-0, full M3 closeout or 1.0 release：修正文案后再验证。
- 若 raw/export/jsonl/csv、customer plaintext、Telegram payload、screenshots、voice transcripts、order IDs、phone/address/payment data、support personal accounts or secrets appear：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 source budget or lint line limits fail：收紧组件/CSS；不得扩大到 backend packages or config。

## 不做什么

- 不实现 production API、admin API client、WebSocket/realtime、DB persistence、Prisma schema/migration、worker/engine integration、capability runtime integration、eval runner integration、provider adapter、provider calls、prompt/model/persona release、knowledge publish、storage upload、confirmation queue、distill、outbound send、GA-0、M3 closeout 或真实客户流量。
- 不 import 后端包；admin 只能展示本地 synthetic/local UI and disabled/blocked actions。
- 不新增外部依赖，不修改 `package-lock.json`。
- 不提交 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw prompt/completion 或 secrets。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-09 status | Notes |
|---|---|---|
| G-03 | ui_partial_foundation_only | UI displays production gate failed state and blocked prompt/knowledge/model route release semantics from M3-03 foundation; no production publish API/admin integration. |
| H-01 | ui_partial_foundation_only | Four knowledge/resource types are visible in a local shell; no edit persistence, DB, owner tutorial pack, media upload or knowledge publish. |
| I-01 | local_ui_partial_evidence | Knowledge/resource and eval gate shell joins admin desktop workflow; full desktop core remains broader 1.0 and not closed. |
| J-05 | foundation_updated | M3 evidence records this slice instead of deferring to M6; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; explicit touch list; no DB schema change. |

M3-09 closes no production acceptance item. It only provides local UI evidence and preserves all M3 closeout owner-input blockers.
