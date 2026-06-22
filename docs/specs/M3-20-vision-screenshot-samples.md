# M3-20 Vision Screenshot Samples

## 目标

把项目 owner 在本机截图目录提供的 26 张教程/流程截图转成 M3 F-02 可复核的受控样例 manifest 与 test-stage eval 证据。

本 spec 只记录截图样例、owner test-fixture 确认、受控引用、hash/dimension、预期诊断、不确定/转人工判定和 AI agent 视觉评审结果。它不提交截图文件、不复制原始 OCR/图中文字、不上传 storage、不调用真实 vision provider、不实现 DB/API/admin/worker/engine integration、不发布知识、不放行 production、GA-0、customer LLM、M4 或 1.0。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：已在 2026-06-22 确认截图中的姓名/电话等可见标识为预留测试数据，可按 test fixture 处理。Owner 仍负责最终生产知识、生产截图素材重整理、真实客户数据使用、真实 provider/key、成本、合规、GA-0 和 1.0 发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-20-vision-screenshot-samples` / `codex/m3-20-vision-screenshot-samples` 中执行；核对截图数量、格式、hash、尺寸、可判读性和 F-02 eval 条件；仓库只记录受控引用和安全摘要；不得把 raw screenshot、raw OCR、测试号码/地址/订单样式值、头像、账号、支付信息或 secrets 写入 git。

## 时间盒

0.5 个工作日。若需要图片入库、storage upload、真实 provider 调用、真实客户数据、生产盲评、DB/admin/runtime integration 或发布决策，则停止并拆分后续 spec。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M3-20-vision-screenshot-samples.md`
- `docs/evidence/M3/M3-20-vision-screenshot-samples.md`
- `docs/evidence/M3/vision/screenshot-cases-manifest.md`
- `docs/evidence/M3/vision/eval-run-report.md`
- `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`
- `docs/evidence/M3/README.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw/export/jsonl/csv、客户明文、Telegram payload、screenshot 文件、OCR 明文、voice transcripts、orders、phone/address/payment values、support personal accounts、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0；net source LOC <= 0；new source files <= 0。
- path categories：docs = this spec、M3-20 evidence、vision screenshot manifest、vision eval report、M3 closeout evidence sync、M3 evidence README。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `screenshot-cases-manifest`、`eval-run-report`、`F-02`、`visionScreenshotKinds`、`Screenshot diagnostics`、`截图诊断样例`、`owner screenshot samples`、`M3-06`、`M3-17`、`M3-19`。现有 `packages/capabilities/vision` foundation 已覆盖受控 ref 和 fail-closed 行为；当前缺口是 owner-confirmed 样例/eval 证据，不是 runtime implementation。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 spec 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-20-vision-screenshot-samples`。
- 当前分支必须是 `codex/m3-20-vision-screenshot-samples`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许只读核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、root/main status、open PR 和 no-merged branch 状态。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/doc-gates.md`、M3-06/M3-17/M3-19 spec/evidence、M3 closeout evidence、M3 README、`docs/preflight/01-owner-inputs-checklist.md` 和 `packages/capabilities/vision/src/index.ts`。
- 输入材料不得复制进仓库；仓库只记录 manifest refs、hash、dimension、count、controlled expected refs、redaction/test-fixture status、review status 和 owner confirmation status。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m3-20-vision-screenshot-samples` |
| branch | `codex/m3-20-vision-screenshot-samples` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes, runtime release gates or production configuration.

## 事故与 closeout 记录

- Incident: none at authoring.
- If any raw screenshot, OCR text, customer/test identifier value or secret is detected in generated docs, stop and cleanup before continuing.

## 实施步骤

1. 新增 M3-20 docs-only spec 和 evidence record。
2. 更新 `docs/evidence/M3/vision/screenshot-cases-manifest.md`：记录 26 个 owner-confirmed test fixture screenshot cases、受控 storage/redaction refs、hash/dimensions、screenshot kind、expected diagnosis refs、acceptable uncertainty refs 和 must-handoff flags。
3. 更新 `docs/evidence/M3/vision/eval-run-report.md`：记录 AI agent test-stage visual review run，包含 26 case 结果、低置信/敏感路径转人工判定和生产 provider/e2e 边界。
4. 更新 M3 closeout/README：F-02 从 owner samples pending 推进到 test-stage sample/eval ready；仍不声明 production provider、GA-0、customer LLM、knowledge publish 或 1.0 release。
5. 运行 required validation 并记录结果。

## 通过条件

- Screenshot manifest 记录 >=20 个 owner-confirmed usable cases；当前目标为 26。
- 每个 counted row 都有 `case_id`、`screenshot_type`、`storage_ref`、`redaction_ref`、`user_question_ref`、`expected_diagnosis_ref`、`acceptable_uncertainty_ref` 和 `must_handoff`。
- Owner test-fixture identifier decision 已记录；raw images and raw visible values remain outside repository。
- AI agent 对所有 26 张截图完成可判读性和安全边界 review，并将低置信/敏感路径强答判为失败。
- Eval report 记录 test-stage visual review pass/fail/block counts 和未覆盖生产 provider/e2e 的边界。
- M3 closeout remains honest: F-02 test-stage sample/eval evidence exists, but production provider/e2e, GA-0, customer LLM and 1.0 release remain future-gated。
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-20-vision-screenshot-samples.md --include-worktree`, `git diff --check origin/main...HEAD`, and full `npm run check` if feasible.

## 失败分支

- 若 worktree or branch differs from expected path/branch: stop and report; do not write in the wrong checkout.
- 若 any raw screenshot, OCR text, visible fixture value, customer message, order/phone/address/payment value, support personal account or secret would enter git: stop, remove generated content and report the boundary issue.
- 若 owner-confirmed usable samples fall below 20: keep F-02 blocked and request more screenshots.
- 若 visual review finds unreadable/contextless samples: mark affected rows `count_for_f02=false`; do not inflate counts.
- 若 low-confidence, credential-like or sensitive verification screenshots are strongly answered instead of handoff/uncertain: mark eval failed.
- 若 validation exposes out-of-scope changes: remove them; do not widen the touch list.

## 不做什么

- 不提交截图文件、缩略图、OCR 明文、客户明文、raw Telegram exports、raw/export/jsonl/csv、Telegram payload、语音转写、订单号、电话、地址、支付信息、客服个人账号、raw prompt/completion 或 secrets。
- 不实现 DB persistence、API、worker、engine orchestration、admin UI、storage upload、eval runner、provider adapter、outbound send、confirmation queue 或 distill。
- 不调用真实 vision/LLM provider，不生成 production eval pass，不发布 prompt、知识、模型路由或 AI 人设。
- 不启动 M4，不放行 GA-0、真实客户流量、customer LLM、Business release 或 1.0 release。

## 验收映射

| Item | M3-20 status | Notes |
|---|---|---|
| F-02 | test_stage_sample_eval_ready_not_production_closed | 26 owner-confirmed test fixture screenshots are manifested and AI visually reviewed; production provider/e2e remains future. |
| G-06 | screenshot_quota_met_for_test_stage_not_full_1_0_closed | Screenshot category quota exceeds 20; full 1.0 >=200 set remains future. |
| J-05 | evidence_updated | M3 evidence now records actual screenshot cases and test-stage eval evidence. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only touch list; no schema/lock/shared config changes. |

M3-20 does not publish knowledge, run production provider evals or approve release. It closes the owner-screenshot intake gap for M3 test-stage evidence only.
