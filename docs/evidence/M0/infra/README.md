# M0 Infra Evidence

保存基础设施账号与环境 manifest。敏感 secret 不进入仓库，只记录受控存储位置、权限范围、owner 和签收状态。

## OCM-00A 当前状态

> status: platform_discovery_recorded__blocked_by_clean_env_selection  
> decision: Gate 0 仍为 No-Go；已授权平台完成只读发现，但尚无干净 UZMAX dev 基础设施可签收。  
> local_precheck: 当前目录不是正式 git repo，未发现 `package.json`、CI 配置、Render/Vercel 配置。

## 2026-06-13 平台发现摘要

| 域 | 发现 | 当前判定 |
|---|---|---|
| GitHub / CI | `gh` 已登录 `Atilla0105`；当前目录不是 git repo；账号下未发现 UZMAX repo | 需创建正式 repo/CI，Gate 0 前不得假装已就绪 |
| Supabase | 仅发现 `Atilla0105's Project` 与 `Zapchastchi` 两个既有项目，均非干净 UZMAX dev，且 public 表存在 RLS disabled 安全红灯 | 推荐新建 `uzmax-dev`；创建项目前需成本/区域确认 |
| Vercel | 团队存在；项目仅有 `zapchatnweui`、`zapchastchi-admin`、`tarjiman` | 需后续新建/绑定 UZMAX admin 项目 |
| OpenAI Platform | 可用目标为 Personal / Default project | 只记录目标；API key 落地需单独确认本地/平台 secret 位置 |
| Render / Sentry | 本机无 Render CLI、无 Sentry CLI；当前工具无 Render/Sentry 直连 | 需 dashboard 验证或顺延 |
| Telegram | 当前无可自动读取 bot/token 的安全通道 | 测试 bot 名称与 token 保管位置仍待补 |

## Gate 0 最低输入

| 域 | 必填输入 | 证据文件 |
|---|---|---|
| Git/CI | Git 托管平台、仓库名或仓库 URL、默认分支、CI 平台/runner、分支保护策略 | `git-ci-manifest.md` |
| Supabase dev | dev 项目名/ref、区域、连接池模式、Auth/Storage/RLS 可用性、secret 存放位置 | `supabase-env-manifest.md` |
| LLM provider | primary provider、key 存放位置、retention/zero-retention 与区域策略、限额、fallback 决策；无法确认时写明“真实客户消息不得进入 LLM” | `llm-provider-manifest.md` |
| Telegram 测试 bot | 测试 bot 名称/用途、token 存放位置、webhook 域名策略；缺失时写明顺延 SPK-01 | `telegram-bot-manifest.md` |

Render、Vercel、观测工具可以先填命名策略或顺延记录；但不得把 worker/cron 长任务塞到 Vercel，也不得把 secret 写入仓库。

## Manifests

- `git-ci-manifest.md`
- `supabase-env-manifest.md`
- `render-env-manifest.md`
- `vercel-env-manifest.md`
- `observability-manifest.md`
- `llm-provider-manifest.md`
- `telegram-bot-manifest.md`
