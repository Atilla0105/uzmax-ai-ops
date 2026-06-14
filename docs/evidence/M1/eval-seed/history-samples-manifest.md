# History Samples Manifest

> evidence_id: M1-history-samples-manifest
> milestone: M1
> acceptance_items: G-06 / J-05
> status: accepted_schedule__sample_pending
> created_at: 2026-06-14
> updated_at: 2026-06-14
> owner: 项目 owner 提供或确认历史真实咨询样本导出；AI agent 检查脱敏、配额、manifest 和后续 eval seed 归档
> source_files: `docs/preflight/01-owner-inputs-checklist.md`、`UZMAX智能运营系统-技术架构-v1.1.md`、`docs/adr/ADR-003-llm-data-processing.md`
> sensitive_data_location: controlled storage only; no raw sample in repository
> redaction_status: raw customer data not present in repo; redacted sample batch pending owner input

## 当前状态

历史真实咨询样本尚未进入仓库，也不得提交到仓库。本文件只记录 M1 种子评测集所需的责任、格式、脱敏规则、截止时间和失败分支。

ADR-003 当前为 `accepted_dev_only__customer_llm_blocked`：真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM。后续如使用历史样本建立 eval seed，必须先完成脱敏并只在受控存储和本地/CI 允许范围内处理。

## Required Seed Shape

M1 种子集不少于 60 条：

| 类别 | 最低条数 | 来源要求 | 硬约束 |
|---|---:|---|---|
| 意图分类 | 30 | 脱敏真实咨询样本 | 覆盖核心意图、转人工、红线与非问题噪声 |
| 乌语/俄语问答 | 20 | 脱敏真实咨询样本，保留语言与文字系统特征 | 不丢失错别字、混合语言和必要上下文 |
| 红线攻击 | 10 | 脱敏真实咨询样本或 owner 确认的安全构造样本 | 不暴露内部价格、成本、利润、供应商条件、模型密钥或红线阈值 |

全量候选优先覆盖 200 条，并在 M6 前形成 1.0 全量评测集。

## Required Fields

脱敏导出文件建议为 `xlsx` 或 `csv`，另附受控存储侧 manifest。字段至少包含：

- `sample_id`
- `source_date`
- `source_channel`
- `language_or_script`
- `raw_question_redacted`
- `human_reply_redacted`
- `intent_label`
- `handoff_required`
- `redline_related`
- `quality_note`
- `redaction_method`

## Redaction Rules

必须移除或不可逆哈希：

- 客户姓名、电话、地址、Telegram username/user id、订单号、批次号、支付信息。
- 客服个人账号、内部备注中的员工身份、外部供应商账号。
- 成本、利润、供应商价、红线阈值、SLA 参数、内部模型/系统配置。

必须尽量保留：

- 语义、错别字、乌语拉丁/西里尔、俄语、混合语言和最小必要上下文。
- 是否转人工、是否触发红线、是否属于无效寒暄或广告。

## Storage And Access

- 原始或脱敏后的样本文件不得提交到 Git。
- 受控存储链接必须只给项目 owner 与执行本 spec 的 AI agent/工具链访问。
- 仓库只保存 manifest、脱敏摘要、样本计数、类别计数和校验 hash。
- 任一批次发现明文泄露时，该批次关闭并重新导出；不得局部修补后继续使用。

## Owner Input Schedule

| 输入 | 责任 | 截止时间 | 当前状态 | 失败分支 |
|---|---|---|---|---|
| 历史咨询样本脱敏导出或明确不可提供结论 | 项目 owner | 2026-06-16 23:59 Asia/Tashkent，或项目 owner 在 OCM-04 PR review 中改写 | pending_owner_input | 缺失、脱敏不合格或不足 60 条时，顺延 M1 eval seed、M2/M3 智能验收；不得伪造真实样本 |
| 受控存储位置与访问方式 | 项目 owner | 与导出同日 | pending_owner_input | 未提供则样本不得被 AI agent 或 CI 消费 |
| 抽样脱敏检查许可 | 项目 owner | 导出后 1 个工作日内 | pending_owner_input | 未确认则只允许记录 manifest，不允许关闭 G-06 seed 条件 |

## Review Notes

- 本文件不包含真实样本、明文、截图、语音或订单数据。
- `M1-05-eval-seed-manifest-and-runner` 开工前必须复核本 manifest 的 owner 输入状态。
- 若项目 owner 后续选择继续 `dev_only` 且不提供历史样本，M1 平台骨架仍可推进，但 M2/M3 智能验收保持顺延。

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted_schedule__sample_pending | PR #12 已确认样本责任、截止时间和失败分支；真实样本导出、受控存储和抽样脱敏检查仍待输入 |
| AI agent | accepted_schedule__sample_pending | 已记录 M1 seed 输入格式、脱敏规则、存储规则与失败分支；未消费真实样本 |
