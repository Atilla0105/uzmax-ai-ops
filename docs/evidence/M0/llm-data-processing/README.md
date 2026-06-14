# M0 LLM Data Processing Evidence

保存 provider retention/region/logging 证据、redaction 测试样例、trace 脱敏样例和 ADR-003 签收记录。

## 当前文件

- `openai-policy-review.md`：M0-04 官方政策证据、ADR 判定、redaction/trace 样例和签收状态。

## 当前状态

ADR-003 当前为 `proposed__blocked_for_real_customer_traffic`。在 provider 留存/区域/数据共享状态获项目 owner 签收，且 `packages/llm-gateway` 完成 redaction、trace 和 fallback 策略前，真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM。
