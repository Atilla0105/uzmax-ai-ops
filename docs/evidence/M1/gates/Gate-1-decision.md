# Gate 1 决策记录：允许进入 M1 业务骨架

> evidence_id: Gate-1-decision
> milestone: Gate 1
> status: no_go__owner_inputs_pending
> created_at: 2026-06-14
> updated_at: 2026-06-14
> owner: 项目 owner 最终判定 M1 业务骨架开工授权；AI agent 逐项复判、归档证据并暴露阻断项
> source_files: `docs/preflight/00-opening-control-matrix.md`、`docs/evidence/M1/M1-platform-skeleton-readiness-pack.md`、`docs/evidence/M1/eval-seed/history-samples-manifest.md`
> sensitive_data_location: none
> redaction_status: no sensitive data included

## 当前判定

**No-Go / 暂不允许进入 M1 业务骨架实现。**

原因：M0 技术地基、SPK-03、SPK-04、ADR-003 和 OCM-04 readiness pack 均已闭合；但历史真实咨询样本导出、受控存储访问和抽样脱敏检查仍是 `pending_owner_input`。在该输入闭合或明确顺延前，不允许把 M1 eval seed、M1 业务骨架实现或后续 M2/M3 智能验收伪装成已就绪。

允许的下一步仅限：

- 继续 owner input 收集与受控存储准备。
- 新开 docs-only 或 infra-only PR 更新 Gate 1 输入状态。
- 在 Gate 1 Go 之前准备 spec 文案，但不得实现 M1 schema、API、后台页面或 eval runner。

## Gate 1 复判状态

Gate 1 八项判定条件以 `docs/preflight/00-opening-control-matrix.md` §3 为唯一主源；本表只记录当前状态与证据。

| 条件 ID | 当前状态 | 证据 | 备注 |
|---|---|---|---|
| G1-1 | accepted | `AGENTS.md`、`docs/adr/`、`docs/specs/`、PR #1、PR #3、PR #4 | M0 治理骨架、PR 模板、spec 编号规则可用 |
| G1-2 | accepted | GitHub Actions CI run `27504014486` / job `81291892752` | CI 已实际阻断 format/typecheck/lint/depcruise/jscpd/knip/guards/spikes/test/build/size/playwright |
| G1-3 | accepted | PR #9；`docs/adr/ADR-001-rls-prisma-pool.md`；`docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md` | SPK-03 已证明双租户 2000 次交错请求零串话，CI 常驻 |
| G1-4 | accepted | PR #10；`docs/adr/ADR-002-dual-auth-access-context.md`；`docs/evidence/M0/spikes/SPK-04-dual-auth/manifest.md` | SPK-04 已覆盖 HTTP、WebSocket、token 刷新、租户切换缓存失效和 Storage signed URL |
| G1-5 | accepted_dev_only__customer_llm_blocked | PR #11；`docs/adr/ADR-003-llm-data-processing.md`；`docs/evidence/M0/llm-data-processing/README.md` | ADR-003 允许 M1 平台骨架继续，但客户 LLM 仍阻断 |
| G1-6 | accepted | PR #12；`docs/evidence/M1/M1-platform-skeleton-readiness-pack.md` | M1 readiness pack、M1 spec 清单、项目输入排期与平台骨架边界已归档 |
| G1-7 | pending_owner_input | `docs/evidence/M1/eval-seed/history-samples-manifest.md` | 历史样本导出、受控存储位置和抽样脱敏检查仍待 owner 输入 |
| G1-8 | no_go | 本文件 | 当前仍有 G1-7 P0 输入未闭合；无 P1/P2 降级签收 |

## 阻断项

| 阻断项 | 当前状态 | 失败分支 |
|---|---|---|
| 历史咨询样本脱敏导出或明确不可提供结论 | pending_owner_input | 缺失、脱敏不合格或不足 60 条时，顺延 M1 eval seed、M2/M3 智能验收；不得伪造真实样本 |
| 受控存储位置与访问方式 | pending_owner_input | 未提供则样本不得被 AI agent 或 CI 消费 |
| 抽样脱敏检查许可 | pending_owner_input | 未确认则只允许记录 manifest，不允许关闭 G-06 seed 条件 |

## Review Notes

- 本 No-Go 不回滚 M0；M0 技术地基与 OCM-04 readiness pack 已完成。
- 本 No-Go 不允许 M1 业务骨架实现，也不允许 M2/M3/M4 能力提前混入。
- ADR-003 dev-only 仍生效：真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM。
- 若项目 owner 明确确认历史样本不可提供，下一次 Gate 1 复判必须记录顺延范围、影响的验收项和新的失败分支。

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending_owner_input | 需提供或明确顺延历史样本相关输入后，才能重新复判 Gate 1 |
| AI agent | no_go_ready_for_review | 已逐条复判 Gate 1 条件并归档当前 No-Go 证据 |
