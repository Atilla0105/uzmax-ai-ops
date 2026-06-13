# M0 Infra Evidence

保存基础设施账号与环境 manifest。敏感 secret 不进入仓库，只记录受控存储位置、权限范围、owner 和签收状态。

## OCM-00A 当前状态

> status: partial_projects_created__blocked_by_supabase_limit_telegram_render_sentry  
> decision: Gate 0 仍为 No-Go；GitHub、Vercel、OpenAI key 已建立，Supabase dev 因免费项目上限未能创建，Telegram/Render/Sentry 仍有安全输入或登录阻塞。  
> local_precheck: 当前目录已初始化为 git repo 并推送 GitHub；仍未发现 `package.json`、CI 配置、Render 配置。

## 2026-06-13 平台发现摘要

| 域 | 发现 | 当前判定 |
|---|---|---|
| GitHub / CI | 私有 repo `Atilla0105/uzmax-ai-ops` 已创建并推送 `main` | repo 已就绪；CI/分支保护待 M0-01 |
| Supabase | `uzmax-dev` 创建成本为 0/monthly，但创建失败：free active project limit 2/2 | 需暂停/删除一个旧 free 项目、升级，或显式改用非干净分支方案 |
| Vercel | 独立 project `uzmax-admin` 已创建，project id `prj_5XhdIOD2zxmDASwimiYCXZICC1F5` | 项目已就绪；待 app 骨架后绑定/部署 |
| OpenAI Platform | `Uzmax` key 已创建到 Personal / Default project，并写入本地 `.env.local`；HTTP 200 验证通过 | key 可用于 dev；真实客户消息仍受 ADR-003 阻断 |
| Render / Sentry | 内置浏览器未登录 Render/Sentry；本机无 Render CLI、无 Sentry CLI；当前工具无 Render/Sentry 直连 | 需项目 owner 登录内置浏览器或提供 API key |
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
