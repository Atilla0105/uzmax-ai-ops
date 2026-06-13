# Observability Manifest

> evidence_id: M0-infra-observability  
> status: tool_access_missing__observability_choice_pending  
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 0.5 个工作日  
> secret_policy: DSN、webhook、alert token 不进仓库

## 工具与告警

| 项目 | 值 |
|---|---|
| Sentry project / 等价工具 | pending |
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
| 当前判定 | 可先采用日志/traceId 规范；GA-0 前必须补齐错误监控与告警 |

## M0/M1 输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| Sentry project / 等价工具 | deferred_not_Gate0_blocker | 可先写等价工具或顺延记录 |
| 日志与 traceId 规则 | planned | M0-01 可先建立命名约定 |
| 告警渠道 | waiting_project_owner | 可先写手动告警渠道 |
| 环境名规范 | planned | `dev` / `staging` / `prod` |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Sentry/日志/告警行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录工具、告警与签收状态。

| 项目 | 状态/记录 |
|---|---|
| M0 判定输入 | deferred_not_Gate0_blocker |
| 实际失败分支 | M0 可记录为 P1，但 GA-0 前必须闭合 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending | 需确认 Sentry 或等价工具、告警渠道 |
| AI agent | evidence_ready | 工具缺口和最小 trace/log 规范已记录 |
