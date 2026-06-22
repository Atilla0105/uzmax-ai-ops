# M3-17 Owner Input Intake Packs

## 目标

为 M3 剩余 owner-input 阻断项建立可复核的收料包与证据壳：

- F-02 截图诊断样例 manifest；
- F-02 截图评测运行报告壳；
- G-04 乌语拉丁 / 乌语西里尔 / 俄语盲评报告壳。

本 spec 只固定交付格式、敏感数据边界、当前缺口和后续通过条件。它不提交截图、客户明文、盲评明细、raw prompt/completion，不运行真实评测，不关闭 F-02/G-04/M3，不启动 M4，不放行 production、GA-0、真实客户流量、customer LLM、prompt/model/persona release、knowledge publish 或 1.0 release。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认这些收料包是否可作为后续提交截图样例和语言盲评的固定格式。Owner 仍负责提供/确认截图样例、盲评结果、真实客户数据使用、模型强弱路由、成本、合规、发布和 M3 最终签收。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-17-owner-input-intake-packs` / `codex/m3-17-owner-input-intake-packs` 中执行；根据 `AGENTS.md`、四份 v1.1 根文档、M3-06 evidence、M3 closeout 和 owner-input checklist 建立 docs-only intake evidence；不接收、不复制、不生成 raw/customer/secret material；不把空收料包计为验收通过。

## 时间盒

0.5 个工作日。若需要真实截图、盲评原表、客户明文、模型输出、LLM provider 调用、DB/admin/runtime integration 或发布决策，则停止并拆分后续 spec。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M3-17-owner-input-intake-packs.md`
- `docs/evidence/M3/M3-17-owner-input-intake-packs.md`
- `docs/evidence/M3/vision/screenshot-cases-manifest.md`
- `docs/evidence/M3/vision/eval-run-report.md`
- `docs/evidence/M3/language-blind-review/blind-review-report.md`
- `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`
- `docs/evidence/M3/README.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw/export/jsonl/csv、客户明文、Telegram payload、screenshots、voice transcripts、orders、phone/address/payment data、support personal accounts、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0；net source LOC <= 0；new source files <= 0。
- path categories：docs = this spec、M3-17 evidence、vision screenshot manifest、vision eval run report、language blind-review report、M3 closeout evidence sync、M3 evidence README。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `screenshot-cases-manifest`、`eval-run-report`、`blind-review-report`、`language-blind-review`、`vision/`、`F-02`、`G-04`、`截图诊断样例`、`乌语拉丁`、`乌语西里尔`、`盲评`。当前缺口是 owner-input intake/evidence shell，不是 runtime implementation。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 spec 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-17-owner-input-intake-packs`。
- 当前分支必须是 `codex/m3-17-owner-input-intake-packs`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许只读核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、root/main status、open PR 和 no-merged branch 状态。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-06 evidence、M3 closeout evidence、M3 README、`docs/preflight/01-owner-inputs-checklist.md`。
- 输入材料不得复制进仓库；仓库只记录 manifest fields、count、controlled refs、redaction status、review/pending status 和 owner confirmation status。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m3-17-owner-input-intake-packs` |
| branch | `codex/m3-17-owner-input-intake-packs` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes, runtime release gates or production configuration.

## 事故与 closeout 记录

- Incident: none at authoring.
- If any raw/customer/secret content is detected in generated docs, stop and cleanup before continuing.

## 实施步骤

1. 建立 M3-17 docs-only spec 和 evidence record。
2. 建立 `docs/evidence/M3/vision/screenshot-cases-manifest.md`，定义截图样例收料字段、脱敏规则、count/status 和拒收条件。
3. 建立 `docs/evidence/M3/vision/eval-run-report.md`，明确当前 `not_run_owner_samples_pending`，并记录未来 F-02 eval gate 的输入和不通过边界。
4. 建立 `docs/evidence/M3/language-blind-review/blind-review-report.md`，定义盲评字段、覆盖要求、盲评隔离和强模型锁定决策字段。
5. 更新 M3 closeout/README：vision/language evidence directories 从 absent 更新为 intake-ready/pending，但 F-02/G-04/M3 closeout 仍 blocked。
6. 运行 required validation 并记录结果。

## 通过条件

- `screenshot-cases-manifest.md` 明确至少 20 张真实或真实流程复刻截图的必填字段、脱敏规则、受控存储边界、当前计数和 pass/fail 条件。
- `eval-run-report.md` 明确当前没有运行真实截图评测，F-02 仍因 owner samples/eval result 缺失而 blocked。
- `blind-review-report.md` 明确乌语拉丁 20、乌语西里尔 20、俄语 20 的覆盖要求、盲评字段、盲评隔离、低质样本原因和强模型锁定决策字段。
- M3 closeout remains `foundation_queue_complete__owner_inputs_block_closeout`; F-02/G-04 remain not closed.
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-17-owner-input-intake-packs.md --include-worktree`, `git diff --check origin/main...HEAD`, and full `npm run check` if feasible.

## 失败分支

- 若 worktree or branch differs from expected path/branch: stop and report; do not write in the wrong checkout.
- 若 any raw screenshot, customer message, blind-review raw answer, raw model output, order/phone/address/payment data, support personal account or secret would enter git: stop, remove generated content and report the boundary issue.
- 若 owner samples are fewer than 20, unredacted, unreadable, pure mock-heavy or missing expected diagnosis/handoff fields: keep F-02 blocked.
- 若 blind review lacks Uzbek Latin/Cyrillic/Russian coverage, hides low-quality reasons, exposes route/prompt details in a way that biases review, or lacks strong-model decision: keep G-04 blocked.
- 若 validation exposes out-of-scope changes: remove them; do not widen the touch list.
- 若 GitHub Actions cannot start because of account billing/spending limits: record as external validation blocker; do not claim CI pass.

## 不做什么

- 不提交截图文件、盲评原表、客户明文、raw Telegram exports、raw/export/jsonl/csv、Telegram payload、语音转写、订单号、电话、地址、支付信息、客服个人账号、raw prompt/completion 或 secrets。
- 不实现 DB persistence、API、worker、engine orchestration、admin UI、storage upload、eval runner、provider adapter、outbound send、confirmation queue 或 distill。
- 不运行真实评测，不生成 eval pass，不发布 prompt、知识、模型路由或 AI 人设。
- 不启动 M4，不放行 M3 owner signoff、GA-0、真实客户流量、customer LLM、Business release 或 1.0 release。

## 验收映射

| Item | M3-17 status | Notes |
|---|---|---|
| F-02 | intake_ready_owner_samples_pending_not_closed | Screenshot sample/eval evidence locations exist, but current usable sample count is 0 and eval is not run. |
| G-04 | intake_ready_blind_review_pending_not_closed | Blind-review report shell exists, but Uzbek Latin/Cyrillic/Russian review counts are 0 and strong-model decision is pending. |
| G-06 | evidence_shape_prepared_not_closed | Screenshot and language quotas are reflected as intake requirements; full 1.0 eval set remains future. |
| J-05 | evidence_updated | M3 evidence now records the remaining owner-input intake path. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only touch list; no schema/lock/shared config changes. |

M3-17 does not close M3. It changes only the evidence state from absent destination files to intake-ready owner-input pending files.
