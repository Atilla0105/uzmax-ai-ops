# ADR-003 LLM 数据处理策略

> 状态：accepted_dev_only__customer_llm_blocked
> 日期：2026-06-14
> 关联 spec：`docs/specs/M0-04-llm-data-processing-adr.md`
> 关联验收：F-05 / G-02 / G-03 / GA-0
> Owner：项目 owner 确认真实客户数据、合规、区域与成本风险；AI agent 起草、验证和产证据
> 时间盒：1 个工作日

## 背景

离线样本脱敏只能约束训练/评测输入，不能自动约束生产实时客户消息。UZMAX 1.0 的 `intent_classify`、`kb_answer`、`draft_reply`、`vision_diag`、`speech_postprocess`、`distill_daily` 和 `eval_judge` 会触碰客户消息、截图、语音转写、知识候选或评测样本，因此必须先定义第三方 LLM 的数据处理边界。

v1.1 正式文档同时给出以下硬约束：

- PRD：LLM 不做报价、SLA、成本、订单状态等数值判断；客户数据删除必须匿名化；无人确认的知识库自动写入不进入 1.0。
- 技术架构：客户或 Business 草稿调用必须由 context assembler 统一组装、按段硬截断，并在 `llm_call_log` 或 trace 中记录截断事件；面向客户或草稿的任务不能读取 internal 配置字段。
- 验收矩阵：F-05 阻断内部阈值/成本/利润进入 prompt 或输出；G-02 要求逐调用模型、tokens、成本、延迟可追溯；G-03 要求 prompt/知识/模型路由变更进入评测 gate；GA-0 在真实流量前必须全部条件满足。

## 当前 provider 证据

当前唯一已准备的 provider 是 OpenAI，项目 key 已创建并保存在被 git 忽略的本地 `.env.local`。本 ADR 只记录公开政策与项目证据，不暴露 secret。

| 项目 | OpenAI 官方证据 | UZMAX 当前判定 |
|---|---|---|
| 训练使用 | OpenAI API 数据控制表显示 `/v1/chat/completions`、`/v1/responses`、audio、embeddings、moderations 等 API 端点的 `Data used for training` 为 `No`；API inputs/outputs sharing 默认关闭，需组织 owner 主动 opt in。 | 可作为 dev/test provider；必须保持数据共享关闭。 |
| abuse monitoring 留存 | 标准 abuse monitoring logs 可能包含 prompts/responses 与派生 metadata，默认最多保留 30 天；Modified Abuse Monitoring 和 Zero Data Retention 需要 OpenAI 预先批准。 | 未见 MAM/ZDR 批准证据；真实客户明文不得进入 provider。 |
| application state | `/v1/chat/completions` 与 `/v1/responses` 在表中列为 ZDR eligible；`/v1/responses` 默认或 `store=true` 时有 30 天 application state；ZDR 下 `store` 对 chat/responses 总按 `false` 处理。 | 后续实现必须显式 `store=false`，禁用会持久化状态的端点/工具，且不能把 `store=false` 等同于 ZDR。 |
| 图像/文件输入 | 图像和文件输入会进行 CSAM 扫描；若命中潜在 CSAM，即使启用 ZDR/MAM 也可能保留用于人工审核。 | `vision_diag` 真实截图必须先裁剪/脱敏，并由 owner 接受该例外后才能进生产。 |
| 区域 | Data residency 是按 project 配置的能力；非美国区域需要 abuse monitoring controls 批准并执行 ZDR amendment；支持区域的存储不必然等于处理也在区域内。 | 当前 Personal / Default project 没有区域配置证据；若 owner 要求区域约束，真实流量顺延。 |
| provider audit logs | OpenAI API Platform audit logs 是组织配置/管理事件，不是 API 请求响应内容；ZDR 不改变 audit log 可用性、留存行为或事件内容。 | UZMAX 不能依赖 provider audit log 保存客户 trace；必须自建脱敏 `llm_call_log`。 |

证据记录见 `docs/evidence/M0/llm-data-processing/openai-policy-review.md` 与 `docs/evidence/M0/infra/llm-provider-manifest.md`。

## 决策

M0-04 的签收结论是：**项目 owner 选择 `dev_only` 分支。ADR 规则可作为后续实现约束；OpenAI 仅允许用于合成数据、脱敏开发样本、公开知识和非客户明文任务。真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM。**

本结论允许继续 OCM-04 / M1 平台骨架准备，但不放行 M3 AI 能力生产使用、GA-0 真实客户 LLM 流量或任何客户明文进入第三方 provider。若后续要改变此结论，必须另走 ADR 更新并由项目 owner 在 `accepted_zdr_or_mam`、`accepted_standard_retention` 或 `provider_rejected` 分支中重新签收。

默认策略如下：

- fallback provider 默认关闭；provider 全挂或 OpenAI 不满足策略时，系统只能转人工、留单或关闭对应 AI 能力，不得切到更宽松 provider。
- OpenAI 仅允许用于合成数据、脱敏开发样本、公开知识和非客户明文任务；真实客户内容必须等后续 ADR 分支更新、redaction 实装与 owner signoff。
- 后续实现必须优先使用无持久会话状态的端点；请求必须显式 `store=false`；禁止把 Assistants/Threads/Vector Stores/Files、web search、remote MCP、hosted shell 或 code interpreter 用于客户明文，除非另有 ADR/spec 证明其留存与数据流。
- API 输入/输出共享、eval/fine-tuning 数据共享、反馈共享必须保持 disabled；任何启用都必须另走 owner approval 和 ADR。
- 所有 prompt 只携带完成任务所需的最小数据；内部成本、利润、供应商条件、模型密钥、系统配置、红线阈值、SLA 计算参数、订单状态判断依据永不进入 prompt。
- `distill_daily` 和评测候选只能读取租户可见数据，经 redaction 后生成候选；候选进入正式知识库、客户档案或评测集前必须走确认队列。

## 数据分类与 redaction

| 数据类别 | LLM 输入策略 | trace/log 策略 |
|---|---|---|
| 客户普通问题文本 | 先做 PII/internal redaction，再按任务最小片段发送。 | 保存 redacted hash、长度、语言、任务和 redaction 事件；不保存原文。 |
| 电话、邮箱、地址、Telegram username/user id、头像、真实姓名 | 默认替换为类型 token 与 tenant-scoped HMAC/hash；任务无法用 token 完成时转人工。 | 只保存类型、数量、hash 前缀和 redaction 版本。 |
| 订单号、批次号、物流号、外部 ID、支付流水 | LLM 不看原值；由 `order-read` 或报价/订单代码处理并返回结构化摘要。 | 原值只进入业务表/connector 审计；LLM trace 只保存 hash 和来源类型。 |
| 金额、成本、利润、供应商价、红线阈值、SLA 参数 | 禁止进入 LLM。报价、SLA、成本、订单状态由代码和数据判断。 | 如发生拦截，记录 policy violation 类型与 traceId。 |
| 截图/图片 | 真实截图在生产前必须先裁剪、模糊或 OCR redaction；无法脱敏时转人工。 | 不保存原图到 LLM trace；保存 storage ref、redaction event 和诊断结果。 |
| 语音与转写 | 原语音只由 speech pipeline 处理；进入 LLM 的只能是 redacted transcription 或摘要。 | 不保存原语音/原始转写到 LLM trace；保存 storage ref、转写置信度和 redaction 事件。 |
| 知识条目、教程阶段、话术 | 只放命中片段和必要阶段；不放整库或未发布候选。 | 保存 kb entry id/version/hash，不保存整段 prompt。 |
| 客户档案 L3、会话摘要 L2、近期原文 L1 | L3/L2 优先结构化摘要；L1 只放最近必要片段且硬截断。 | 保存 segment 类型、token 估算、截断事件和 hash。 |

## 任务级策略

| 任务 | 可进入 LLM 的数据 | 禁止进入 LLM 的数据 | 生产状态 |
|---|---|---|---|
| `intent_classify` | redacted 当前消息、渠道、语言、少量上下文标签。 | 客户身份原文、订单原值、内部配置、历史全文。 | 待 redaction 实装与 owner signoff。 |
| `kb_answer` | redacted 当前问题、命中 KB/教程片段、L2/L3 摘要、代码提供的结构化事实。 | 整库、未发布候选、价格/成本/利润/订单状态计算依据。 | 待 redaction、eval gate、trace 实装。 |
| `draft_reply` | 同 `kb_answer`，输出只写 Business 草稿或 Bot 回复候选。 | 自动发送 Business 回复路径、内部配置字段、未确认知识。 | Business 仅草稿；生产待 SPK-01 与本 ADR 签收。 |
| `vision_diag` | redacted/cropped screenshot、OCR 后 redacted 文本、任务说明。 | 未脱敏原图、支付信息、地址、订单原值、头像。 | 真实截图 blocked，直到截图 redactor 与 owner 例外签收。 |
| `speech_postprocess` | redacted transcription、语言/文字系统、置信度。 | 原语音、原始未脱敏转写、客户身份原文。 | 真实语音 blocked，直到转写 redaction 与 trace 实装。 |
| `distill_daily` | 租户可见的 redacted 对话摘要、负反馈、人工改写摘要。 | 正式库自动写入、跨租户数据、原始全文批量外发。 | 候选生成可设计；真实生产候选待 GA-0 后确认队列。 |
| `eval_judge` | redacted eval case、模型输出、评分 rubric。 | 未脱敏真实样本、生产明文日志、输入/输出共享 opt-in。 | 仅脱敏样本；真实样本需 owner 确认入集。 |

`summarize`、`profile_update` 和后续新增 LLM task 必须继承同一最小化/redaction/trace/fallback 策略，并在任务路由表中显式声明数据等级。

## Trace 与日志

`llm_call_log` 和 trace 只能保存以下内容：

- `traceId`、`org_id`、`tenant_id`、task、provider、model、route version、prompt template/version。
- request/response token、成本、延迟、timeout、retry、fallback decision、error category。
- context segment 类型、redacted hash、长度、token 估算、截断事件。
- redaction policy version、redaction event 类型/数量、hash 前缀。
- safety/redline/eval gate 结果、handoff/fallback 动作。

禁止保存 raw prompt、raw completion、未脱敏截图、未脱敏语音转写、API key、内部配置字段、客户身份明文。需要排查质量时，只能通过 traceId 找到授权业务对象，并由权限/RLS 控制读取；LLM trace 自身不得成为明文副本。

## 判定分支

| 分支 | 判定条件 | 采用动作 | 验收影响 |
|---|---|---|---|
| `accepted_zdr_or_mam` | OpenAI 项目已批准 ZDR/MAM；区域要求已签收；redaction/trace 已实现并测试通过；owner 签收真实客户数据风险。 | 按任务级策略启用生产 LLM。 | GA-0 可继续推进。 |
| `accepted_standard_retention` | owner 明确接受标准 abuse monitoring 最多 30 天留存风险；redaction/trace 已实现并测试通过；数据共享保持 disabled。 | 仅允许 redacted 客户内容进入指定任务。 | GA-0 可继续推进但风险记录保留。 |
| `dev_only` | owner 明确选择先不让真实客户内容进入第三方 LLM；当前只有 API key 与公开政策证据，没有 ZDR/MAM、标准留存接受或 redaction 实装。 | 仅允许合成/脱敏开发样本、公开知识和非客户明文任务；M1 只继续平台骨架准备。 | accepted current path；真实流量不开闸，GA-0 客户 LLM 继续阻断。 |
| `provider_rejected` | 留存、区域、日志或成本不被 owner 接受。 | 关闭该 provider；转人工/留单/寻找替代 provider 或自托管模型。 | 对应 AI 能力顺延。 |

## 失败分支

- provider 不满足策略：关闭 provider 或限制到合成/非客户数据任务。
- PII redaction 未实现：禁止真实客户消息、截图、语音转写进入 LLM。
- 区域/留存无法确认或未获 owner 签收：顺延 GA-0 与生产流量。
- 日志无法脱敏：关闭原文日志，只保留 hash/摘要/计量；若 trace 仍需明文才能排障，则对应任务转人工。
- fallback provider 缺证据：禁用 fallback；主 provider 失败时进入 handoff/留单。
- OpenAI 输入/输出共享被启用：立即关闭生产 LLM，轮换 key，记录安全事件，并重新 owner 签收。

## 后续实现映射

后续 `packages/llm-gateway` implementation spec 必须至少交付：

1. `TaskDataPolicy` 配置，逐任务声明允许字段、禁止字段、redaction profile、endpoint、`store=false`、fallback 和 eval gate。
2. redaction pipeline 与 synthetic fixtures，覆盖电话、地址、Telegram identity、订单/物流/支付、内部成本/利润/阈值、截图 OCR、语音转写。
3. `llm_call_log` / trace schema，不存 raw prompt/completion，记录 hash、截断、成本、延迟和 fallback。
4. provider manifest loader，生产启动时若 provider status 不是 accepted 分支则拒绝客户 LLM task。
5. eval trigger，触碰 prompt/路由/知识/AI 人设时阻断未通过发布。

## 验证证据

- OpenAI policy review：`docs/evidence/M0/llm-data-processing/openai-policy-review.md`
- Provider manifest：`docs/evidence/M0/infra/llm-provider-manifest.md`
- M0-04 spec：`docs/specs/M0-04-llm-data-processing-adr.md`
- 签收状态：项目 owner 在 2026-06-14 选择 `dev_only` 分支；当前状态为 `accepted_dev_only__customer_llm_blocked`。真实客户消息、截图、语音转写和客户档案仍不得进入第三方 LLM。

## 影响范围

- 后续实现：`packages/llm-gateway`、`packages/memory`、`packages/distill`、`packages/evals`、LLM call log / trace / redaction utilities。
- 本 PR：仅更新 ADR/spec/evidence，不实现 gateway，不接真实生产流量。
