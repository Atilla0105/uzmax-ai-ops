# M0-06 Kickoff Readiness Rollup

> evidence_id: M0-06-kickoff-readiness-rollup
> milestone: M0
> acceptance_items: K-03 / K-04 / J-05
> status: ready_for_review
> created_at: 2026-06-14
> updated_at: 2026-06-14
> owner: 项目 owner 确认整理口径和后续开工授权；AI agent 记录、验证和暴露风险
> source_files: `docs/specs/M0-06-kickoff-readiness-cleanup.md`、`docs/evidence/M0/gates/Gate-0-decision.md`、`docs/evidence/M0/infra/git-ci-manifest.md`
> sensitive_data_location: none
> redaction_status: no sensitive data included

## 当前结论

M0 技术地基已闭合到可以启动 OCM-04 / M1 readiness pack review 的状态，但仍不得直接进入 M1 业务骨架实现或任何真实客户流量。

已闭合的开工地基：

- OCM-00 文档基线已 accepted。
- Gate 0 已判定 Go，范围只放行 M0 治理/CI 骨架。
- M0-01 monorepo / CI / AGENTS 治理骨架已通过 PR #1 合入。
- M0-02 governance cleanup 已通过 PR #2 合入。
- M0-05 doc entrypoints 与 `guard:doc-triggers` 已通过 PR #3、PR #4 合入。
- M0-06 kickoff readiness rollup 已通过 PR #5 合入。
- M0-07 guard script hardening 已通过 PR #6 合入。
- M0-08 CI workflow hygiene 已通过 PR #7 合入。
- M0-04 初始 LLM 数据处理 ADR 证据已通过 PR #8 合入。
- SPK-03 RLS x Prisma x 连接池已通过 PR #9 合入；ADR-001 为 `accepted`，CI 常驻 spike 证明 2000 次交错请求零串话。
- SPK-04 双鉴权链路已通过 PR #10 合入；ADR-002 为 `accepted`，CI 常驻 spike 覆盖 HTTP、WebSocket、租户切换、撤权和 Storage signed URL。
- ADR-003 dev-only 签收已通过 PR #11 合入；真实客户消息、截图、语音转写和客户档案仍不得进入第三方 LLM。

不再阻断 Gate 1 的 M0 P0：

- SPK-03：已 accepted；证据在 `docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md`。
- SPK-04：已 accepted；证据在 `docs/evidence/M0/spikes/SPK-04-dual-auth/manifest.md`。
- M0-04 / ADR-003：已 accepted 为 `accepted_dev_only__customer_llm_blocked`；证据在 `docs/evidence/M0/llm-data-processing/`。

仍阻断直接进入 M1 实现的 P0：

- OCM-04：M1 readiness pack、M1 spec 清单、项目输入排期与平台骨架边界仍需项目 owner review / merge 确认。
- Gate 1：OCM-04 合并后仍需按 `docs/preflight/00-opening-control-matrix.md` §3 做 Go/No-Go 复判。
- 历史真实咨询样本脱敏导出责任、截止时间和失败分支必须在 M1 readiness pack 中明确；缺失时顺延 M1 eval seed 与 M2/M3 智能验收。

## Spec 身份整理

历史 cleanup PR 保留 `docs/specs/M0-02-governance-cleanups.md`，因为 PR #2 已用该编号合入。

活跃的 RLS spike 以验收矩阵和技术架构中的 `SPK-03` 为主身份，文件从 `docs/specs/M0-02-rls-prisma-pool-spike.md` 改为 `docs/specs/SPK-03-rls-prisma-pool.md`。后续实现 PR 应引用 `Spec ID: SPK-03` 和新文件路径。

## Owner Review / Ruleset 现状

当前 `main` ruleset 的真实状态：

- 要求通过 PR 合入。
- 要求 `checks` status check。
- 禁止 non-fast-forward。
- 禁止删除 `main`。
- 要求 review thread resolution。
- `required_approving_review_count` 为 0，未强制 CODEOWNERS review。

单 owner 私有仓库下，强制 1 人 approving review 会造成当前 GitHub 身份无法自审的流程风险。因此本阶段的等价机制是：所有 PR 仍必须经过 PR + `checks`，最终 merge 由项目 owner 执行；若 PR 声明 `large_change_exception`、`test_weakening_exception` 或 `external_dependency_exception`，必须在 PR review、PR comment 或等价审批记录中留下项目 owner 明确批准，否则不得合并。

多 agent 或多人账号稳定后，应另开 infra spec 评估是否把 ruleset 调整为强制 approving review / CODEOWNERS review。

## 本地旧分支结论

本地分支 `codex/uzmax-governance-drift-hardening` 不是当前 `main` 的已合并分支；它基于 `3228cc6`，落后当前 `main` 两个提交，包含一次 `pr-shape` 拆分尝试。

本 PR 不合入该分支、不 cherry-pick、不删除该分支。若仍需要其中的治理脚本拆分，必须从当前 `main` 新建独立 cleanup/refactor spec 和 PR，重新验证 M0-05 之后的当前实现。

## 下一步允许动作

1. 启动 OCM-04：新增 M1 readiness pack、M1 spec 清单、项目输入排期与平台骨架边界说明。
2. OCM-04 合并后，按 Gate 1 条件做 Go/No-Go 复判。
3. Gate 1 Go 后，才允许逐个创建 M1 实现 spec；任何 `packages/db` schema 变更仍全局串行。
4. ADR-003 dev-only 分支保持生效：M1 平台骨架可继续，真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM。

## Review Notes

- 本 rollup 不替代 Gate 1 Go/No-Go。
- 本 rollup 不批准 M1、M2、M3 或 M4 业务能力实现。
- Render 服务创建、staging/prod 环境、preview/prod 访问保护和 provider 数据处理策略仍按各自 manifest 与后续 spec 执行。

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending_review | 待 M0-06 PR review / merge 记录确认 |
| AI agent | ready_for_review | 已记录当前状态、未闭合 P0、ruleset 现状和旧分支结论 |
