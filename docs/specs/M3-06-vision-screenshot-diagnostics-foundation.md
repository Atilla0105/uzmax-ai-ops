# M3-06 Vision Screenshot Diagnostics Foundation

## 目标

实现 M3 `packages/capabilities/vision` 的纯 package foundation：截图诊断输入/候选契约、controlled screenshot/media refs、uncertainty-to-handoff/fail-closed 行为，以及 safe sample manifest/storage refs。

本 PR 只提供 F-02 的 foundation slice：synthetic controlled fixtures 可以产生 bounded `diagnosis_card`，低置信度、缺信号、歧义、不安全输入、unsupported screenshot kind 或显式不确定候选必须 fail closed 到 `handoff_required` 或 `uncertain`。它不关闭 F-02，因为 >=20 owner screenshot samples 仍缺失；也不实现 production、GA-0、真实客户流量、customer LLM、provider route release、engine/admin/API/worker integration、real eval runner、M3 closeout 或 1.0 release approval。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本 PR 仅合并 screenshot diagnostics foundation，不代表 owner screenshot samples 已提供、F-02 已关闭、production/GA-0/真实客户流量/customer LLM/provider route release/engine-admin-API-worker integration/M3 closeout/1.0 release approval。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-06-vision-screenshot-diagnostics-foundation` / `codex/m3-06-vision-screenshot-diagnostics-foundation` 中执行 spec、TDD RED/GREEN、vision package implementation、focused test、contracts/evidence 更新、validation、commit、push、PR；复核 no raw screenshots/customer text/OCR/base64/blob/data URL/public URL/file path、no DB/LLM/provider/admin/engine/API/worker integration、no other capability import、no test weakening，并在 PR 中暴露 owner sample blocker。

## 时间盒

0.5 个工作日。若 vision foundation 无法在预算内通过 focused test 与本地 validation，则关闭或拆小；不得夹带 raw samples、provider SDK、LLM key、DB schema、eval fixture content、engine/API/admin integration 或 production work 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M3-06-vision-screenshot-diagnostics-foundation.md`
- `packages/capabilities/vision/src/index.ts`
- `scripts/tests/m3-vision-screenshot-diagnostics-foundation.test.mjs`
- `docs/contracts/README.md`
- `docs/evidence/M3/README.md`
- `docs/evidence/M3/M3-06-vision-screenshot-diagnostics-foundation.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 DB schema/migrations/generated DTOs、`packages/db/src/**`、`packages/llm-gateway/**`、`packages/evals/**`、`packages/engine/**`、apps、worker/API/admin integration、provider SDKs、configs、lockfile、prompts、real eval fixtures、raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、orders、phone/address/payment data、secrets、root/main checkout 或其他 worktree。`packages/capabilities/vision/package.json` 未声明为触碰模块，除非后续验证证明确有必要并先更新本 spec。

## 变更预算与路径分类

- source 预算：changed source files <= 1；new source files <= 0；net source LOC <= 400。
- source = `packages/capabilities/vision/src/index.ts`。
- test = `scripts/tests/m3-vision-screenshot-diagnostics-foundation.test.mjs`。
- docs = this spec、contracts README、M3 evidence README、M3-06 evidence。
- generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `vision`、`screenshot`、`media`、`manifest`、`storageRef`、`redaction`、`eval`、`F-02`、`diagnosis`、`handoff`、`uncertain`、`data URL`、`base64`、`blob`、`fixture` 于 `AGENTS.md`、`docs/**`、`packages/**`、`scripts/**`、`package.json`。当前 `packages/capabilities/vision/src/index.ts` 只有 placeholder export；M3-01 提供 `media_asset` 与 eval category compatibility，M3-03 提供 ref/redacted eval payload boundary，尚无 vision runtime contract，因此本 PR 就地扩展 `packages/capabilities/vision/src/index.ts`，不新增 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增外部 API/provider/SDK/connector/adapter，不声明 real provider 支持或 production route。
- 是否需要例外：none。

## 文档触发检查

updated

判断依据：`docs/doc-gates.md`。本 PR 新增 vision package runtime contract，因此更新 `docs/contracts/README.md` 与 M3 evidence README；不新增 schema/migration/generated DTO/OpenAPI、real eval fixtures/real eval runner、observability、environment validation、release workflow、production runtime、external provider/connector/adapter 或 runbook 触发项。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-06-vision-screenshot-diagnostics-foundation`，分支必须是 `codex/m3-06-vision-screenshot-diagnostics-foundation`。
- Base 必须是 `origin/main` at `fe1bd31fda4368cb341edc260c954e5bfa98fb61` at dispatch after M3-05 merge。
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url`。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-00/M3-01/M3-02/M3-03/M3-04/M3-05 spec/evidence、`docs/contracts/README.md`、M3 evidence README、`packages/capabilities/vision/src/index.ts`、`packages/db/src/m3-ai-contracts.ts` media asset/eval category compatibility、`packages/evals/src/index.ts` vision category/ref payload boundary 和 related focused tests。
- 若 open PR 或未合并分支与 `packages/capabilities/vision`、M3 contracts/evidence or allowed docs touch modules 冲突，停止并报告 BLOCKED。
- ADR-003 dev-only/customer-LLM-blocked 边界仍生效：本 PR 不消费真实客户数据，不存 raw prompt/completion，不让真实客户消息、截图、语音转写或客户档案进入第三方 LLM。
- Owner-input blockers from M3-00 remain open: tutorial material pack, >=20 screenshot samples and Uzbek Latin/Cyrillic/Russian blind review block M3 closeout unless later repo evidence or owner branch decision exists. F-02 closeout specifically requires >=20 owner screenshot samples.
- 并发派发证据：single worker, single linked worktree, single branch, single spec. Touch modules are exactly the allowed list above. No schema, migration, lockfile, shared config, CI/guard script, generated artifact or release/production gate edits.
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-06-vision-screenshot-diagnostics-foundation` |
| `git status --short --branch` | `## codex/m3-06-vision-screenshot-diagnostics-foundation...origin/main` |
| `git branch --show-current` | `codex/m3-06-vision-screenshot-diagnostics-foundation` |
| `git branch --no-merged main` | no branch output |
| `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` | `[]` |
| `git fetch --prune` | pass, no output |
| base | `HEAD` and `origin/main` were `fe1bd31fda4368cb341edc260c954e5bfa98fb61` before edits |
| dependency setup | `npm ci` passed in this linked worktree; lockfile unchanged; npm reported existing audit advisories |

No open PR conflict or unmerged branch conflict was found at start.

## 实施步骤

1. 新增本 M3-06 spec，限定 touch list、budget、owner/AI boundary、failure branches、not-doing 和 acceptance mapping。
2. 新增 focused failing test `scripts/tests/m3-vision-screenshot-diagnostics-foundation.test.mjs`，覆盖 controlled refs only、raw screenshot/OCR/public URL/file path/base64/blob/data URL rejection、high-confidence synthetic diagnosis card、low-confidence/missing/ambiguous/unsupported/uncertain fail-closed、sample manifest owner blocker、foundation-only docs/evidence。
3. 运行 focused test 并记录 RED failure。
4. 在 `packages/capabilities/vision/src/index.ts` 实现纯 exports：vision status/kind constants、controlled ref validator、diagnosis candidate validator、diagnosis evaluator、bounded diagnosis card builder、sample manifest builder/evaluator。
5. 更新 `docs/contracts/README.md`、M3 evidence README 和 M3-06 evidence；不得 overclaim F-02 full closure、production、DB persistence、engine/admin/API integration、real eval runner or owner sample availability。
6. 运行 required validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：focused test 在实现前失败，失败原因是 M3-06 vision exports/behavior/docs/evidence 缺失。
- GREEN：`node --test scripts/tests/m3-vision-screenshot-diagnostics-foundation.test.mjs` 通过。
- Vision package remains pure: no DB runtime import, no LLM/provider call, no process env, no outbound send, no other capability imports。
- Screenshot diagnosis input accepts only controlled refs such as `storageRef`、`manifestRef`、`redactionRef`、`modelResultRef`、`providerResultRef`、`evalResultRef`; field-specific refs must keep their matching schemes (`storage://` for `storageRef`, `manifest://` for `manifestRef`, `redaction://` for `redactionRef`, `controlled://` for model/provider/result refs). It rejects raw screenshot content, data URLs, public URLs, file paths, base64/blob-ish payloads, raw OCR/text/customer plaintext。
- Diagnosis candidate shape validates screenshot kind/category、required signals/checklist、confidence、evidence refs and optional model/provider/result refs as controlled refs only; unknown fields and raw/free-text carrier fields fail closed instead of being accepted。
- Low confidence, missing required signals, ambiguous diagnosis, unsafe/raw input, unsupported screenshot kind or explicit uncertain candidate returns/throws fail-closed result mapping to `handoff_required` or `uncertain`; it never emits confident diagnosis。
- High-confidence synthetic controlled candidate returns bounded `diagnosis_card` with status、diagnosis code/title、bounded observations/actions、controlled refs and no raw screenshot/customer text。
- Sample manifest builder/validator records count/category/controlled storage refs/redaction method/access scope/owner confirmation status and never raw screenshot content. Owner samples missing or <20 keeps F-02 not closed。
- ADR-003/customer-data boundary and M3-00 owner blocker are preserved。
- Required validation passes or is honestly recorded: focused test, `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run depcruise`, `npm run jscpd`, `npm run knip`, `npm run guard:forbidden-terms`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-06-vision-screenshot-diagnostics-foundation.md --include-worktree`, `git diff --check origin/main...HEAD`, `npm run check` if feasible, final `git status --short --branch`。

## 失败分支

- 若 worktree 或 branch 不匹配：停止并报告；不得写错 checkout。
- 若发现 open PR 或未合并分支与 vision capability/contracts/evidence touch modules 冲突：停止并报告 BLOCKED。
- 若 implementation 需要 `packages/db` schema/migration/generated DTO changes 或 `packages/db/src/**` edits：停止并拆回 DB scoped spec；本 PR 不触碰 DB。
- 若 implementation 需要 provider SDK、LLM key、env vars、real provider calls、customer LLM、raw screenshots、raw OCR/customer text、raw samples、raw prompt/completion、orders、voice transcripts 或 Telegram payloads：不得合并，收窄为 pure controlled-ref contract or close branch。
- 若 F-02 closeout needs owner screenshot samples：记录 owner-input blocker；不得伪造样本、创建 raw sample directory 或提交 screenshots。
- 若 diagnosis cannot be high-confidence from controlled synthetic candidate：返回 `uncertain` / `handoff_required`；不得强答。
- 若 source LOC exceeds budget or lint complexity/line limits fail：收紧 helpers；不得 add parallel source file without new spec/budget。

## 不做什么

- 不实现 production、GA-0、真实客户流量、customer LLM、real provider route release、prompt/model/persona release、AI persona release、Business release、M3 closeout、F-02 full closure 或 1.0 release approval。
- 不实现 DB persistence、Prisma schema/migration、generated DTO、API、worker、engine orchestration、admin UI、real eval fixtures、real eval runner、real screenshot provider/adapter、storage upload、outbound send、confirmation queue 或 distill。
- 不修改 `packages/db/src/**` 或 `packages/evals/src/**`; M3-01 media/eval category compatibility and M3-03 ref payload boundary remain compatibility targets only.
- 不提交 raw/export/jsonl/csv、customer plaintext、Telegram payloads、screenshots、voice transcripts、order IDs、phone numbers、addresses、payment data、support personal accounts、raw OCR/text、raw prompt/completion 或 secrets。
- 不创建 raw sample directories or sample images; repo evidence may only record controlled manifest/storage refs and blocker status。
- 不让 LLM 做报价、SLA、成本、订单状态等数值判断。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M3-06 status | Notes |
|---|---|---|
| F-02 | foundation_implemented_not_closed | Synthetic controlled screenshot candidate contract, fail-closed uncertainty behavior and safe sample manifest builder exist; full F-02 closeout remains blocked by >=20 owner screenshot samples and real eval evidence. |
| F-05 | foundation_supported_not_closed | Raw screenshot/customer text and unsafe refs are rejected; broader redline output guard remains M3-08/future integration. |
| G-06 | foundation_queued_not_closed | Vision category/ref payload compatibility exists only as controlled manifest/eval refs; full 1.0 >=200 target and 20 screenshot cases remain future. |
| H-05 | foundation_supported_not_closed | Controlled `storageRef`/manifest refs are the only accepted screenshot/media input shape; no upload/storage implementation. |
| J-05 | foundation_updated | This evidence records M3-06 vision foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at dispatch audit. |

M3-06 closes no production acceptance item. It only provides pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Closeout / Incident 记录

- Incident: none created by this spec at authoring time.
- Existing M2 workspace incident remains recorded under M2 evidence and guarded by workspace isolation rules; this M3-06 work runs in a dedicated linked worktree and does not change that incident or release boundaries.
