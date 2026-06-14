# M0 LLM Data Processing Evidence

保存 provider retention/region/logging 证据、redaction 测试样例、trace 脱敏样例和 ADR-003 签收记录。

## 当前文件

- `openai-policy-review.md`：M0-04 官方政策证据、ADR 判定、redaction/trace 样例和签收状态。

## 当前状态

ADR-003 当前为 `accepted_dev_only__customer_llm_blocked`。项目 owner 在 2026-06-14 选择 `dev_only` 分支：OpenAI 仅允许用于合成数据、脱敏开发样本、公开知识和非客户明文任务；真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM。

该签收允许继续 OCM-04 / M1 平台骨架准备，但不放行 M3 AI 能力生产使用、GA-0 真实客户 LLM 流量或任何客户明文进入第三方 provider。
