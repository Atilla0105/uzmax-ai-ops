# M0-04 LLM 数据处理 ADR

## 目标

在任何真实客户消息进入第三方 LLM 前，定义生产流量的数据处理边界：PII、留存、区域、日志、trace、fallback provider 和任务级限制。结论写入 `docs/adr/ADR-003-llm-data-processing.md`。

## Owner

Owner：AI agent 起草、取证和验证；项目 owner 确认真实客户数据、合规和成本风险。

## 时间盒

1 个工作日。到期未签收时，禁止真实客户消息进入第三方 LLM。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M0-04-llm-data-processing-adr.md`
- `docs/adr/ADR-003-llm-data-processing.md`
- `docs/evidence/M0/llm-data-processing/**`
- `docs/evidence/M0/infra/llm-provider-manifest.md`

说明/备注：本 PR 只闭合 ADR 与证据，不实现 `packages/llm-gateway`；后续 LLM gateway 数据处理策略必须另开 implementation spec。

## 变更预算与路径分类

- source 预算：changed source files = 0、net source LOC = 0、new source files = 0。
- test/generated/lock/config/docs 预计变更：docs only；不改测试、生成物、lockfile 或配置。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：本 PR 不新增 source 文件；已在开工前读取既有 ADR/spec/evidence 与 v1.1 文档。
- 外部 API/SDK/provider/connector/adapter 依据：OpenAI 官方文档证据；不新增 provider/connector/adapter。
- 是否需要例外：无。

## 前置条件

- LLM provider 候选与 key 管理方式已确认。
- 已知 provider 的 retention、zero-retention、区域和日志政策。
- 红线字段、PII 字段、内部敏感字段清单已初步确认。

## 实施步骤

1. 列出允许进入 LLM 的字段、禁止进入 LLM 的字段和必须脱敏字段。
2. 定义任务级策略：`intent_classify`、`kb_answer`、`draft_reply`、`vision_diag`、`speech_postprocess`、`distill_daily`、`eval_judge`。
3. 定义 provider 选择规则：留存、区域、zero-retention、fallback 继承同一策略。
4. 定义日志与 trace：不得保存原始敏感明文；截断、hash、redaction 规则明确。
5. 定义失败分支：关闭 provider、强脱敏、限制任务类型或顺延真实流量。
6. 将结论写入 ADR-003，并映射到 LLM gateway 实现 spec。

## 通过条件

- ADR-003 明确 PII、内部敏感字段、客户消息、附件、语音转写、截图诊断的处理边界。
- 所有 provider 的 retention/区域/日志策略有证据链接。
- fallback provider 不能放宽主 provider 的数据处理要求。
- 真实客户消息进入 LLM 前有可执行的 redaction 和 trace 策略。

## 失败分支

- Provider 不满足策略：关闭该 provider 或限制到非客户数据任务。
- PII redaction 未实现：禁止真实客户消息进入 LLM。
- 区域/留存无法确认：顺延 GA-0 与生产流量。
- 日志无法脱敏：关闭原文日志，只保留 hash/摘要/计量。

## 不做什么

- 不实现完整 LLM gateway。
- 不接真实生产流量。
- 不以“供应商默认安全”为通过条件。
- 不把离线样本脱敏等同于生产实时数据合规。

## 验收映射

- F-05：内部阈值/成本/利润不进客户上下文。
- G-02：调用日志记录但不泄露敏感明文。
- G-03：模型路由变更进入评测 gate。
- GA-0 进入条件：真实流量前必须签收。
