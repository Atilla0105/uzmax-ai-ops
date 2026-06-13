# Telegram Bot Manifest

> evidence_id: M0-infra-telegram-bot  
> status: test_bot_verified  
> owner: 项目 owner 决策真实账号与 token 风险；AI agent 记录/验证  
> timebox: 0.5 个工作日  
> secret_policy: Bot token 只存受控密钥管理，不进仓库

## Bot 信息

| Bot | 用途 | 归属账号 | token 保管位置 | webhook 域名策略 | 轮换流程 | 状态 |
|---|---|---|---|---|---|---|
| 测试 bot | SPK / staging | `uzmaxAdminBot` / id `8575860511` | `.env.local` key `TELEGRAM_TEST_BOT_TOKEN`，不进仓库 | staging 域名或临时 tunnel，M0-01 后确定 | `docs/runbooks/secret-token-rotation.md` | verified via `getMe` |
| 正式 bot | production | pending | pending | pending | pending | pending |

## 平台访问发现

| 检查项 | 结果 |
|---|---|
| Bot 信息读取 | 已通过 Telegram `getMe` 验证测试 bot；未打印 token |
| 处理原则 | 不要求在聊天中粘贴 token；只记录 bot 名称与受控 secret 存放位置 |
| 当前判定 | 测试 bot 已满足 Gate 0；正式 bot 不阻断 M0，但阻断 M2 关闭 |

## Gate 0 最低输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| 测试 bot | ready | `uzmaxAdminBot` / id `8575860511` |
| token 保管位置 | ready | `.env.local` key `TELEGRAM_TEST_BOT_TOKEN`；不提交 token |
| webhook 域名策略 | planned | staging 域名或临时 tunnel；M0-01 后按部署方案确定 |
| token 轮换流程 | planned | 引用 `docs/runbooks/secret-token-rotation.md` |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Telegram Bot 行、`docs/specs/M0-00-infrastructure-provisioning.md` 和 `docs/runbooks/secret-token-rotation.md` 为准。本文件只记录 bot 信息与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | ready |
| SPK-01 判定输入 | ready_for_spike |
| 实际失败分支 | SPK-01 如验证失败则顺延 Bot/Business spike；正式 bot 缺失不阻断 M0，但阻断 M2 关闭 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted | 已提供测试 bot username 与 token 保管位置 |
| AI agent | evidence_ready | 已验证 `getMe` 返回 HTTP 200；未暴露 token |
