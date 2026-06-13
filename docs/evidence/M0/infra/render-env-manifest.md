# Render Environment Manifest

> evidence_id: M0-infra-render  
> status: tool_access_missing__dashboard_verification_pending  
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 0.5-1 个工作日  
> secret_policy: Render env vars 只存 Render/受控密钥管理，不进仓库

## 服务规划

| 服务 | 环境 | 名称 | 区域 | 实例规格 | 启动命令 | 回滚入口 | 状态 |
|---|---|---|---|---|---|---|---|
| api | dev/staging/prod | pending | pending | pending | pending | pending | pending |
| worker | dev/staging/prod | pending | pending | pending | pending | pending | pending |
| cron | dev/staging/prod | pending | pending | pending | pending | pending | pending |
| Redis | dev/staging/prod | pending | pending | pending | n/a | pending | pending |

## 平台访问发现

| 检查项 | 结果 |
|---|---|
| Render CLI | not_installed |
| Render connector | 当前未暴露可用 list services 工具 |
| 当前判定 | 需通过 dashboard/browser 验证或在 M0-00 写顺延记录 |

## M0/M1 输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| 服务命名策略 | planned | 建议 `uzmax-api`、`uzmax-worker`、`uzmax-cron`、`uzmax-redis` |
| 区域与规格 | waiting_project_owner | 可填计划值或顺延记录 |
| Redis 决策 | waiting_project_owner | BullMQ 依赖 Redis；缺失时队列相关 spec 顺延 |
| 回滚入口 | waiting_project_owner | M1 前需明确 |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Render 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录服务规划与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0/M1 判定输入 | deferred_dashboard_verification_pending |
| 实际失败分支 | Render/Redis 缺失不应被 Vercel 长任务替代；改路径必须写 ADR |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending | 可确认命名策略或顺延 Render 验证 |
| AI agent | evidence_ready | 本机工具/connector 缺口已记录 |
