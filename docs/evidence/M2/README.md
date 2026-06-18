# M2 Evidence

M2 evidence 覆盖 Telegram Bot、Telegram Business spike、对话、接管和工单的里程碑证据。

当前 readiness pack：`M2-channel-conversation-readiness-pack.md`。

当前 closeout/signoff：`M2-channel-conversation-closeout-signoff.md`。M2 channel/conversation queue 当前状态为 `ready_for_owner_acceptance`：只表示里程碑证据已归档并可交给项目 owner 接受，不表示 production、GA-0、真实客户流量、customer LLM、Telegram Business 可行性或 1.0 release signoff。

M2 owner-review follow-up：`M2-07-conversation-ticket-api-http-hardening.md`。该 evidence 只加固 M2-03 conversation/ticket API contract 的 HTTP error mapping 与 API 文件密度拆分；不改变 claim vs lock 语义，不接入真实 DB、WS、worker、admin API client、production traffic、customer LLM、Telegram Business 或 `message.content` customer plaintext paths。

SPK-01 Telegram Business 证据目录：`spikes/SPK-01-telegram-business/`。当前 manifest 为 conservative closure：`no_go_owner_inputs_missing`。该目录只能在真实账号 spike 或 conservative closure spec 中创建，不得提交 raw Telegram payloads、screenshots、客户明文或客服个人账号。

M2 当前状态：`ready_for_owner_acceptance`。M2-00 到 M2-05 与 SPK-01/ADR-B01 已完成里程碑证据归档或保守分支记录；production、真实客户流量、customer LLM、GA-0、Business 自动回复和 Business 可行性仍未放行。SPK-01 当前分支不声明 Telegram Business 不可行或已实测可行，只记录因 owner inputs/evidence 缺失而关闭 Business 模块并启用 C-03b。

M2-05 realtime evidence：`M2-05-realtime-ws-evidence-if-needed.md`。当前 decision 为 `documented_no_ws_branch_for_m2`：M2 不实现生产 WebSocket 或 polling runtime，I-04 在 M2 走 documented degraded/no-WS branch，1.0 production 关闭仍需后续真实 WS 或 polling integration spec 与自动化 latency/freshness/cache evidence。

本目录不得提交真实客户明文、原始截图、语音、Telegram payloads、订单号、电话、地址、支付信息或客服个人账号。敏感原始文件只能放在受控存储中，并在 manifest 中记录脱敏方式、访问权限、保留期限和项目 owner 确认状态。
