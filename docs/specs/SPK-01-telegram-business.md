# SPK-01 Telegram Business 真实环境 Spike

## 目标

用真实 Telegram Business 账号验证 Business 草稿模式在 1.0 中的可行边界，并将结论写入 `docs/adr/ADR-B01-telegram-business.md`。本 spec 只做 spike 与分支判定，不实现完整 Business 产品能力。

## Owner

Owner：AI agent 执行真实环境 spike；项目 owner 提供或授权真实账号、测试会话，并确认分支结论。

## 时间盒

拿到真实账号后 1 个工作日；账号或权限准备不足时最多顺延到 2 天并写阻断记录；硬截止不得晚于 M2。

## Spec 类型

spike

## 触碰模块/文件

- `docs/specs/SPK-01-telegram-business.md`
- `docs/adr/ADR-B01-telegram-business.md`
- `docs/adr/README.md`
- `docs/evidence/M2/README.md`
- `docs/evidence/M2/spikes/SPK-01-telegram-business/**`

说明/备注：

- 真实账号可用时，本 spec 可在独立 spike 分支临时使用 Telegram Bot 测试配置、webhook 监听脚本或最小 Business 事件记录 endpoint；临时资产不得进入生产模块，且证据只提交脱敏 manifest。
- 真实账号、Premium、真实 Bot、客服本人账号、客户测试账号或 webhook 实测证据缺失时，本 spec 只允许 docs/ADR/evidence conservative closure，不得新增 Business UI、adapter、schema、API、feature flag 代码、自动回复或草稿发送。
- 未列出的模块默认不可改，尤其不得修改 apps/**、packages/**、DB schema、lockfile、config、generated artifacts、raw Telegram payloads、screenshots、客户明文、客服个人账号或 token。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = spec、ADR、ADR index、M2 evidence README、SPK-01 manifest；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：conservative closure 分支不新增 source；若未来真实账号 spike 需要临时脚本，必须先检索既有 Telegram/Business runtime 并在 PR Hygiene 表说明归属。
- 外部 API/SDK/provider/connector/adapter 依据：Telegram official docs only as background; conservative closure 不声明实测平台行为。
- 是否需要例外：none。

## 文档触发检查

updated

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

- 真实账号 spike 分支：能保存 Business 连接和客户 Business 消息。
- 真实账号 spike 分支：能可靠区分人工本人消息，或明确不可行并验证替代机制。
- 真实账号 spike 分支：AI 自动发送路径不存在。
- 真实账号 spike 分支：ADR-B01 对 C-03 / C-04 / C-05 / C-05b 给出明确分支，并记录实测账号类型、Bot、环境、授权范围、事件类型、错误码、feature flag 默认值、生产开关策略和用户可见影响。
- conservative closure 分支：若真实 Telegram Business 账号、Premium、真实 Bot、客服本人账号、客户测试账号或 webhook 实测证据缺失，ADR-B01 必须记录 `no_go_owner_inputs_missing` 或 `unavailable_no_conclusion`，不得声明平台不可行或已实测可行。
- conservative closure 分支：Business 模块 feature flag 口径为整体关闭，C-03b 成为 P0；C-03/C-04/C-05 不作为当前阻断；未来重开必须重新提供真实账号、授权范围、webhook 样本、权限/错误证据与 owner 确认。
- conservative closure 分支：M2 evidence manifest 只能记录脱敏索引、检索范围、缺失项、分支判定、验证命令和未来重开条件，不提交 raw Telegram payloads、screenshots、客户明文、客服个人账号或 token。

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
