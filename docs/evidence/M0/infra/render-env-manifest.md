# Render Environment Manifest

> evidence_id: M0-infra-render  
> status: blueprint_placeholder_ready__service_creation_pending_owner
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 0.5-1 个工作日  
> secret_policy: Render env vars 只存 Render/受控密钥管理，不进仓库

## 服务规划

| 服务 | 环境 | 名称 | 区域 | 实例规格 | 启动命令 | 回滚入口 | 状态 |
|---|---|---|---|---|---|---|---|
| api | dev/staging/prod | `uzmax-api` | `oregon` | `starter` | `npm --workspace @uzmax/api run start` | Render rollback / redeploy from Blueprint service | blueprint_ready |
| worker | dev/staging/prod | `uzmax-worker` | `oregon` | `starter` | `npm --workspace @uzmax/worker run start` | Render rollback / redeploy from Blueprint service | blueprint_ready |
| cron | dev/staging/prod | `uzmax-cron` | `oregon` | `starter` | `npm --workspace @uzmax/cron run start` | Render rollback / redeploy from Blueprint service | blueprint_ready |
| Redis | dev/staging/prod | `uzmax-redis` | `oregon` | `free` | n/a | Render keyvalue service recovery / recreate from Blueprint | blueprint_ready |

## 平台访问发现

| 检查项 | 结果 |
|---|---|
| Render CLI | not_installed |
| Render connector | 当前未暴露可用 list services 工具 |
| 内置浏览器登录态 | 已登录 `https://dashboard.render.com/` |
| workspace | `muxuk's workspace` |
| 当前判定 | dashboard 可用；root `render.yaml` 已提供 web/worker/cron/keyvalue 占位，auto deploy 关闭；真实服务创建仍需 owner 在 Render 确认 |

## M0/M1 输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| 服务命名策略 | ready | `uzmax-api`、`uzmax-worker`、`uzmax-cron`、`uzmax-redis` |
| 区域与规格 | ready_placeholder | `render.yaml` 当前声明 `oregon` / `starter`，后续可由 owner 在创建前调整 |
| Redis 决策 | ready_placeholder | `render.yaml` 声明 `type: keyvalue` 的 `uzmax-redis`，仅作为 BullMQ 占位 |
| 回滚入口 | ready_placeholder | Render Blueprint 服务创建后使用 dashboard rollback/redeploy；真实演练顺延到有可运行服务后 |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Render 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录服务规划与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0/M1 判定输入 | blueprint_placeholder_ready__service_creation_pending_owner |
| 实际失败分支 | 若 owner 暂不创建 Render 服务，M0-01 只通过代码骨架与 Blueprint 占位；不得把 worker/cron 长任务塞到 Vercel |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted | 已授权登录 Render |
| AI agent | evidence_ready | Render dashboard 登录态、命名策略、root `render.yaml` 占位和未创建真实服务的边界已记录 |
