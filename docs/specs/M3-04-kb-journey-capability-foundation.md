# M3-04 KB Journey Capability Foundation

## 目标

实现 M3 `packages/capabilities/kb` 的纯 package foundation：KB/tutorial stage localization contract、stage-card-only answer contract、unknown/ambiguous stage fail-closed 到 clarification 或 handoff-required。

本 PR 只关闭 F-01/H-01 的 foundation slice：能在受控合成 fixture 中定位教程阶段并返回 bounded stage card / refs；不能定位或多阶段歧义时返回结构化澄清或转人工结果。它不实现 production、GA-0、真实客户流量、customer LLM、real provider、knowledge publish、admin UI、DB persistence、raw owner tutorial pack、raw customer data、screenshots/voice、M3 closeout、F-01 full closure 或 H-01 full closure。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本 PR 仅合并 KB/tutorial capability foundation，不代表教程素材包已交付、knowledge publish、production、GA-0、真实客户流量、customer LLM、M3 closeout、F-01/H-01 完整关闭或 1.0 release approval。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-04-kb-journey-capability-foundation` / `codex/m3-04-kb-journey-capability-foundation` 中执行 spec、TDD RED/GREEN、KB package implementation、focused test、contracts/evidence 更新、validation、commit、push、PR；复核 no capability-to-capability import、no DB/LLM/provider/admin/engine persistence integration、no raw tutorial/customer content、no test weakening，并在 PR 中暴露 owner-input blockers。

## 时间盒

0.5 个工作日。若 KB journey foundation 无法在预算内通过 focused test 与本地 validation，则关闭或拆小；不得夹带 engine integration、DB persistence、real tutorial import、eval fixture、admin UI、provider/LLM 或 production work 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M3-04-kb-journey-capability-foundation.md`
- `packages/capabilities/kb/src/index.ts`
- `scripts/tests/m3-kb-journey-capability-foundation.test.mjs`
- `docs/contracts/README.md`
- `docs/evidence/M3/README.md`
- `docs/evidence/M3/M3-04-kb-journey-capability-foundation.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `packages/engine/**`、`packages/db/**` schema/migrations/generated DTOs、`packages/llm-gateway/**`、`packages/evals/**`、apps、worker/API/admin integration、provider SDKs、configs、lockfile、prompts、real eval fixtures、raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、orders、phone/address/payment data、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 1；new source files <= 0；net source LOC <= 400。
- source = `packages/capabilities/kb/src/index.ts`。
- test = `scripts/tests/m3-kb-journey-capability-foundation.test.mjs`。
- docs = this spec、contracts README、M3 evidence README、M3-04 evidence。
- generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `resolve.*journey`、`journey.*stage`、`stage card`、`KbStage`、`tutorial`、`handoff_required`、`materialRefs`、`controlled://`、`capabilities/kb`、`packages/engine`；当前 `packages/capabilities/kb/src/index.ts` 只有 placeholder export，`packages/engine/src/index.ts` 也只有 placeholder export。M3-01 只提供 `kb_entry` / `kb_stage` DB contracts，M3-03 只提供 eval gate foundation；没有可扩展的 KB runtime/stage localization implementation，因此本 PR 就地扩展 `packages/capabilities/kb/src/index.ts`，不新增 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增外部 API/provider/SDK/connector/adapter，不声明 real provider 支持或 production route。
- 是否需要例外：none。

## 文档触发检查

updated

判断依据：`docs/doc-gates.md`。本 PR 新增 KB package runtime contract，因此更新 `docs/contracts/README.md` 与 M3 evidence README；不新增 eval fixtures/real eval runner、schema/migration/generated DTO/OpenAPI、observability、environment validation、release workflow、production runtime、external provider/connector/adapter 或 runbook 触发项。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-04-kb-journey-capability-foundation`，分支必须是 `codex/m3-04-kb-journey-capability-foundation`。
- Base 必须是 `origin/main` at `c90f6b9a1d4dc299c8ac0e90ceab160086ed2d70` at dispatch after M3-03 merge.
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、`git fetch --prune`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url`。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-00/M3-01/M3-02/M3-03 spec/evidence、`docs/contracts/README.md`、`docs/evals/README.md`、M3 evidence README、`packages/capabilities/kb/src/index.ts`、`packages/engine/src/index.ts`、`packages/capabilities/handoff/src/index.ts` 以及 related focused tests。
- 若 open PR 或未合并分支与 `packages/capabilities/kb`、M3 contracts/evidence or allowed docs touch modules 冲突，停止并报告 BLOCKED。
- ADR-003 dev-only/customer-LLM-blocked 边界仍生效：本 PR 不消费真实客户数据，不存 raw prompt/completion，不让真实客户消息、截图、语音转写或客户档案进入第三方 LLM。
- Owner-input blockers from M3-00 remain open: tutorial material pack, >=20 screenshot samples and Uzbek Latin/Cyrillic/Russian blind review block M3 closeout unless later repo evidence or owner branch decision exists.
- 并发派发证据：single worker, single linked worktree, single branch, single spec. Touch modules are exactly the allowed list above. No schema, migration, lockfile, shared config, CI/guard script, generated artifact or release/production gate edits.
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-04-kb-journey-capability-foundation` |
| `git status --short --branch` | `## codex/m3-04-kb-journey-capability-foundation...origin/main` |
| `git branch --show-current` | `codex/m3-04-kb-journey-capability-foundation` |
| `git fetch --prune` | pass, no output |
| `git branch --no-merged main` | no branch output |
| `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` | `[]` |
| base | `HEAD` was `c90f6b9a1d4dc299c8ac0e90ceab160086ed2d70` before edits |
| dependency setup | `npm ci` passed in this linked worktree; lockfile unchanged; npm reported existing audit advisories |

No open PR conflict or unmerged branch conflict was found at start.

## 实施步骤

1. 新增本 M3-04 spec，限定 touch list、budget、owner/AI boundary、failure branches、not-doing 和 acceptance mapping。
2. 新增 focused failing test `scripts/tests/m3-kb-journey-capability-foundation.test.mjs`，覆盖 stage localization success、stage-card-only answer、unknown/ambiguous to clarification or handoff-required、safe refs/no raw samples、no capability-to-capability import、owner blocker docs preserved。
3. 运行 focused test 并记录 RED failure。
4. 在 `packages/capabilities/kb/src/index.ts` 实现纯 exports：journey/stage/card/result types、controlled ref validation、stage localization、stage-card builder、unknown/ambiguous safe fallback。
5. 更新 `docs/contracts/README.md`、M3 evidence README 和 M3-04 evidence；不得 overclaim M3 closeout、production, knowledge publish, admin UI, DB persistence or real tutorial content。
6. 运行 required validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：focused test 在实现前失败，失败原因是 M3-04 KB exports/behavior/docs 缺失。
- GREEN：`node --test scripts/tests/m3-kb-journey-capability-foundation.test.mjs` 通过。
- Stage localization can select one active stage from synthetic controlled fixtures using stage key/title/localized title/aliases/trigger phrases.
- Selected result returns only a bounded stage card: stage ref/key/title/sequence, concise answer/steps/card fields, material refs and next/clarification/handoff action. It must not dump all journey stages.
- Unknown stage returns `clarification_required` or `handoff_required`; ambiguous stage returns fail-closed clarification/handoff-safe result with reason codes. It must not hallucinate a stage.
- Safe refs only: material/stage/journey refs must be controlled/manifest/redaction refs; no raw tutorial samples or customer text are embedded in the result.
- `packages/capabilities/kb` remains pure: no DB, no LLM provider, no outbound send, no other capability imports, no raw customer content.
- `packages/engine` is not touched by this PR; engine generic orchestration remains future.
- Owner input blockers remain preserved: F-01/H-01 foundation only; tutorial closeout remains blocked by owner material pack.
- Required validation passes or is honestly recorded: focused test, `npm run eval:minimal`, `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-04-kb-journey-capability-foundation.md --include-worktree`, `npm run test`, `npm run check` if feasible, `git diff --check`, final `git status --short --branch`。

## 失败分支

- 若 worktree 或 branch 不匹配：停止并报告；不得写错 checkout。
- 若发现 open PR 或未合并分支与 KB journey touch modules 冲突：停止并报告 BLOCKED。
- 若 implementation 需要 `packages/db` schema/migration/generated DTO changes：停止并拆回 DB scoped spec；本 PR 不触碰 DB。
- 若 stage localization 需要 real owner tutorial pack/raw content 才能通过：只保留 synthetic controlled fixtures foundation，记录 owner-input blocker；不得提交 raw material。
- 若 selected output 需要 full journey/tutorial dump 才能回答：不得合并，收窄为 bounded stage card and refs。
- 若 unknown/ambiguous input would require hallucinating a stage：返回 clarification/handoff-required；不得强答。
- 若 implementation 需要 importing `handoff` or another capability package from `kb`：停止并改为 local structured action contract or future engine orchestration spec。
- 若 implementation 需要 provider SDK、LLM key、env vars、real provider calls、customer LLM、raw samples、raw prompt/completion、screenshots、voice transcripts 或 customer plaintext：不得合并，收窄为 pure contract or close branch。
- 若 source LOC exceeds budget or lint complexity/line limits fail：收紧 helpers；不得 add parallel source file without new spec/budget。

## 不做什么

- 不实现 production、GA-0、真实客户流量、customer LLM、real provider route release、prompt/model/persona release、knowledge publish、AI persona release、Business release、M3 closeout 或 1.0 release approval。
- 不实现 DB persistence、Prisma schema/migration、API、worker、engine orchestration、admin UI、real eval fixtures、real tutorial import/publish、provider adapter、outbound send、storage upload、confirmation queue 或 distill。
- 不修改 `packages/engine/**`；engine integration stays future and generic only.
- 不提交 raw owner tutorial pack、raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw prompt/completion 或 secrets。
- 不让 LLM 做报价、SLA、成本、订单状态等数值判断。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-04 status | Notes |
|---|---|---|
| F-01 | foundation_implemented_not_closed | Stage localization and stage-card-only answer contract exist for synthetic controlled fixtures; full tutorial closeout remains blocked by owner material pack and eval evidence. |
| H-01 | foundation_queued_not_closed | KB journey/stage/card runtime contract supports future knowledge/resource workflows; no management UI, DB persistence or knowledge publish. |
| J-05 | foundation_updated | This evidence records M3-04 KB journey foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at dispatch audit. |

M3-04 closes no production acceptance item. It only provides pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Closeout / Incident 记录

- Incident: none created by this spec at authoring time.
- Existing M2 workspace incident remains recorded under M2 evidence and guarded by workspace isolation rules; this M3-04 work runs in a dedicated linked worktree and does not change that incident or release boundaries.
