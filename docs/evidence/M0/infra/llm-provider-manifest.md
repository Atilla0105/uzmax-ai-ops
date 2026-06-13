# LLM Provider Manifest

> evidence_id: M0-infra-llm-provider  
> status: key_created__data_policy_pending  
> owner: 项目 owner 决策真实客户数据与成本风险；AI agent 记录/验证  
> timebox: 0.5 个工作日  
> secret_policy: API key 只存受控密钥管理，不进仓库

## Provider 信息

| Provider | 用途 | key 归属 | retention / zero-retention | 区域 | 限额 | fallback | 状态 |
|---|---|---|---|---|---|---|---|
| primary | OpenAI | Personal / Default project；key `Uzmax` 已创建并写入本地 `.env.local` | pending ADR-003 | pending | pending | pending | key_ready__blocked_pending_ADR |
| fallback | pending | pending | pending | pending | pending | pending | pending |

## OpenAI Platform 记录

| 项目 | 值 |
|---|---|
| organization | `Personal` / `org-UGCZVRsubhGsWxlBVCSPtEYZ` |
| project | `Default project` / `proj_mGSbWDOFTiYhCvroygtUSw2X` |
| API key | `Uzmax` 已创建；密钥未显示，已写入被 git 忽略的 `.env.local` |
| 本地变量 | `OPENAI_API_KEY` |
| 本地验证 | OpenAI `/v1/models` 返回 HTTP 200 |
| 当前限制 | ADR-003 未闭合前，真实客户消息不得进入第三方 LLM |

## Gate 0 最低输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| primary provider | ready_for_dev | OpenAI key 已创建并本地验证；正式启用仍需 ADR-003 |
| retention / zero-retention | waiting_project_owner | ADR-003 前必须有证据或明确禁用真实客户消息 |
| 区域与日志策略 | waiting_project_owner | 需记录 provider 区域和日志/trace 留存策略 |
| 成本限额与 fallback | waiting_project_owner | 需确认限额、fallback 或暂不启用 fallback |

## ADR-003 前置

- provider retention / zero-retention 证据链接。
- 区域与日志策略证据链接。
- key 保管位置。
- 限额与成本护栏初始值。

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 LLM provider keys 行、`docs/specs/M0-00-infrastructure-provisioning.md` 和 `docs/adr/ADR-003-llm-data-processing.md` 为准。本文件只记录 provider 证据与签收状态。

| 项目 | 状态/记录 |
|---|---|
| ADR-003 判定输入 | blocked_pending_data_processing_decision |
| 实际失败分支 | 数据处理策略未确认前，真实客户消息不得进入第三方 LLM |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted_key_storage | 当前对话文字确认保存到 `.env.local` |
| AI agent | evidence_ready | OpenAI key 创建、写入和 HTTP 200 验证已记录；未暴露 secret |
