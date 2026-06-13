# Telegram Bot Manifest

> evidence_id: M0-infra-telegram-bot  
> status: token_channel_pending  
> owner: 项目 owner 决策真实账号与 token 风险；AI agent 记录/验证  
> timebox: 0.5 个工作日  
> secret_policy: Bot token 只存受控密钥管理，不进仓库

## Bot 信息

| Bot | 用途 | 归属账号 | token 保管位置 | webhook 域名策略 | 轮换流程 | 状态 |
|---|---|---|---|---|---|---|
| 测试 bot | SPK / staging | pending | pending | pending | pending | pending |
| 正式 bot | production | pending | pending | pending | pending | pending |

## 平台访问发现

| 检查项 | 结果 |
|---|---|
| Bot 信息读取 | 当前没有可安全自动读取 Telegram BotFather token 的 connector |
| 处理原则 | 不要求在聊天中粘贴 token；只记录 bot 名称与受控 secret 存放位置 |
| 当前判定 | 测试 bot 缺失则 SPK-01 顺延；正式 bot 不阻断 M0 |

## Gate 0 最低输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| 测试 bot | waiting_project_owner | 需要测试 bot 名称/归属，或明确顺延 SPK-01 |
| token 保管位置 | waiting_project_owner | 只记录受控位置，不提交 token |
| webhook 域名策略 | waiting_project_owner | 可先写临时 tunnel、staging 域名或顺延 |
| token 轮换流程 | waiting_project_owner | 可引用 `docs/runbooks/secret-token-rotation.md` |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Telegram Bot 行、`docs/specs/M0-00-infrastructure-provisioning.md` 和 `docs/runbooks/secret-token-rotation.md` 为准。本文件只记录 bot 信息与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | blocked_pending_test_bot_or_explicit_deferral |
| SPK-01 判定输入 | blocked_pending_test_bot_or_explicit_deferral |
| 实际失败分支 | 测试 bot 缺失则顺延 SPK-01；正式 bot 缺失不阻断 M0，但阻断 M2 关闭 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending | 需确认测试 bot 名称与 token 受控存放位置，或确认 SPK-01 顺延 |
| AI agent | evidence_ready | 已标出 Gate 0 最低输入与 token 安全处理原则 |
