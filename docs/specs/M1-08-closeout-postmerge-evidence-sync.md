# M1-08 Closeout Post-Merge Evidence Sync

## 目标

同步 M1 closeout/signoff 证据中的 post-merge 事实，把 PR #22 合并后的 `main` commit、PR CI、main push CI 和当前分支/PR 清洁状态补入 M1 里程碑记录。本 spec 只修正 M1 证据与当前仓库事实的追溯性，不实现新功能、不修改 runtime、不批准 M2/M3/M4 或 GA-0。

## Owner

Owner：项目 owner 最终确认 M1 里程碑签收、production readiness 风险和后续 M2 开闸；AI agent 负责从当前 `main`、GitHub PR/CI 状态和 M1 evidence 更新 post-merge evidence，暴露仍未关闭的 owner input / production readiness 缺口，并完成 spec/code-quality 复核。项目 owner 仍负责真实账号、真实客户数据、第三方 LLM、成本、合规、生产发布和后续阶段开闸决策。

## 时间盒

0.1 个工作日。到期若 PR #22 合并状态、main push CI 或本地卫生无法被当前 repo/GitHub 状态证明，则不更新为已闭合事实，保留缺口说明并停止本 PR。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M1-08-closeout-postmerge-evidence-sync.md`
- `docs/evidence/M1/M1-platform-skeleton-signoff.md`
- `docs/evidence/M1/README.md`

说明/备注：

本 PR 只允许更新 M1 closeout post-merge evidence 和 M1 evidence 索引。未列出的模块默认不可改；尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、`docs/evidence/M0/**`、`docs/evidence/M2/**`、`docs/preflight/**` 或客户样本路径。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec；就地更新 `docs/evidence/M1/M1-platform-skeleton-signoff.md` 和 `docs/evidence/M1/README.md`。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `M1-08`、`post-merge`、`signoff`、`ready_for_review`、`J-05`，确认当前缺口是 M1 closeout evidence 中 #22 合并后事实未回填。
- 外部 API/SDK/provider/connector/adapter 依据：无新增外部 API/provider/connector/adapter；本 PR 只引用 GitHub PR/CI 证据。
- 是否需要例外：无。

## 文档触发检查

- 结果：none。
- 判断依据：`docs/doc-gates.md`。本 PR 只同步 M1 evidence/spec，不新增 eval/contracts/observability/environment/release 能力路径。

## 前置条件

- M1-07 closeout/signoff PR #22 已合并到 `main`。
- PR #22 PR CI 已成功，run `27687247764` / job `81888898222` 通过。
- PR #22 合并后的 `main` push CI 已成功，run `27687578400` / job `81889987853` 通过。
- 当前 `main` 与 `origin/main` 同步，open PR 为空，`git branch --no-merged main` 无输出。

## 实施步骤

1. 更新 M1 signoff `source_files`、Current Main Evidence 和 PR ledger，加入 M1-07 / PR #22 / merge commit / CI 事实。
2. 保持 M1 signoff 状态为 `ready_for_review`，不得代替项目 owner 做最终签收。
3. 明确 M2/M3/M4、GA-0、真实客户流量、客户 LLM、production readiness 和 owner pending input 继续阻断。
4. 更新 `docs/evidence/M1/README.md`，说明 closeout 已完成 post-merge evidence sync。
5. 运行 docs-only 与 repo check 验证，并完成 spec compliance review 与 docs quality review。

## 通过条件

- `npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M1-08-closeout-postmerge-evidence-sync.md --include-worktree`、`git diff --check` 通过。
- 如时间允许，`npm run check` 通过。
- M1 signoff evidence 可追溯到 PR #16-#22、main merge commits、PR CI、main push CI 和 M1 evidence 文件。
- Signoff 不提交 raw/export/jsonl/csv 样本，不引入 M2/M3/M4/GA-0 能力，不让真实客户消息进入第三方 LLM。
- 实现完成后先做 spec compliance review，再做 code quality/docs review。

## 失败分支

- 若发现 PR #22、CI 或 main merge evidence 无法被当前 GitHub 状态证明：保持 signoff 为 `ready_for_review`，列出缺口并停止本 PR。
- 若 owner input / production readiness 被误写为已关闭：回滚该表述，保持阻断或顺延状态。
- 若需要进入 M2 才能证明的能力被误列为 M1 完成：从 signoff 删除，拆到后续 M2 spec。
- 若发现仓库内存在 raw/export/jsonl/csv 样本或客户明文：关闭本 PR，先执行清理/泄露处置 spec。

## 不做什么

- 不修改应用代码、测试、schema、API、admin、eval runner 或 CI。
- 不批准 M2 Telegram/Bot/Business、M3 AI、M4 订单/客户资产、GA-0 真实流量、自动回复、蒸馏自动写库或客户 LLM。
- 不提交真实客户明文、截图、语音转写、订单号、电话、地址、账号、raw/export/jsonl/csv 样本或脱敏样本内容。
- 不把 owner pending input、production readiness 或 M6 full eval target 写成已关闭。

## 验收映射

- J-05：M1 closeout/signoff evidence 与 #22 合并后的 main 事实同步，不把 post-merge evidence 留到 M6 集中补签。
- K-03：本 PR 有独立 spec，并在 PR 描述引用 spec 编号。
- K-04：触碰模块清单约束本 docs-only PR 范围；开工前已确认 open PR 与未合并分支为空。
