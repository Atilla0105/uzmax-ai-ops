# M1-07 Platform Skeleton Closeout Signoff

## 目标

归档 M1 平台骨架 closeout/signoff 证据，把 M1-01 至 M1-05 的合并事实、CI 证据、覆盖验收项、未关闭的 owner input / production readiness 缺口和后续 M2 阻断边界写入一份可复核里程碑记录。本 spec 只做 M1 closeout docs，不实现新功能、不修改 runtime、不批准 M2/M3/M4 或 GA-0。

## Owner

Owner：项目 owner 最终确认 M1 里程碑签收、production readiness 风险和是否允许后续 M2 另开阶段；AI agent 负责从当前 `main`、PR/CI 状态和 M1 evidence 产出 closeout 证据、暴露阻断项并完成 spec/code-quality 复核。项目 owner 仍负责真实账号、真实客户数据、第三方 LLM、成本、合规、生产发布和后续阶段开闸决策。

## 时间盒

0.25 个工作日。到期若 M1 PR/CI/evidence 无法被当前 repo 状态证明，则保持 closeout 为 `draft` 或 `ready_for_review` 并列出缺口；不得用签收文档掩盖 P0 未过、owner input 缺失或生产 readiness 未关闭。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M1-07-platform-skeleton-closeout-signoff.md`
- `docs/evidence/M1/**`

说明/备注：

本 PR 只允许新增 M1 closeout/signoff 证据并更新 M1 evidence 索引。未列出的模块默认不可改；尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、`docs/evidence/M0/**`、`docs/evidence/M2/**`、`docs/preflight/**` 或客户样本路径。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec；新增 `docs/evidence/M1/M1-platform-skeleton-signoff.md`；就地更新 `docs/evidence/M1/README.md`。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `M1-platform-skeleton-signoff`、`signoff`、`M1-07`、`M1 closeout`、`J-05`，确认当前 M1 evidence 没有里程碑 closeout/signoff 文件。
- 外部 API/SDK/provider/connector/adapter 依据：无新增外部 API/provider/connector/adapter；本 PR 只引用现有 GitHub PR/CI 证据。
- 是否需要例外：无。

## 文档触发检查

- 结果：none。
- 判断依据：`docs/doc-gates.md`。本 PR 只更新 M1 evidence/spec，不新增 eval/contracts/observability/environment/release 能力路径；现有 `docs/evals/README.md` 和 `docs/contracts/README.md` 已由前序 M1 specs 触发并存在。

## 前置条件

- M1-01 至 M1-05 实现 PR 均已合并到 `main`。
- M1-06 Gate 1 Go/No-Go 已合并，Gate 1 状态为 `go__m1_platform_skeleton_only`。
- 当前 `main` 与 `origin/main` 同步，open PR 为空，`git branch --no-merged main` 无输出。
- PR #21 合并后的 `main` push CI 已成功，run `27686287874` / job `81885698889` 通过。

## 实施步骤

1. 新增 M1 closeout/signoff evidence，列出 M1-01 至 M1-05 的 PR、merge commit、CI 证据、交付项和验收映射。
2. 将 A-01/A-02/B-01/B-02/B-03/B-04/B-05/G-06/J-05/K-03/K-04 分成 `closed_for_m1_platform_skeleton`、`partial_or_follow_up`、`blocked_for_production_or_next_gate`，避免把 M1 dev skeleton 误写成 production readiness。
3. 明确未关闭项：staging/prod Supabase、Render/Redis/rollback route、Vercel preview/prod access protection、full candidate 200 target、M2/M3/M4/GA-0、客户 LLM 和真实客户流量。
4. 更新 `docs/evidence/M1/README.md` 索引 closeout/signoff 证据。
5. 运行 docs-only 与 repo check 验证，并完成 spec compliance review 与 code quality/docs review。

## 通过条件

- `npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M1-07-platform-skeleton-closeout-signoff.md`、`git diff --check` 通过。
- 如时间允许，`npm run check` 通过。
- M1 signoff evidence 可追溯到 PR #16-#21、main merge commits、PR CI、main push CI 和 M1 evidence 文件。
- Signoff 不提交 raw/export/jsonl/csv 样本，不引入 M2/M3/M4/GA-0 能力，不让真实客户消息进入第三方 LLM。
- 实现完成后先做 spec compliance review，再做 code quality/docs review。

## 失败分支

- 若发现 M1 实现 PR、CI 或 evidence 缺失：closeout 保持 `draft` 或 `ready_for_review`，列出缺口并另开对应修复 spec。
- 若 owner input / production readiness 被误写为已关闭：回滚该表述，保持阻断或顺延状态。
- 若需要进入 M2 才能证明的能力被误列为 M1 完成：从 signoff 删除，拆到后续 M2 spec。
- 若发现仓库内存在 raw/export/jsonl/csv 样本或客户明文：关闭本 PR，先执行清理/泄露处置 spec。

## 不做什么

- 不修改应用代码、测试、schema、API、admin、eval runner 或 CI。
- 不批准 M2 Telegram/Bot/Business、M3 AI、M4 订单/客户资产、GA-0 真实流量、自动回复、蒸馏自动写库或客户 LLM。
- 不提交真实客户明文、截图、语音转写、订单号、电话、地址、账号、raw/export/jsonl/csv 样本或脱敏样本内容。
- 不把 owner pending input、production readiness 或 M6 full eval target 写成已关闭。

## 验收映射

- J-05：M1 里程碑 closeout/signoff evidence 当场归档，不留到 M6 集中补签。
- K-03：本 PR 有独立 spec，并在 PR 描述引用 spec 编号。
- K-04：触碰模块清单约束本 docs-only PR 范围。
- G-06：引用 M1-05 seed runner 证据，确认 M1 seed quota runner/pass；full candidate 200 target 仍为后续目标。
