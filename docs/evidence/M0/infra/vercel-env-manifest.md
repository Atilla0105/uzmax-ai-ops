# Vercel Admin Environment Manifest

> evidence_id: M0-infra-vercel  
> status: project_created__deployment_pending  
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 0.5 个工作日  
> secret_policy: Vercel env vars 只存 Vercel/受控密钥管理，不进仓库

## 项目信息

| 项目 | 值 |
|---|---|
| Vercel team | `muxukk222-7795's projects` / `team_HNqH4hBWA2Nr40SVU1uKE4XZ` |
| Vercel project | `uzmax-admin` |
| Vercel project id | `prj_5XhdIOD2zxmDASwimiYCXZICC1F5` |
| created_at | 2026-06-13T09:34:19Z |
| preview 策略 | pending |
| production 策略 | pending |
| 访问保护 | `ssoProtection: all_except_custom_domains`（Vercel 默认/当前返回值） |
| API base URL env 命名 | `VITE_API_BASE_URL` 计划值，M0-01 后复核 |
| 最小 Vite app 部署状态 | pending |

## Vercel 只读发现

| 项目 | project id | created_at UTC | 判定 |
|---|---|---|---|
| `zapchatnweui` | `prj_YMOVPUERJqxD0IO18D9X6BpMrb1F` | 2026-04-14T09:06:07Z | 既有项目，不复用 |
| `zapchastchi-admin` | `prj_LwJbrM2TXEAPaEjuDmrXftmSVLDD` | 2026-05-08T16:23:53Z | 既有后台项目，不复用 |
| `tarjiman` | `prj_j9wQpWdvG0R7YloUfePZbCZZvUba` | 2026-03-24T07:41:02Z | 既有项目，不复用 |
| `uzmax-admin` | `prj_5XhdIOD2zxmDASwimiYCXZICC1F5` | 2026-06-13T09:34:19Z | 本次创建，待 app 骨架后部署 |

## M0/M1 输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| Vercel project | ready | `uzmax-admin` 已创建 |
| preview/prod 策略 | waiting_project_owner | M1 前应明确 preview 访问保护 |
| env 命名 | planned | 初始计划 `VITE_API_BASE_URL`；M0-01 后按实际 app 复核 |
| 最小 app 部署 | waiting_project_owner | M0-01 后验证，不在 OCM-00A 强行通过 |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Vercel 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录项目信息与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | project_ready__deployment_deferred |
| 实际失败分支 | Vercel 不可用则改静态托管路径并写 ADR；后台不可无 preview 环境 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted | 当前对话授权创建独立项目 |
| AI agent | evidence_ready | Vercel project 已创建并通过 API 复核 |
