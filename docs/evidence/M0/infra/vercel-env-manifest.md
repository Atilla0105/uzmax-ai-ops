# Vercel Admin Environment Manifest

> evidence_id: M0-infra-vercel  
> status: platform_discovery_recorded__project_not_created  
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 0.5 个工作日  
> secret_policy: Vercel env vars 只存 Vercel/受控密钥管理，不进仓库

## 项目信息

| 项目 | 值 |
|---|---|
| Vercel team | `muxukk222-7795's projects` / `team_HNqH4hBWA2Nr40SVU1uKE4XZ` |
| Vercel project | 未发现 UZMAX 项目；候选命名 `uzmax-admin` |
| preview 策略 | pending |
| production 策略 | pending |
| 访问保护 | pending |
| API base URL env 命名 | `VITE_API_BASE_URL` 计划值，M0-01 后复核 |
| 最小 Vite app 部署状态 | pending |

## Vercel 只读发现

| 项目 | project id | created_at UTC | 判定 |
|---|---|---|---|
| `zapchatnweui` | `prj_YMOVPUERJqxD0IO18D9X6BpMrb1F` | 2026-04-14T09:06:07Z | 既有项目，不复用 |
| `zapchastchi-admin` | `prj_LwJbrM2TXEAPaEjuDmrXftmSVLDD` | 2026-05-08T16:23:53Z | 既有后台项目，不复用 |
| `tarjiman` | `prj_j9wQpWdvG0R7YloUfePZbCZZvUba` | 2026-03-24T07:41:02Z | 既有项目，不复用 |

## M0/M1 输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| Vercel project | blocked_pending_project_creation | 需在正式 repo/app 骨架后新建或绑定 `uzmax-admin` |
| preview/prod 策略 | waiting_project_owner | M1 前应明确 preview 访问保护 |
| env 命名 | planned | 初始计划 `VITE_API_BASE_URL`；M0-01 后按实际 app 复核 |
| 最小 app 部署 | waiting_project_owner | M0-01 后验证，不在 OCM-00A 强行通过 |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Vercel 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录项目信息与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | deferred_not_blocking_if_named |
| 实际失败分支 | Vercel 不可用则改静态托管路径并写 ADR；后台不可无 preview 环境 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending | 需确认是否使用 `uzmax-admin` 命名 |
| AI agent | evidence_ready | Vercel team 与现有项目扫描已记录 |
