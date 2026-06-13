# Render Environment Manifest

> evidence_id: M0-infra-render  
> status: dashboard_ready__blueprint_deferred_until_code_skeleton  
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 0.5-1 个工作日  
> secret_policy: Render env vars 只存 Render/受控密钥管理，不进仓库

## 服务规划

| 服务 | 环境 | 名称 | 区域 | 实例规格 | 启动命令 | 回滚入口 | 状态 |
|---|---|---|---|---|---|---|---|
| api | dev/staging/prod | `uzmax-api` | pending | pending | pending until `apps/api` exists | pending | deferred_to_M0-01 |
| worker | dev/staging/prod | `uzmax-worker` | pending | pending | pending until `apps/worker` exists | pending | deferred_to_M0-01 |
| cron | dev/staging/prod | `uzmax-cron` | pending | pending | pending until `apps/cron` exists | pending | deferred_to_M0-01 |
| Redis | dev/staging/prod | `uzmax-redis` | pending | pending | n/a | pending | deferred_to_M0-01 |

## 平台访问发现

| 检查项 | 结果 |
|---|---|
| Render CLI | not_installed |
| Render connector | 当前未暴露可用 list services 工具 |
| 内置浏览器登录态 | 已登录 `https://dashboard.render.com/` |
| workspace | `muxuk's workspace` |
| 当前判定 | dashboard 可用；不创建空服务，待 M0-01 代码骨架与 `render.yaml` 后用 Blueprint 一次性创建 api/worker/cron/Redis |

## M0/M1 输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| 服务命名策略 | ready | `uzmax-api`、`uzmax-worker`、`uzmax-cron`、`uzmax-redis` |
| 区域与规格 | deferred_to_M0-01 | 按 `render.yaml` 与实际 runtime 确定 |
| Redis 决策 | deferred_to_M0-01 | BullMQ 依赖 Redis；M0-01/Render Blueprint 时创建 |
| 回滚入口 | deferred_to_M1 | M1 前明确 |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Render 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录服务规划与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0/M1 判定输入 | dashboard_ready__service_creation_deferred |
| 实际失败分支 | Render/Redis 缺失不应被 Vercel 长任务替代；如 M0-01 后仍无法创建，改路径必须写 ADR |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted | 已授权登录 Render |
| AI agent | evidence_ready | Render dashboard 登录态和命名策略已记录；未创建会失败的空服务 |
