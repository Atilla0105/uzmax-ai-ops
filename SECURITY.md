# Security

UZMAX 当前是内部平台工程仓库。安全入口只记录处理路径；数据处理和 LLM 策略以 `docs/adr/ADR-003-llm-data-processing.md` 及后续签收证据为准。

## 报告入口

- 漏洞、越权、secret 泄露、真实客户数据暴露或 LLM 数据处理风险，先通过项目 owner 的私有沟通渠道报告。
- 不要在公开 issue、PR 描述、提交信息或截图中粘贴 token、客户明文、订单号、电话号码、地址、聊天账号、支付信息或平台 secret。
- AI agent 发现疑似泄露时，只记录受影响路径、风险类型、已采取的本地隔离动作和需要 owner 决策的事项。

## Secret 处理

- secret 只能放在忽略的本地 env 文件或平台托管环境变量中。
- 如果 token、LLM key、service role key 或 Bot token 泄露，按 `docs/runbooks/secret-token-rotation.md` 轮换。
- 证据文件只记录受控存储位置、权限范围、owner 和签收状态，不记录 secret 值。

## 真实客户数据

- 未完成 ADR-003 签收与必要证据前，真实客户消息不得进入第三方 LLM。
- 样本、截图、订单、聊天记录进入仓库或评测前必须脱敏。
- 与客户数据、LLM 留存、区域、trace 脱敏相关的最终策略不得在本文件复写；以 ADR 和 evidence 为准。
