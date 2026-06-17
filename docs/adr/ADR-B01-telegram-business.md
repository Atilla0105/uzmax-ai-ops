# ADR-B01 Telegram Business M2 Conservative Closure

> status: accepted
> date: 2026-06-17
> spec: `docs/specs/SPK-01-telegram-business.md`
> decision_type: no_go_owner_inputs_missing
> evidence: `docs/evidence/M2/spikes/SPK-01-telegram-business/manifest.md`
> owner: 项目 owner 提供或授权真实 Telegram Business 账号、Premium、真实 Bot、客服本人账号、客户测试账号与真实测试会话；AI agent 负责核对当前仓库证据、记录缺口、维护 ADR/evidence，不替 owner 编造外部账号或平台结论。
> timebox: M2 内；真实账号缺失时按 SPK-01 失败分支 conservative closure。

## 背景

UZMAX 1.0 原计划首发 Telegram 独立 Bot 与 Telegram Business 草稿模式。PRD v1.1 明确 1.0 不允许 Telegram Business 自动回复，Business 仅生成草稿并必须由人工确认发送。技术架构 v1.1 要求 SPK-01 在 M2 闸门内用真实 Telegram Business 账号验证授权范围、客服本人消息可见性与 `business_connection_id` 代发限制，结论写入本 ADR。

SPK-01 的前置条件包括真实 Telegram Business 账号、Premium、真实 Bot、至少一个客服本人账号、一个客户测试账号，以及可查看 webhook payload、权限错误、后台草稿或临时记录的实测环境。

当前仓库没有这些真实账号与 webhook 实测证据。M2 readiness pack 也已记录 SPK-01 状态为 `pending_real_business_account_or_conservative_closure`。按照验收矩阵 v1.1 条件式 Spike 通则，截止闸门到期仍无结论时必须默认保守，不允许用 mock 或无限挂起发布定义。

## 决策

当前 M2 结论为 `no_go_owner_inputs_missing`：

1. 不声明 Telegram Business 平台不可行，也不声明 Business 草稿模式已实测可行。
2. 在缺少真实 Telegram Business 账号、Premium、真实 Bot、客服本人账号、客户测试账号与 webhook 实测证据的当前 M2 状态下，UZMAX 1.0 不启用 Telegram Business 模块。
3. Business 模块 feature flag 的产品口径为整体关闭：租户层入口不可见，API 不可调用，后台不可发送 Business 草稿或 Business 代发消息。
4. C-03b 成为当前 Business 分支的 P0 验收项；C-03 / C-04 / C-05 不作为当前分支的发布阻断项。
5. C-05b 不启用，因为当前没有“部分可行”的真实账号证据，也没有经实测证明的替代防抢答机制。
6. 已有 Bot ingress 对 `business_connection` / `business_message` 类 update 的 deferred/unsupported classification 不构成 Business 可行性结论。

## 判定分支

| 验收项 | 当前分支 | 判定 |
|---|---|---|
| C-03 | not_current_blocker | 未进入“全部可行”分支；不得声明已能接收或保存 Business connection/message |
| C-03b | P0_current_branch | Business 模块 feature flag 整体关闭；入口、API、后台发送均不得可用 |
| C-04 | not_current_blocker | 未进入“全部/部分可行”分支；不得实现或开放 Business 草稿发送 |
| C-05 | not_current_blocker | 未进入“全部可行”分支；未证明能区分人工本人消息 |
| C-05b | not_enabled | 未进入“部分可行”分支；未来只有真实证据证明需要替代机制时才可启用 |

## 备选方案

| 方案 | 优点 | 风险 | 判定 |
|---|---|---|---|
| 真实账号 spike 后启用 Business 草稿 | 能直接关闭 C-03/C-04/C-05 真实外部依赖风险 | 当前缺少 owner inputs 与真实 webhook evidence；无法在 M2 诚实完成 | rejected for current M2 |
| mock 或本地 payload 替代 | 开发速度快 | 违反 SPK-01 与条件式 Spike 通则；会伪造外部平台能力 | rejected |
| 无限 pending | 不需要改口径 | 发布定义持续被外部输入悬挂，违反验收矩阵默认保守规则 | rejected |
| Conservative closure，Business 默认关闭 | 保留诚实边界，Bot/对话 M2 可继续推进，C-03b 成为明确 P0 | 1.0 当前没有 Business 草稿能力，未来需重开 spike | accepted |

## 验证证据

- 当前 evidence manifest：`docs/evidence/M2/spikes/SPK-01-telegram-business/manifest.md`。
- 仓库检索未发现 ADR-B01、SPK-01 真实账号 manifest、真实 Business webhook 样本、客服本人消息实测、客户测试账号实测、权限错误记录或 Business 草稿发送实测。
- `docs/evidence/M2/M2-channel-conversation-readiness-pack.md` 在 M2 opening 时记录 SPK-01 仍为 M2 blocker，状态为 `pending_real_business_account_or_conservative_closure`。
- Telegram 官方 Business 文档与 Bot API 只作为背景链接：`https://core.telegram.org/api/business`、`https://core.telegram.org/bots/api`。本 ADR 不从官方文档推导 UZMAX 已实测能力。
- 未提交 raw Telegram payloads、screenshots、客户明文、客服个人账号或 token。

## 失败分支

- 若未来 owner 提供真实 Telegram Business 账号、Premium、真实 Bot、客服本人账号、客户测试账号和可脱敏归档的 webhook/权限/错误证据：重新打开 SPK-01 或后续 replacement spec，创建新的 ADR revision 或 superseding ADR，重新判定 C-03/C-04/C-05/C-05b。
- 若实现分支发现 Business 入口、API、后台发送或自动回复路径可见/可调用：当前 C-03b 不通过，必须关闭入口/API/后台发送路径或拆出明确 spec 修复。
- 若有人试图用 mock payload、博客、猜测或未归档截图声称 Business 可行：拒绝合并，回到本 ADR 的 `no_go_owner_inputs_missing` 分支。

## 影响范围

- `docs/adr/ADR-B01-telegram-business.md`
- `docs/evidence/M2/spikes/SPK-01-telegram-business/manifest.md`
- `docs/evidence/M2/README.md`
- 后续连接中心与租户层 Business 入口必须读取本 ADR 的关闭口径，直到新的真实账号 evidence supersede 本 ADR。

## 后续重开条件

重开 Business spike 前必须同时具备：

1. 项目 owner 确认可用于测试的真实 Telegram Business 账号，且具备 Premium。
2. 真实 Bot 与 Business 账号绑定路径。
3. 至少一个客服本人账号与一个客户测试账号。
4. 可查看并脱敏归档的 `business_connection`、`business_message`、权限错误、发送限制或后台草稿证据。
5. 明确的敏感数据处理方式：raw payload、截图、账号标识、客户明文和 token 不进入 repo，只在受控存储中记录访问权限、保留期限和 owner 确认状态。
6. 新 spec/PR 仍保持一 PR 一个 spec，且不得夹带 Business UI、adapter、schema、API 或 feature flag 生产实现，除非触碰模块和验收条件另行批准。
