# M0 Infra Evidence

保存基础设施账号与环境 manifest。敏感 secret 不进入仓库，只记录受控存储位置、权限范围、owner 和签收状态。

## OCM-00A 当前状态

> status: gate0_minimum_ready__m0_governance_ready__spk03_next
> decision: Gate 0 最低基础设施已满足；GitHub、Supabase dev、Vercel、OpenAI key、Telegram 测试 bot、Sentry project 已建立或验证，Render dashboard 已登录，M0-01 已补 root package/CI/Render Blueprint 占位。M0-01、M0-02 cleanup、M0-05 PR1/PR2 已合入。
> local_precheck: 当前目录已初始化为 git repo 并推送 GitHub；`package.json`、`.github/workflows/ci.yml`、PR 模板、workspace 骨架和 `render.yaml` 已由 M0-01 建立。2026-06-14 本地 `npm run check` 通过，真实 Render/Vercel 部署仍待 owner 确认。

## 2026-06-13 平台发现摘要

| 域 | 发现 | 当前判定 |
|---|---|---|
| GitHub / CI | 私有 repo `Atilla0105/uzmax-ai-ops` 已创建并推送 `main`，M0-01 已补 GitHub Actions、PR 模板与 active main ruleset；PR #1-#4 已合入且 CI 通过 | repo/CI/ruleset 已就绪；M0 剩余真实环境 spike 仍需一 PR 一 spec |
| Supabase | `uzmax-dev` / `enyocaykcgcfcswycujg` 已创建，`ap-south-1`，`ACTIVE_HEALTHY`，public 表 0，security advisor 0 | dev 可用于 SPK-03/SPK-04 |
| Vercel | 独立 project `uzmax-admin` 已创建，project id `prj_5XhdIOD2zxmDASwimiYCXZICC1F5` | 项目已就绪；待 app 骨架后绑定/部署 |
| OpenAI Platform | `Uzmax` key 已创建到 Personal / Default project，并写入本地 `.env.local`；HTTP 200 验证通过 | key 可用于 dev；真实客户消息仍受 ADR-003 阻断 |
| Render | dashboard 已登录 `muxuk's workspace`；命名策略 `uzmax-api/worker/cron/redis`；root `render.yaml` 已有 Blueprint 占位 | 服务创建仍需 owner 在 Render 确认 |
| Sentry | org `uzmax` 下已创建 project `uzmax-platform`，platform `Nest.js` | M0 可用；DSN 不进文档 |
| Telegram | 测试 bot `uzmaxAdminBot` / id `8575860511` 已通过 `getMe` 验证；token 位于 `.env.local` | SPK-01 可用 |

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
