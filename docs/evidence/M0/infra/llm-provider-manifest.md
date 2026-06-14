# LLM Provider Manifest

> evidence_id: M0-infra-llm-provider
> status: key_created__policy_evidence_collected__dev_only_accepted
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
| 当前限制 | ADR-003 当前为 `accepted_dev_only__customer_llm_blocked`；真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM |

## Gate 0 最低输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| primary provider | accepted_for_dev_only | OpenAI key 已创建并本地验证；正式客户流量仍被 ADR-003 dev-only 分支阻断 |
| retention / zero-retention | evidence_collected__dev_only_selected | 标准 abuse monitoring 最多 30 天；ZDR/MAM 未获批准证据；owner 选择不发送真实客户内容 |
| 区域与日志策略 | evidence_collected__dev_only_selected | Default project 区域未配置；OpenAI audit logs 是 admin/config metadata，不是客户 request/response trace；区域控制不阻断 M1 平台骨架 |
| 成本限额与 fallback | dev_only_fallback_disabled | 成本护栏未确认；fallback 保持 disabled；不得用 fallback 放宽 dev-only 限制 |

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
| ADR-003 判定输入 | accepted_dev_only__customer_llm_blocked |
| 实际失败分支 | 真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM；后续若要改为客户 LLM，必须另走 ADR 更新、redaction/trace 实装与 owner signoff |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted_dev_only_customer_llm_blocked | 已确认 key 保存到 `.env.local`；已选择 dev-only 分支，不接受当前阶段真实客户数据进入第三方 LLM |
| AI agent | policy_evidence_ready | OpenAI key 创建、写入和 HTTP 200 验证已记录；官方政策证据已记录；未暴露 secret |
