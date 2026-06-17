# M1-09 Owner Signoff Record

## 目标

记录项目 owner 对 M1 平台骨架 closeout 的明确签收，将 `docs/evidence/M1/M1-platform-skeleton-signoff.md` 从 `ready_for_review` 更新为 `accepted`，并同步当前 `main` / PR / CI 证据。本 spec 只记录 M1 里程碑签收事实，不实现新功能、不修改 runtime、不批准 production readiness、M2/M3/M4 或 GA-0。

## Owner

Owner：项目 owner 已在 Codex 线程中明确回复“都看了，完成的不错，签收了。”作为 M1 closeout 签收输入；AI agent 负责将该签收记录归档到 M1 evidence，保留仍未关闭的 owner input / production readiness / later-gate 阻断项，并完成 spec/code-quality 复核。项目 owner 仍负责后续 M2 开闸、真实账号、真实客户数据、第三方 LLM、成本、合规和生产发布决策。

## 时间盒

0.1 个工作日。若当前 `main`、PR #23、main push CI 或 owner 签收输入无法被当前状态证明，则不得把 M1 evidence 更新为 `accepted`，并保留 `ready_for_review` 缺口说明。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M1-09-owner-signoff-record.md`
- `docs/evidence/M1/M1-platform-skeleton-signoff.md`
- `docs/evidence/M1/README.md`

说明/备注：

本 PR 只允许记录 M1 owner signoff 和同步 M1 evidence 索引。未列出的模块默认不可改；尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、`docs/evidence/M0/**`、`docs/evidence/M2/**`、`docs/preflight/**` 或客户样本路径。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec；就地更新 `docs/evidence/M1/M1-platform-skeleton-signoff.md` 和 `docs/evidence/M1/README.md`。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `owner final`、`pending_explicit_review`、`ready_for_review`、`M1 signoff`、`M1-09`，确认当前缺口是 M1 closeout evidence 中项目 owner 最终签收未记录。
- 外部 API/SDK/provider/connector/adapter 依据：无新增外部 API/provider/connector/adapter；本 PR 只引用现有 GitHub PR/CI 证据和项目 owner 在 Codex 线程中的明确签收。
- 是否需要例外：无。

## 文档触发检查

- 结果：none。
- 判断依据：`docs/doc-gates.md`。本 PR 只同步 M1 evidence/spec，不新增 eval/contracts/observability/environment/release 能力路径。

## 前置条件

- M1-08 closeout post-merge evidence sync PR #23 已合并到 `main`。
- PR #23 合并后的 `main` push CI 已成功，run `27688896364` / job `81894437003` 通过。
- 当前 `main` 与 `origin/main` 同步，open PR 为空，`git branch --no-merged main` 无输出。
- 项目 owner 已明确签收 M1 closeout，原文为：“都看了，完成的不错，签收了。”

## 实施步骤

1. 更新 M1 signoff header、Current Main Evidence 和 PR ledger，纳入 PR #23 / merge commit / main push CI 事实。
2. 将 M1 signoff `status` 更新为 `accepted`，并在 Signoff 表记录项目 owner 明确签收。
3. 保留 M2/M3/M4、GA-0、真实客户流量、客户 LLM、production readiness、staging/prod infra 和 full eval target 继续阻断或后续跟踪。
4. 更新 `docs/evidence/M1/README.md`，说明 M1 closeout 已 owner accepted。
5. 运行 docs-only 与 repo check 验证，并完成 spec compliance review 与 docs quality review。

## 通过条件

- `npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M1-09-owner-signoff-record.md --include-worktree`、`git diff --check` 通过。
- 如时间允许，`npm run check` 通过。
- M1 signoff evidence 可追溯到 PR #16-#23、main merge commits、PR CI、main push CI、M1 evidence 文件和项目 owner 明确签收输入。
- Signoff 不提交 raw/export/jsonl/csv 样本，不引入 M2/M3/M4/GA-0 能力，不让真实客户消息进入第三方 LLM。
- 实现完成后先做 spec compliance review，再做 code quality/docs review。

## 失败分支

- 若发现 PR #23、CI 或 current main evidence 无法被当前 GitHub 状态证明：保持 signoff 为 `ready_for_review`，列出缺口并停止本 PR。
- 若 owner signoff 不是明确签收或含条件：保持 `ready_for_review`，记录待确认条件，不更新为 `accepted`。
- 若 production readiness、M2/M3/M4、GA-0、客户 LLM 或真实客户流量被误写为已放行：回滚该表述，保持阻断或顺延状态。
- 若发现仓库内存在 raw/export/jsonl/csv 样本或客户明文：关闭本 PR，先执行清理/泄露处置 spec。

## 不做什么

- 不修改应用代码、测试、schema、API、admin、eval runner 或 CI。
- 不批准 M2 Telegram/Bot/Business、M3 AI、M4 订单/客户资产、GA-0 真实流量、自动回复、蒸馏自动写库或客户 LLM。
- 不提交真实客户明文、截图、语音转写、订单号、电话、地址、账号、raw/export/jsonl/csv 样本或脱敏样本内容。
- 不把 production readiness、staging/prod infra、M6 full eval target 或后续外部依赖写成已关闭。

## 验收映射

- J-05：M1 closeout/signoff evidence 获得项目 owner 明确签收，不把 M1 owner signoff 留到 M6 集中补签。
- K-03：本 PR 有独立 spec，并在 PR 描述引用 spec 编号。
- K-04：触碰模块清单约束本 docs-only PR 范围；开工前已确认 open PR 与未合并分支为空。
