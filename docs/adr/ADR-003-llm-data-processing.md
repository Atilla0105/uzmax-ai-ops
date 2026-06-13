# ADR-003 LLM 数据处理策略

> 状态：proposed  
> 日期：2026-06-13  
> 关联 spec：`docs/specs/M0-04-llm-data-processing-adr.md`  
> 关联验收：F-05 / G-02 / G-03 / GA-0  
> Owner：项目 owner 确认真实客户数据与成本风险；AI agent 起草、验证和产证据  
> 时间盒：1 个工作日

## 背景

离线样本脱敏只能约束训练/评测输入，不能自动约束生产实时客户消息。UZMAX 1.0 的 `kb_answer`、`draft_reply`、`vision_diag`、`speech_postprocess`、`distill_daily` 等任务会把客户消息、截图或转写内容送入第三方 LLM，因此必须在真实流量前定义数据处理边界。

## 决策

在本 ADR 被 accepted 前，真实客户消息不得进入第三方 LLM。默认策略如下：

- 内部成本、利润、供应商条件、模型密钥、系统配置、红线阈值永不进入 prompt。
- 客户 PII（电话、地址、订单号、支付信息、Telegram username、头像、物流号）默认 redaction 后再进入 LLM；任务确需保留时必须在任务级策略中列明。
- LLM trace 默认不保存原始敏感明文；保存 hash、截断片段、token、模型、成本、延迟、redaction 事件。
- fallback provider 必须满足不低于 primary provider 的留存、区域、日志和 redaction 要求。
- `distill_daily` 只能读取租户可见数据，并在候选进入正式库前走确认队列。

## 判定分支

| 分支 | 判定条件 | 采用动作 | 验收影响 |
|---|---|---|---|
| 通过 | provider 留存/区域/日志策略明确；redaction 可执行；trace 不保存敏感明文 | 允许按任务级策略接入 LLM | GA-0 可继续推进 |
| 部分通过 | 部分 provider 或任务不满足策略 | 关闭不合格 provider 或限制到非客户数据任务 | 对应任务不得进入生产 |
| 不可行 | 无法确认留存/区域/日志，或 redaction 无法实施 | 禁止真实客户消息进入 LLM，顺延 GA-0 | 真实流量不开闸 |

## 备选方案

| 方案 | 优点 | 风险 | 判定 |
|---|---|---|---|
| provider zero-retention + redaction | 风险最低 | 供应商可用性和成本受限 | 优先 |
| provider 标准留存 + 强 redaction | 可用性高 | 合规和复盘压力更高 | 需项目 owner 确认 |
| 本地/自托管模型处理敏感任务 | 数据控制强 | 质量和运维成本高 | 作为高敏任务备选 |

## 验证证据

- provider retention/zero-retention 文档链接：
- provider 区域与日志策略：
- redaction 测试样例：
- trace 脱敏样例：
- 签收记录：

## 失败分支

- provider 不满足策略：关闭该 provider 或限制到非客户数据任务。
- PII redaction 未实现：禁止真实客户消息进入 LLM。
- 区域/留存无法确认：顺延 GA-0 与生产流量。
- 日志无法脱敏：关闭原文日志，只保留 hash/摘要/计量。

## 影响范围

- `packages/llm-gateway`
- `packages/memory`
- `packages/distill`
- `packages/evals`
- LLM call log / trace / redaction utilities
