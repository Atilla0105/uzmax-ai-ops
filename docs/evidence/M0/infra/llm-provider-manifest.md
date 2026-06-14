# LLM Provider Manifest

> evidence_id: M0-infra-llm-provider
> status: key_created__policy_evidence_collected__blocked_pending_owner_signoff
> owner: 项目 owner 决策真实客户数据、区域、留存与成本风险；AI agent 记录/验证
> timebox: 0.5 个工作日
> secret_policy: API key 只存受控密钥管理，不进仓库

## Provider 信息

| Provider | 用途 | key 归属 | retention / zero-retention | 区域 | 限额 | fallback | 状态 |
|---|---|---|---|---|---|---|---|
| primary | OpenAI | Personal / Default project；key `Uzmax` 已创建并写入本地 `.env.local` | 标准 API policy 证据已记录：API endpoint training = No；standard abuse monitoring 最多 30 天；ZDR/MAM 需 OpenAI 批准，当前未见批准证据 | Default project 区域未配置；data residency 需 project 配置，非美国区域需 MAM/ZDR 与 ZDR amendment | pending owner 成本护栏 | fallback disabled until equal-or-stronger evidence exists | dev_only__blocked_for_customer_content |
| fallback | none | none | 无证据 | 无证据 | none | disabled | disabled |

## OpenAI Platform 记录

| 项目 | 值 |
|---|---|
| organization | `Personal` / `org-UGCZVRsubhGsWxlBVCSPtEYZ` |
| project | `Default project` / `proj_mGSbWDOFTiYhCvroygtUSw2X` |
| API key | `Uzmax` 已创建；密钥未显示，已写入被 git 忽略的 `.env.local` |
| 本地变量 | `OPENAI_API_KEY` |
| 本地验证 | OpenAI `/v1/models` 返回 HTTP 200 |
| 当前限制 | ADR-003 当前为 `proposed__blocked_for_real_customer_traffic`；真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM |

## Gate 0 最低输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| primary provider | ready_for_dev_only | OpenAI key 已创建并本地验证；正式客户流量仍被 ADR-003 阻断 |
| retention / zero-retention | evidence_collected__waiting_project_owner | 标准 abuse monitoring 最多 30 天；ZDR/MAM 未获批准证据；owner 未签收真实客户数据风险 |
| 区域与日志策略 | evidence_collected__waiting_project_owner | Default project 区域未配置；OpenAI audit logs 是 admin/config metadata，不是客户 request/response trace |
| 成本限额与 fallback | waiting_project_owner | 成本护栏未确认；fallback 保持 disabled |

## ADR-003 前置

- provider retention / zero-retention 证据链接。
- 区域与日志策略证据链接。
- key 保管位置。
- 限额与成本护栏初始值。

## 官方政策证据

- OpenAI API data controls: https://developers.openai.com/api/docs/guides/your-data
- OpenAI API inputs/outputs data sharing defaults: https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai
- OpenAI API Platform admin/audit logs: https://help.openai.com/en/articles/9687866-admin-and-audit-logs-api-for-the-api-platform
- UZMAX M0-04 review report: `docs/evidence/M0/llm-data-processing/openai-policy-review.md`

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 LLM provider keys 行、`docs/specs/M0-00-infrastructure-provisioning.md` 和 `docs/adr/ADR-003-llm-data-processing.md` 为准。本文件只记录 provider 证据与签收状态。

| 项目 | 状态/记录 |
|---|---|
| ADR-003 判定输入 | policy_evidence_collected__owner_signoff_pending |
| 实际失败分支 | 数据处理策略、redaction、trace 和 owner signoff 完成前，真实客户消息不得进入第三方 LLM |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted_key_storage__data_policy_pending | 当前只确认 key 保存到 `.env.local`；未确认真实客户数据、区域、留存、成本或 fallback 风险 |
| AI agent | policy_evidence_ready | OpenAI key 创建、写入和 HTTP 200 验证已记录；官方政策证据已记录；未暴露 secret |
