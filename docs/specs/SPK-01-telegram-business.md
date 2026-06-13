# SPK-01 Telegram Business 真实环境 Spike

## 目标

用真实 Telegram Business 账号验证 Business 草稿模式在 1.0 中的可行边界，并将结论写入 `docs/adr/ADR-B01-telegram-business.md`。本 spec 只做 spike 与分支判定，不实现完整 Business 产品能力。

## Owner

Owner：AI agent 执行真实环境 spike；项目 owner 提供或授权真实账号、测试会话，并确认分支结论。

## 时间盒

拿到真实账号后 1 个工作日；账号或权限准备不足时最多顺延到 2 天并写阻断记录；硬截止不得晚于 M2。

## 触碰模块/文件

- Telegram Bot 测试配置与 webhook 监听 spike。
- 最小 Business 事件记录脚本或临时 endpoint。
- `docs/adr/ADR-B01-telegram-business.md`。
- `docs/evidence/M2/spikes/SPK-01-telegram-business/`。

## 前置条件

- 真实 Telegram Business 账号，含 Premium。
- 真实 Bot。
- 至少一个客服本人账号与一个客户测试账号。
- 可查看 webhook payload、权限错误、后台草稿或临时记录。

## 实施步骤

1. 绑定真实 Bot 与 Business 账号，记录 `business_connection` 授权范围。
2. 发送客户消息，确认是否收到 `business_message`。
3. 由客服本人在 Business 侧直接回复，确认 bot 是否收到人工本人消息。
4. 验证 AI 路径只能生成草稿，不允许自动代发。
5. 人工确认后测试 `business_connection_id` 发送限制。
6. 验证 feature flag 能关闭入口与 API。
7. 汇总 webhook 样本、权限截图、发送结果、错误码和配置快照。

## 通过条件

- 能保存 Business 连接和客户 Business 消息。
- 能可靠区分人工本人消息，或明确不可行并验证替代机制。
- AI 自动发送路径不存在。
- ADR-B01 对 C-03 / C-04 / C-05 / C-05b 给出明确分支。
- ADR-B01 记录实测账号类型、Bot、环境、授权范围、事件类型、错误码、feature flag 默认值、生产开关策略和用户可见影响。

## 失败分支

- 全部可行：C-03 / C-04 / C-05 保持 P0，启用 Business 草稿模块。
- 部分可行：C-05 降为 P1，启用 C-05b，发布说明写清限制。
- 不可行或到期无结论：Business 模块 feature flag 整体关闭，C-03b 成为 P0。

## 不做什么

- 不开放 Business 自动回复。
- 不实现完整后台 Business UI。
- 不接入非 Telegram 渠道。
- 不用 mock 结论替代真实账号验证。

## 验收映射

- C-03 / C-03b / C-04 / C-05 / C-05b。
- 条件式 Spike 通则 §13。
