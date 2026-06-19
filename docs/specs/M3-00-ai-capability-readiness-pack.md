# M3-00 AI Capability Readiness Pack

## 目标

打开 M3 仅用于 spec-governed 的 AI capability、LLM gateway、eval gate 和必要 admin evidence 工作，归档当前 `main` readiness、M3 有序 spec queue、owner-input blockers、并行规则、敏感数据边界与验收映射。本 PR 只建立 M3 docs-only readiness/spec-queue pack，不实现 runtime/source code。

M3-00 合并后只表示 `ready_to_start_specs__owner_inputs_block_closeout`：允许后续 M3 specs 按队列逐个开工，但 M3 closeout 在 owner inputs 与 M3 evidence 解决前继续阻断。它不表示 production、GA-0、真实客户流量、customer LLM、prompt/model route release、knowledge publish、AI persona release、Business release 或 1.0 release approval。

M3 scope 来自 live v1.1 docs：knowledge, tutorial/journey, pricing, screenshot diagnostics, speech transcription, LLM gateway, eval gate。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：项目 owner 确认是否允许从 M2 owner accepted milestone evidence 状态进入 M3 spec queue，并继续负责教程素材包、截图诊断样例、乌语/俄语盲评、真实客户数据、customer LLM、LLM keys/provider release、知识发布、AI persona release、GA-0、成本、合规与 1.0 release 风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-00-ai-readiness-pack` / `codex/m3-00-ai-readiness-pack` 中执行，重读 AGENTS、v1.1 根文档、spec/evidence/doc gates 与 M2-00/M2 closeout pattern；记录 M3 queue、current-state audit、owner-input blockers、sensitive-data boundary、parallelism rules 和 validation evidence；不替 owner 提供真实素材、盲评、LLM/provider approval、release approval 或生产结论。

## 时间盒

0.25 个工作日。若当前 worktree/branch、M2 owner acceptance、GitHub branch/PR hygiene、doc validation 或 allowed touch list 无法证明，则不得标记为 `ready_to_start_specs__owner_inputs_block_closeout`，改为记录 `blocked_needs_current_state_or_owner_input_refresh`。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M3-00-ai-capability-readiness-pack.md`
  - `docs/evidence/M3/README.md`
  - `docs/evidence/M3/M3-ai-capability-readiness-pack.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只允许新增 M3 readiness/spec queue evidence。
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples、screenshots、voice transcripts、customer plaintext、Telegram payloads、orders、phone/address/payment data、secrets、root checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = 本 spec、M3 evidence README、M3 readiness evidence；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `M3`、`REQ-A`、`F-0`、`G-0`、`H-01`、`I-01`、`J-05`、`K-03`、`K-04`、`教程`、`截图诊断`、`盲评`、`LLM`、`评测`、`报价`、`语音` 于 AGENTS、四份 v1.1 根文档、M2 specs/evidence 与 `docs/specs`/`docs/evidence`，确认当前缺口是 M3 readiness/spec queue evidence，不是 implementation source 归属。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，不声明 provider 支持或 production route。
- 是否需要例外：none。

## 文档触发检查

- 结果：updated
- 判断依据：`docs/doc-gates.md`。本 PR 只新增 M3 readiness/spec queue evidence，不引入真实 eval fixtures、schema/migration/generated DTO/OpenAPI、observability, environment validation, release workflow, production runtime, external provider/connector/adapter 或 runbook 触发项。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-00-ai-readiness-pack`，分支为 `codex/m3-00-ai-readiness-pack`。
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M2/README.md`、`docs/evidence/M2/M2-channel-conversation-closeout-signoff.md`、M2-00 spec/evidence pattern。
- 开工前必须执行 `git fetch --prune`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url`。
- Current-state baseline before this docs diff: `HEAD` = `origin/main` = `44c95bdbb237609eefbe1969b8f69f82e0dcbe6a` after M2-11 owner acceptance merge.
- M2 current state is `owner_accepted_m2_milestone_evidence` only. That state does not approve production, GA-0, real customer traffic, customer LLM, Telegram Business feasibility, Business auto-reply or 1.0 release.
- ADR-003 customer-data boundary remains active: no real customer messages, screenshots, voice transcripts or customer profiles may enter third-party LLM paths without future owner/governance signoff.
- Owner-input blockers from v1.1 docs must be treated as M3 closeout blockers unless evidence appears in repo or owner explicitly branches them:
  - phase-one tutorial material pack is required before M3/tutorial closeout; expected repo evidence destinations are `docs/evidence/M3/tutorial/tutorial-materials-manifest.md` and `docs/evidence/M3/tutorial/journey-import-report.md`;
  - screenshot diagnostic samples >=20 are required before F-02 closeout; expected repo evidence destinations are `docs/evidence/M3/vision/screenshot-cases-manifest.md` and `docs/evidence/M3/vision/eval-run-report.md`;
  - Uzbek Latin/Cyrillic/Russian blind review is required inside M3 for G-04; expected repo evidence destination is `docs/evidence/M3/language-blind-review/blind-review-report.md`.
- 并发派发证据：single worker, single linked worktree, single branch, single docs spec; touch modules are exactly the three files above; no `packages/db` schema, lockfile, shared config, CI/guard script, generated artifact or release/production gate edits.
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增本 M3-00 docs-only spec，限定 touch list、budget、owner-input blockers、queue、parallelism、failure branches、not-doing 和 acceptance mapping。
2. 新增 `docs/evidence/M3/README.md`，声明 M3 evidence boundary、current readiness pack、owner-input blockers 和 sensitive-data rules。
3. 新增 `docs/evidence/M3/M3-ai-capability-readiness-pack.md`，记录 current-state facts、M2 milestone-only acceptance, M3 queue, owner-input blockers, sensitive-data boundary, validation and review evidence。
4. 不创建 `M3-01` 到 `M3-10` future implementation spec files；只记录 ordered future queue。
5. 运行 required validation，复核 diff 只含 allowlist 文件。

## M3 Future Spec Queue

| 顺序 | Future spec / PR | 目标 | 主要触碰模块草案 | 并行限制 |
|---:|---|---|---|---|
| 1 | `M3-01-ai-capability-data-contracts-foundation` | 建立 knowledge/tutorial/material refs, quote records, eval gate/run/result, LLM call accounting/log contracts 的最小 DB/schema/contracts foundation | `packages/db/**`, generated DTO/contract paths if already governed, docs/contracts evidence as triggered | `packages/db` schema/contracts foundation first and global serial; must finish before runtime capability specs rely on persistent contracts |
| 2 | `M3-02-llm-gateway-routing-accounting-foundation` | Task routing, fallback, timeout/cost/token budget, mock provider/ports and call accounting; no real provider/customer LLM | `packages/llm-gateway/**`, API/worker ports/tests as scoped | Shared/global route/accounting path; serial unless touch lists prove disjoint and no route/gate conflict |
| 3 | `M3-03-eval-gate-redline-runner` | Eval gate contracts/runner/redline checks and production publish refusal semantics for prompt/knowledge/model route/persona changes | `packages/evals/**`, `packages/llm-gateway/**` eval hooks, API/admin evidence as scoped | Eval gate is shared/global; serial with llm route/prompt/knowledge/persona release mechanics unless touch lists prove disjoint |
| 4 | `M3-04-kb-journey-capability-foundation` | KB/tutorial stage localization, stage-card-only answer contract, unknown-to-handoff behavior | `packages/capabilities/kb/**`, `packages/engine/**` integration ports, eval fixtures/manifests | Depends on contracts/eval gate; blocked from full tutorial acceptance until owner phase-one tutorial pack exists |
| 5 | `M3-05-pricing-capability-and-quote-record-contract` | Code-only pricing calculation contract, LLM parameter extraction boundary, quote record evidence, no LLM math | `packages/capabilities/pricing/**`, quote contracts, tests/evidence | Must not import other capability packages; pricing math/source of truth is code and quote records, not LLM output |
| 6 | `M3-06-vision-screenshot-diagnostics-foundation` | Screenshot diagnosis contract, uncertainty-to-handoff, sample manifest and safe storage references | `packages/capabilities/vision/**`, eval/sample manifests, controlled storage ref docs | Blocked from F-02 closeout until >=20 owner screenshot samples exist; raw screenshots never committed |
| 7 | `M3-07-speech-transcription-contract` | Speech transcription/postprocess contract for Uzbek Latin/Cyrillic/Russian, confidence/source refs; no unsupported provider claims | `packages/capabilities/speech/**`, `packages/llm-gateway/**` postprocess ports as scoped | No provider capability claims without official docs/spike/local evidence/ADR; raw voice/transcripts never committed |
| 8 | `M3-08-breaker-radius-and-redline-output-guard` | User-level, capability-level and global breaker radius evidence, redline output guard behavior and safe degradation semantics | `packages/engine/**`, `packages/llm-gateway/**`, `packages/capabilities/**` ports/tests/evidence as scoped | Shared guard behavior; serial with eval gate, route and output-policy changes unless future touch lists prove disjoint |
| 9 | `M3-09-admin-knowledge-eval-shell-if-needed` | Admin shell for knowledge/resource and eval gate evidence, pure API/client boundary and tokens | `apps/admin/**`, `packages/ui-tokens/**`, API client/contracts as scoped | Admin cannot import backend packages; only open if needed for H-01/I-01/G-03 evidence and after stable API/contracts |
| 10 | `M3-10-ai-capability-closeout-signoff` | M3 closeout/signoff after queue completion and owner inputs/blind review/evidence are resolved or explicitly branched | `docs/evidence/M3/**`, closeout spec if needed | Must verify queue, validation, owner inputs, sensitive-data boundary and release non-approval before closeout |

## 并行规则

- DB/schema/contracts first and serial：M3-01 is the global serial point for `packages/db` schema, migrations, Prisma models, generated DTO/contracts, quote/eval/LLM-call persistence contracts and shared data shape.
- Eval gate and LLM route changes are shared/global and should be serial unless future touch lists prove disjoint; prompt/knowledge/model route/persona publish refusal semantics must not be bypassed.
- Capability packages must not import each other. `packages/capabilities/kb`, `vision`, `speech`, `pricing` and later capability slices can only be composed by `engine` or explicit ports.
- `admin` only calls API/WS/contracts; it must not import backend packages, DB clients or capability code.
- Owner inputs block closeout: tutorial pack, >=20 screenshot samples and Uzbek Latin/Cyrillic/Russian blind review must be provided, repo-evidenced or explicitly branched before `M3-10` can close M3.
- No worker may submit raw sample content to git. Future sample specs can record manifests, redaction method, storage refs, access scope, retention and owner confirmation only.

## 通过条件

- M3-00 spec contains required fields, M3 scope from live docs, non-scope/release boundaries, future queue, owner-input blockers, parallelism, sensitive-data boundary and acceptance mapping.
- M3 evidence records current-state facts: assigned worktree/branch, no open PRs/no unmerged branches at audit, M2 `owner_accepted_m2_milestone_evidence` only, M3 status `ready_to_start_specs__owner_inputs_block_closeout`, and production/GA-0/real traffic/customer LLM/prompt/model route release/knowledge publish/AI persona release/1.0 release blocked.
- Diff only includes the three allowlist docs files.
- This PR creates no future implementation specs and changes no `apps/**`, `packages/**`, `scripts/**`, lockfile, config, generated/dist, raw samples, screenshots, voice transcripts, customer plaintext, Telegram payloads, orders, phone/address/payment data or secrets.
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-00-ai-capability-readiness-pack.md --include-worktree`, `git diff --check`, `git status --short --branch`. If dependencies are missing, run `npm ci` first. Full `npm run check` may run if reasonable; otherwise PR CI remains the full check gate.

## 失败分支

- If worktree or branch differs from the expected path/branch: stop and report; do not write in the wrong checkout.
- If M2 status is not owner accepted for milestone evidence or current GitHub hygiene is dirty: set M3 status to `blocked_needs_m2_or_repo_hygiene_refresh`; do not open M3 queue.
- If owner-input evidence for tutorial material pack, >=20 screenshot samples or blind review is absent: future specs may start, but M3 closeout remains `blocked_by_owner_inputs` until provided or explicitly branched.
- If wording implies production, GA-0, real customer traffic, customer LLM, prompt/model route release, knowledge publish, AI persona release or 1.0 release approval: correct the wording before merge.
- If validation exposes docs-only allowlist violations: stop and remove this worker's out-of-scope changes; do not widen the allowlist.
- If raw/export/jsonl/csv, customer plaintext, Telegram payloads, screenshots, voice transcripts, order IDs, phone/address/payment data, support personal accounts or secrets appear: close this PR and perform cleanup/incident handling before any further M3 work.
- If doc-trigger guard requires new docs beyond this scope: stop and split into a separate docs-only spec; do not create placeholder manuals.

## 不做什么

- 不实现 runtime/source code, DB schema, migrations, generated DTOs, OpenAPI, providers, adapters, prompt/model routes, eval runner, admin UI, API/worker/engine integration, tests or fixtures。
- 不创建 `M3-01` through `M3-10` implementation spec files; this pack only records the ordered queue。
- 不声明 production-ready, GA-0, real customer traffic, customer LLM, prompt/model route release, knowledge publish, AI persona release, Business release or 1.0 release approval。
- 不提交 raw/export/jsonl/csv, customer plaintext, Telegram payloads, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts or secrets。
- 不让 LLM 做报价、SLA、成本、订单状态等数值判断；报价由 code + `quote_record` 证据闭合。
- 不绕过 eval gate 发布 prompt、knowledge、model route 或 AI persona changes。

## 验收映射

| Item | M3-00 status | Future closure path |
|---|---|---|
| F-01 | queued_not_closed | M3-04 KB/tutorial stage localization and stage-card-only answer contract; full tutorial closeout blocked until owner phase-one tutorial material pack exists and is recorded at `docs/evidence/M3/tutorial/tutorial-materials-manifest.md` plus `docs/evidence/M3/tutorial/journey-import-report.md` |
| F-02 | queued_owner_input_blocked | M3-06 screenshot diagnostics contract and manifest; closeout blocked until >=20 owner screenshot samples exist and are recorded at `docs/evidence/M3/vision/screenshot-cases-manifest.md` plus `docs/evidence/M3/vision/eval-run-report.md` |
| F-03 | queued_not_closed | M3-07 speech transcription/postprocess contract for Uzbek Latin/Cyrillic/Russian |
| F-04 | queued_not_closed | M3-05 pricing capability and quote record contract; no LLM math |
| F-05 | queued_not_closed | M3-02/M3-03 redline and context boundary evidence; no internal threshold/cost/profit leakage |
| F-06 | queued_not_closed | M3-08 covers user-level, capability-level and global breaker radius evidence plus redline output guard behavior; not closed by M3-00 |
| G-01 | queued_not_closed | M3-02 route/fallback/failure contract with mock provider only |
| G-02 | queued_not_closed | M3-01/M3-02 LLM call log/accounting contracts |
| G-03 | queued_not_closed | M3-03 eval gate publish-refusal semantics |
| G-04 | queued_owner_input_blocked | Blind review required inside M3; closeout blocked until Uzbek Latin/Cyrillic/Russian blind review is recorded at `docs/evidence/M3/language-blind-review/blind-review-report.md` or explicitly branched |
| G-05 | queued_not_closed | M3-03 redline false-positive tracking, M3-08 output guard evidence and future admin evidence if needed |
| G-06 | partial_seed_foundation_future_full_set | M1 seed runner/manifest exists, but full 1.0 set >=200 and category quotas remain future; M3 must not close quota-dependent gates prematurely |
| H-01 | queued_not_closed | M3-01/M3-04 and optionally M3-09 cover knowledge/resource foundation; no knowledge publish claimed |
| I-01 | partial_future_scope_only | M3-09 may cover knowledge/resource and eval gate core-screen evidence if opened; full desktop core item remains broader 1.0 |
| J-05 | opened_for_m3 | M3 evidence directory and readiness pack created so M3 evidence is not deferred to M6; no release signoff |
| K-03 | active | One spec / one PR; this PR implements only M3-00 |
| K-04 | active | M3 queue and parallelism rules recorded, with DB/schema serial and touch-module conflict rules |

M3-00 closes no production acceptance item. It only opens future spec-governed M3 work while recording closeout blockers and release boundaries.

## Closeout / Incident 记录

- Incident: none created by this spec.
- Existing M2 workspace incident remains recorded under M2 evidence and guarded by workspace isolation rules; this M3-00 pack does not change that incident or release boundaries.
