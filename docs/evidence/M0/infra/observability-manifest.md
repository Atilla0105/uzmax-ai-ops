# Observability Manifest

> evidence_id: M0-infra-observability  
> status: sentry_project_ready  
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 0.5 个工作日  
> secret_policy: DSN、webhook、alert token 不进仓库

## 工具与告警

| 项目 | 值 |
|---|---|
| Sentry project / 等价工具 | `uzmax-platform`，org `uzmax`，platform `Nest.js` |
| 日志平台 | Render logs + application structured logs 计划值；M1 前复核 |
| traceId 规则 | `x-request-id` / `trace_id` 计划值 |
| 告警渠道 | pending |
| 告警 owner 映射 | 单 owner：项目 owner；AI agent 产诊断证据 |
| 环境名规范 | `dev` / `staging` / `prod` |

## 平台访问发现

| 检查项 | 结果 |
|---|---|
| Sentry CLI | not_installed |
| Sentry connector | 当前未暴露 |
| 内置浏览器登录态 | 已登录 `https://uzmax.sentry.io/` |
| project URL | `https://uzmax.sentry.io/projects/uzmax-platform/` |
| 当前判定 | Sentry 初始项目已创建；DSN 不写入文档，代码接入时通过 env 管理 |

## M0/M1 输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| Sentry project / 等价工具 | ready | `uzmax-platform` |
| 日志与 traceId 规则 | planned | M0-01 可先建立命名约定 |
| 告警渠道 | waiting_project_owner | 可先写手动告警渠道 |
| 环境名规范 | planned | `dev` / `staging` / `prod` |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Sentry/日志/告警行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录工具、告警与签收状态。

| 项目 | 状态/记录 |
|---|---|
| M0 判定输入 | ready_for_M0 |
| 实际失败分支 | M0 可记录为 P1，但 GA-0 前必须闭合 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted | 已授权登录 Sentry |
| AI agent | evidence_ready | Sentry project 已创建；未提交 DSN/secret |
