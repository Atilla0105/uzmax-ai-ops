# History Samples Manifest

> evidence_id: M1-history-samples-manifest
> milestone: M1
> acceptance_items: G-06 / J-05
> status: redacted_seed_review_ready__human_review_pending
> created_at: 2026-06-14
> updated_at: 2026-06-17
> owner: 项目 owner 提供或确认历史真实咨询样本导出；AI agent 检查脱敏、配额、manifest 和后续 eval seed 归档
> source_files: `docs/preflight/01-owner-inputs-checklist.md`、`UZMAX智能运营系统-技术架构-v1.1.md`、`docs/adr/ADR-003-llm-data-processing.md`
> sensitive_data_location: owner-local controlled storage only; no raw or redacted sample content in repository
> redaction_status: local redaction pass produced review candidates; all records still need human review

## 当前状态

历史真实咨询样本和脱敏候选均未进入仓库，也不得提交到仓库。本文件只记录 M1 种子评测集所需的责任、格式、脱敏规则、截止时间、本地仓库外复核结果和失败分支。

ADR-003 当前为 `accepted_dev_only__customer_llm_blocked`：真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM。后续如使用历史样本建立 eval seed，必须先完成脱敏并只在受控存储和本地/CI 允许范围内处理。

2026-06-17 intake 更新：项目 owner 提供本机 Telegram 真实聊天导出，并同意按 AI agent 建议走本地只读解析、仓库外脱敏候选和人工复核路径。本 manifest 现在明确补齐 Gate 1 的两条最终合法分支，以及当前中间状态 `redacted_seed_review_ready__human_review_pending`。在项目 owner 完成人工复核签收或明确顺延前，Gate 1 仍保持 No-Go。

已有标准 QA 文档只能作为业务参考和分类辅助，不能替代脱敏真实样本，也不能被写成不可协商的固定规则。客服场景允许根据上下文调整话术；eval seed 只能验证意图、红线、语言质量和应答边界，不能把参考话术硬编码成唯一正确答案。

## Current Local Intake Result

以下记录只描述本地受控存储与脱敏摘要，不包含任何真实客户明文、截图、语音、订单号、电话、地址或客服个人账号。

| 项目 | 结果 |
|---|---|
| 原始导出位置 | owner-local `Documents/聊天记录`；仓库不记录可公开访问链接 |
| 脱敏候选位置 | owner-local `Documents/聊天记录_脱敏样本/`；仓库不提交该目录内容 |
| Telegram `result.json` 文件 | 25 个，其中 1 个为空 |
| 原始消息范围 | 2025-01-03T10:09:09 至 2026-06-17T10:06:47 |
| 原始消息计数 | 10,920 条，其中文本消息 9,173 条 |
| 脱敏候选对话对 | 2,443 条 |
| seed review 抽样 | 80 条，全部为 `needs_human_review` |
| JSONL 格式检查 | 2 个 JSONL 输出均可解析；`badJson = 0` |
| 明显残留扫描 | phone / URL / @handle / long number / identity doc 模式扫描为 0 |
| 媒体处理 | 图片、文件、语音、贴纸和视频未进入首轮文本 seed 候选 |
| 当前判定 | `redacted_seed_review_ready__human_review_pending`，不是 `sample_ready` |

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
| 历史咨询样本脱敏导出或明确不可提供结论 | 项目 owner | 原截止 2026-06-16 23:59 Asia/Tashkent；M1-00 intake 已收到本地真实导出，下一步为人工复核或顺延签收 | raw_real_export_available__redacted_seed_review_ready | 缺失、脱敏不合格或不足 60 条时，顺延 M1 eval seed、M2/M3 智能验收；不得伪造真实样本 |
| 受控存储位置与访问方式 | 项目 owner | 与导出同日 | local_only_controlled_storage | 未提供则样本不得被 AI agent 或 CI 消费；当前只允许 owner-local 仓库外处理 |
| 抽样脱敏检查许可 | 项目 owner | 导出后 1 个工作日内 | local_read_only_redaction_pass_completed__human_review_pending | 未确认则只允许记录 manifest，不允许关闭 G-06 seed 条件 |

## Intake Branches

| 分支 | 项目 owner 需要补充 | AI agent 可执行动作 | Gate 1 影响 |
|---|---|---|---|
| `redacted_seed_review_ready` | 人工抽样复核 80 条 seed review；确认脱敏质量、类别标签、语言标签和可作为 seed 的最小上下文；决定是否扩展到 200 条候选池 | 只维护仓库外候选文件和仓库内摘要；不得把候选写入正式 eval seed；不得提交客户明文或脱敏 JSONL | 当前状态。可为后续 Gate 1 Go/No-Go PR 提供证据，但本身不关闭 G-06 |
| `sample_ready` | 脱敏 `xlsx`/`csv` 或等价受控表格；受控存储位置；访问方式；抽样检查许可；样本计数、类别计数和脱敏方法摘要 | 只读取脱敏样本或 manifest；校验字段、配额、类别、脱敏摘要和 hash；准备后续 eval seed spec | 可进入后续 Gate 1 Go/No-Go 复判；G-06 仍需 M1-05 runner 实装后关闭 |
| `sample_deferred` | 明确说明历史样本暂不可提供或本阶段不提供；给出顺延范围、恢复日期或改路径；确认不得伪造真实样本 | 更新 Gate 1 复判材料；把 M1 eval seed、M2/M3 智能验收标记为顺延；只允许准备不消费真实样本的平台骨架 | Gate 1 可在后续 PR 单独复判是否允许 M1 dev skeleton；不得关闭 G-06 或放行客户 LLM |

## Minimum Intake Packet

若选择 `sample_ready`，项目 owner 只需要给出以下四项，不需要把真实文件提交到 Git：

- `storage_location`：受控存储位置或系统名称；仓库只记录位置描述和权限状态，不记录可公开访问的敏感链接。
- `access_scope`：哪些账号/工具可访问；是否允许 AI agent 在本地只读检查脱敏样本。
- `sample_summary`：总条数、意图分类条数、乌语/俄语问答条数、红线攻击条数、导出日期。
- `redaction_check_permission`：是否允许 AI agent 抽样检查脱敏质量；若不允许，只能记录 manifest，不能关闭 G-06。

若选择 `sample_deferred`，项目 owner 需要给出：

- `deferred_reason`：暂不可提供、样本不足、脱敏待做、受控存储未准备或其他原因。
- `deferred_scope`：顺延 M1 eval seed、M2/M3 智能验收、客户 LLM、或更小范围。
- `next_review_date`：下一次复判日期；没有日期时 Gate 1 不能按 Go 处理。
- `allowed_work`：是否允许仅做 M1 平台骨架 dev skeleton；仍不得消费真实样本、实现 eval runner 或放行 M2/M3。

## Review Notes

- 本文件不包含真实样本、明文、截图、语音或订单数据。
- 本文件不提交仓库外脱敏 JSONL；仓库只保存摘要和复核状态。
- `M1-05-eval-seed-manifest-and-runner` 开工前必须复核本 manifest 的 owner 输入状态。
- 若项目 owner 后续选择继续 `dev_only` 且不提供历史样本，M1 平台骨架仍可推进，但 M2/M3 智能验收保持顺延。

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | raw_export_provided__human_review_pending | PR #12 已确认样本责任、截止时间和失败分支；2026-06-17 提供本机 Telegram 真实导出并同意按建议走；下一步需复核仓库外 seed review 或明确顺延 |
| AI agent | redacted_seed_review_ready__no_go | 已记录 M1 seed 输入格式、脱敏规则、存储规则、当前仓库外脱敏复核结果、两条最终 intake 分支与失败分支；未提交真实样本或脱敏候选 |
