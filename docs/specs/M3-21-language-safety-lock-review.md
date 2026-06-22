# M3-21 Language Safety Lock Review

## 目标

把 M3-19 已选的 80 个 controlled language sample ids 推进为 M3 test-stage 语言安全复核证据，并明确 G-04 的保守收口决策：

- AI agent 可核验样本存在性、语言/脚本 proxy 覆盖、redaction metadata、intent 覆盖和 release risk；
- 未完成 production owner blind review 前，弱/低质模型不得用于客户回复；
- strong-model route remains locked，route optimization remains frozen；
- 本 PR 不把 AI-assisted review 冒充 production owner blind review pass。

本 spec 不提交 raw customer text、raw human reply、raw model reply、prompt/completion、route metadata、客户身份/电话/地址/订单/支付/物流值，不调用真实 provider，不发布模型路由，不关闭 GA-0 或 1.0 release。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：此前已允许 AI agent 在测试阶段使用本机 FAQ、聊天记录/脱敏样本和可引用资料提升效率。Owner 仍负责 production blind review、正式 customer LLM/provider route、成本、合规、GA-0 和 1.0 发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-21-language-safety-lock-review` / `codex/m3-21-language-safety-lock-review` 中执行；读取 owner-local redacted sample metadata、核验 selected ids 和 coverage；仓库只记录受控 refs、aggregate counts、release decision 和安全边界；不得把 raw rows 或 model replies 写入 git。

## 时间盒

0.5 个工作日。若需要 production owner scoring、raw rows/model outputs 进仓库、真实 provider 调用、prompt/route release 或 runtime integration，则停止并拆分后续 spec。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M3-21-language-safety-lock-review.md`
- `docs/evidence/M3/M3-21-language-safety-lock-review.md`
- `docs/evidence/M3/language-blind-review/blind-review-report.md`
- `docs/evidence/M3/language-blind-review/test-stage-ai-assisted-review.md`
- `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`
- `docs/evidence/M3/README.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw/export/jsonl/csv、客户明文、Telegram payload、screenshots、voice transcripts、orders、phone/address/payment/logistics values、support personal accounts、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0；net source LOC <= 0；new source files <= 0。
- path categories：docs = this spec、M3-21 evidence、language blind-review report、test-stage AI-assisted review evidence、M3 closeout evidence sync、M3 evidence README。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `blind-review-report`、`test-stage-ai-assisted-review`、`G-04`、`strong_model_locked`、`language_or_script`、`owner blind review`、`M3-19`、`M3-20`。当前缺口是 M3 test-stage language safety decision evidence，不是 runtime implementation。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 spec 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-21-language-safety-lock-review`。
- 当前分支必须是 `codex/m3-21-language-safety-lock-review`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许只读核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、root/main status、open PR 和 no-merged branch 状态。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-17/M3-19/M3-20 spec/evidence、M3 closeout evidence、M3 README、`docs/preflight/01-owner-inputs-checklist.md`。
- 输入材料不得复制进仓库；仓库只记录 sample ids, aggregate counts, controlled refs, review status and strong-model decision。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m3-21-language-safety-lock-review` |
| branch | `codex/m3-21-language-safety-lock-review` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes, runtime release gates or production configuration.

## 事故与 closeout 记录

- Incident: none at authoring.
- If any raw customer text, raw reply, model output, route/prompt content or secret is detected in generated docs, stop and cleanup before continuing.

## 实施步骤

1. 新增 M3-21 docs-only spec 和 evidence record。
2. Verify M3-19 selected sample ids against owner-local redacted candidate metadata without committing raw rows.
3. Update `test-stage-ai-assisted-review.md` from sample-selection-only to test-stage review completed with aggregate counts and safety-lock decision.
4. Update `blind-review-report.md` to distinguish production owner reviewed counts from test-stage AI-assisted safety review counts.
5. Update M3 closeout/README: G-04 is not a quality-pass, but low-quality/weak model release is blocked by strong-model lock and route optimization freeze.
6. Run required validation and record results.

## 通过条件

- Selected sample ids exist and are unique: 80/80.
- Test-stage coverage records at least 20 Uzbek Latin proxy, 20 Cyrillic/Russian proxy, 20 Russian Latin mixed proxy and 20 Uzbek/Russian mixed proxy rows.
- Repo evidence records only aggregate counts and controlled refs; no raw question/reply/model output.
- G-04 safety decision is explicit: `strong_model_locked_until_owner_blind_review`; weak/low-quality model release remains blocked.
- M3 closeout language wording is honest: test-stage safety lock is ready, production owner blind review and production route release remain future-gated.
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-21-language-safety-lock-review.md --include-worktree`, `git diff --check origin/main...HEAD`, and full `npm run check` if feasible.

## 失败分支

- 若 worktree or branch differs from expected path/branch: stop and report; do not write in the wrong checkout.
- 若 any raw customer text, raw reply, model output, prompt/route text, phone/address/order/payment/logistics value, support personal account or secret would enter git: stop, remove generated content and report the boundary issue.
- 若 selected IDs are missing or duplicate: keep G-04 blocked and fix sample selection first.
- 若 any evidence implies weak/low-quality model can be used for customer replies before owner blind review: fail the branch.
- 若 validation exposes out-of-scope changes: remove them; do not widen the touch list.

## 不做什么

- 不提交 raw customer rows, raw human replies, raw model replies, raw Telegram exports、raw/export/jsonl/csv、Telegram payload、截图、语音转写、订单号、电话、地址、支付/物流信息、客服个人账号、raw prompt/completion 或 secrets。
- 不实现 DB persistence、API、worker、engine orchestration、admin UI、storage upload、eval runner、provider adapter、outbound send、confirmation queue 或 distill。
- 不调用真实 LLM/provider，不发布 prompt、知识、模型路由或 AI 人设。
- 不把 AI-assisted test-stage review 冒充 production owner blind review pass。
- 不启动 M4，不放行 GA-0、真实客户流量、customer LLM、Business release 或 1.0 release。

## 验收映射

| Item | M3-21 status | Notes |
|---|---|---|
| G-04 | test_stage_safety_lock_ready_not_quality_pass | AI-assisted sample risk review completed; weak/low-quality model release blocked by strong-model lock until owner blind review. |
| G-06 | language_proxy_coverage_ready_not_full_1_0_closed | 80 selected controlled sample ids verified; full production quota labels and owner scoring remain future. |
| J-05 | evidence_updated | M3 rollup records the language safety-lock decision. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only touch list; no schema/lock/shared config changes. |

M3-21 does not certify production language quality. It closes the M3 test-stage G-04 release-risk gap by keeping unsafe/low-quality model release impossible until owner blind review.
