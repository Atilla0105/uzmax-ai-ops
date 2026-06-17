# Gate 1 决策记录：允许进入 M1 平台骨架

> evidence_id: Gate-1-decision
> milestone: Gate 1
> status: go__m1_platform_skeleton_only
> created_at: 2026-06-14
> updated_at: 2026-06-17
> owner: 项目 owner 最终判定 M1 业务骨架开工授权；AI agent 逐项复判、归档证据并暴露阻断项
> source_files: `docs/preflight/00-opening-control-matrix.md`、`docs/specs/M1-06-gate-1-go-no-go.md`、`docs/evidence/M1/M1-platform-skeleton-readiness-pack.md`、`docs/evidence/M1/eval-seed/history-samples-manifest.md`
> sensitive_data_location: none in repository; owner-local raw export and redacted review candidates remain outside Git
> redaction_status: no sensitive data included in this evidence; owner-local redacted seed review accepted for Gate 1 intake

## 当前判定

**Go / 允许进入 M1 平台骨架实现。**

原因：M0 技术地基、SPK-03、SPK-04、ADR-003 和 OCM-04 readiness pack 均已闭合；PR #15 已记录 owner-local Telegram 真实聊天导出和仓库外脱敏 seed review；项目 owner 已在 2026-06-17 指示完成本窗口 Gate 1 Go/No-Go 复判；AI agent 对 80 条 seed review 做了只读结构、配额和明显脱敏残留复核。Gate 1 八项条件已满足，当前无 P0 残项。

2026-06-17 M1-06 复判：仓库外 seed review 共 80 条唯一记录，字段完整；意图覆盖 68 条，乌语/俄语相关语言覆盖 80 条，红线相关宽口径覆盖 54 条，其中 `restricted_goods` 25 条；phone / URL / @handle / long number / identity doc 明显敏感模式残留扫描为 0。该输入可作为 Gate 1 的 `sample_ready` 证据，允许 M1-05 后续建立正式 eval seed manifest 和 runner。G-06 本次不关闭，仍需 M1-05 用 runner 和正式入集校验关闭。

允许的下一步：

- 从新窗口/新阶段开始 M1 平台骨架工作。
- 首个实现 PR 应从 `M1-01-platform-schema-authz-foundation` 开始，或先补对应 spec 文件后再实现。
- M1-05 可消费仓库外脱敏摘要来建立 eval seed manifest/runner，但不得把真实样本或脱敏 JSONL/CSV 提交到 Git。
- 每个 M1 PR 必须一 spec 一 PR，触碰模块受 spec 约束，`packages/db` schema 变更全局串行。

仍禁止：

- M2 Telegram Bot / Business 渠道生产链路。
- M3 AI 能力、LLM 网关生产流量、prompt/知识/模型路由发布。
- M4 订单 connector、客户资产完整闭环、报价记录生产路径。
- GA-0 真实客户流量、自动回复、蒸馏候选自动写入正式库。
- 真实客户明文、截图、语音转写或客户档案进入第三方 LLM。

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
| G1-7 | sample_ready__gate1_go | `docs/evidence/M1/eval-seed/history-samples-manifest.md`、`docs/specs/M1-00-gate1-owner-input-intake.md`、`docs/specs/M1-06-gate-1-go-no-go.md` | 本机真实 Telegram 导出已转成仓库外脱敏候选和 80 条 seed review；只读复核配额与明显残留通过；不提交样本内容到 Git |
| G1-8 | go | 本文件 | 当前无 P0 残项；非 M1 范围能力继续阻断 |

## 阻断项

| 原阻断项 | 当前状态 | 后续约束 |
|---|---|---|
| 历史咨询样本脱敏导出或明确不可提供结论 | sample_ready__gate1_go | M1-05 必须建立正式 eval seed manifest、runner 和配额校验；G-06 本次不关闭 |
| 受控存储位置与访问方式 | local_only_controlled_storage | 当前只允许 owner-local 仓库外处理；不得让 CI、公开链接或第三方 LLM 消费样本 |
| 抽样脱敏检查许可 | local_read_only_redaction_pass_completed__accepted_for_gate1 | 若 M1-05 发现脱敏不合格、类别不足或上下文不足，必须关闭该批次或补样，不得伪造真实样本 |

## M1-06 复判摘要

| 项目 | 复判结果 |
|---|---|
| Gate 1 判定 | `go__m1_platform_skeleton_only` |
| seed review 记录数 | 80 条唯一记录 |
| 字段完整性 | `sample_id`、`source_date`、`language_or_script`、`intent_labels`、`customer_question_redacted`、`human_reply_redacted`、`redaction_hits` 均存在 |
| 意图覆盖 | 68 条非 `other` 记录，满足最低 30 条 |
| 乌语/俄语覆盖 | 80 条，满足最低 20 条 |
| 红线相关覆盖 | broad redline 54 条，`restricted_goods` 25 条，满足最低 10 条 |
| 明显残留扫描 | phone / URL / @handle / long number / identity doc 均为 0 |
| 仓库内容 | 只提交摘要和证据，不提交 raw export、redacted JSONL/CSV 或客户明文 |
| G-06 状态 | 输入已 ready；G-06 仍需 M1-05 runner 和正式入集校验后关闭 |

## Review Notes

- 本 Go 不回滚 M0；M0 技术地基与 OCM-04 readiness pack 已完成。
- 本 Go 只允许 M1 平台骨架实现，不允许 M2/M3/M4 能力提前混入。
- ADR-003 dev-only 仍生效：真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM。
- G-06 不在本复判关闭；M1-05 必须用 runner 和正式入集 manifest 单独关闭。
- 若 M1-05 发现 seed review 质量不合格，必须关闭该批次或补样，M2/M3 智能验收继续阻断。

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | gate1_go_requested_and_sample_ready_accepted | 2026-06-17 提供本机 Telegram 真实导出并同意按建议走；随后指示完成本窗口 Gate 1 Go/No-Go 复判，M1 新阶段另开窗口 |
| AI agent | go_m1_platform_skeleton_only | 已逐条复判 Gate 1 条件，复核仓库外 80 条 seed review 摘要；未提交真实样本或脱敏 JSONL/CSV，未放行 M2/M3/M4/GA-0 |
