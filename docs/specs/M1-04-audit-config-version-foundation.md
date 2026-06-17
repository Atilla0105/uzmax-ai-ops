# M1-04 Audit Config Version Foundation

## 目标

建立 M1 平台骨架的审计与配置版本最小闭环：正式 `audit_log` 与 `config_version` schema/RLS 契约、API 审计事件与配置保存/回滚事件契约、后台只读入口和自动化验证。该 spec 只交付 M1 平台治理地基，不实现完整配置中心、日志中心、真实生产写入、M2/M3/M4 能力、eval runner 或 GA-0 开闸动作。

## Owner

Owner：项目 owner 最终确认 M1-04 合并许可、真实生产账号/数据/发布风险和后续 M1 顺序；AI agent 执行 schema/API/admin 实现、spec compliance review、code quality review、验证和证据归档。项目 owner 仍负责真实客户数据、真实 LLM key、成本、合规和生产发布决策。

## 时间盒

1 个工作日。到期若正式审计表、配置版本表或最小 API 事件契约无法形成可验证闭环，则关闭本实现分支或拆出更小 schema-only PR；不得夹带 M1-05、M2/M3/M4、GA-0 或客户 LLM 路径继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M1-04-audit-config-version-foundation.md`
- `docs/contracts/**`
- `packages/db/**`
- `apps/api/**`
- `apps/admin/**`
- `scripts/tests/**`

说明/备注：

本 PR 允许新增 M1-04 正式治理 schema、API contract、后台只读入口和对应测试。未列出的模块默认不可改；尤其不得修改 `packages/authz/**`、`packages/engine/**`、`packages/channels/**`、`packages/capabilities/**`、`packages/llm-gateway/**`、`packages/evals/**`、`docs/evidence/M1/eval-seed/**` 或客户样本路径。

## 变更预算与路径分类

- source 预算：changed source files <= 6、net source LOC <= 600、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec；新增 SQL migration；就地更新 Prisma schema、DB helpers、API access-context contract、admin shell、contracts 文档和自动化测试。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `audit_log`、`config_version`、`business_config`、`feature_flag`、`ApiAuditEvent`、`ConfigVersion`、`M1-04`、`B-05`；当前正式实现只有 M1-02 `ApiAuditEvent` port 和 M0 SPK-04 spike 的隔离样例，没有可复用的正式治理 schema/source。为遵守就地优先，本 spec 不新增 source 文件，只更新既有 source 文件和新增 migration/test/spec 文档。
- 外部 API/SDK/provider/connector/adapter 依据：无新增外部 API/provider/connector/adapter；admin 不 import 后端包。
- 是否需要例外：无。

## 文档触发检查

- 结果：触发 `docs/contracts/**`。
- 判断依据：`docs/doc-gates.md`。本 PR 新增正式 schema 与 API contract，因此必须更新 contracts；不新增 release runbook、eval fixture、外部 provider、environment 或 observability 能力路径。

## 前置条件

- Gate 1 decision 状态为 `go__m1_platform_skeleton_only`。
- M1-01、M1-02、M1-03 已合并到 `main`。
- 当前无 open PR，`git branch --no-merged main` 无输出；本分支从最新 `main` 创建。
- `packages/db` schema 变更全局串行，本 PR 不与其他 schema PR 并行。

## 实施步骤

1. 在 Prisma schema 与 SQL migration 中新增 `audit_log`、`config_version`、配置版本 domain/status enum、RLS select/insert baseline 和最小约束；不得新增客户、对话、订单、知识、渠道或 AI 业务表。
2. 在 `packages/db/src` 暴露治理表名、审计事件类型、配置版本 domain/status 和用于测试/上层 contract 的纯 helper。
3. 扩展 API audit event shape，使 tenant switch、权限变更、配置保存、配置回滚事件都有 actor、time、module/action/object、before/after 和 tenant context。
4. 增加 API 配置保存/回滚事件契约方法；默认仍走 in-memory/contract sink，不接真实生产数据库连接或客户数据。
5. 在 admin shell 中把 M1-03 的团队/配置占位升级为审计与配置版本只读入口，说明权限变更、租户切换、配置保存/回滚均需要审计。
6. 更新 contracts 文档，记录 `audit_log` / `config_version` schema、API event shape、当前不关闭完整日志中心/配置中心/生产 readiness 的边界。
7. 新增或更新自动化测试，覆盖 schema/RLS、DB helper、API tenant switch audit、配置保存/回滚 audit contract、admin 只读入口和禁止样本格式误入。

## 通过条件

- `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、`npm run playwright` 通过。
- 如时间允许，`npm run check` 通过。
- 自动化测试证明 `audit_log` / `config_version` schema 存在且 RLS fail-closed，关键审计事件含 actor/time/before/after，配置保存/回滚只生成 contract 事件不接真实客户数据。
- Playwright 证明 admin shell 中有审计与配置版本只读入口，且仍不展示客户明文、raw/export/jsonl/csv 样本或 GA-0 可点击动作。
- PR 不提交 raw/export/jsonl/csv 样本，不引入 M2/M3/M4/GA-0 能力，不让真实客户消息进入第三方 LLM。
- 实现完成后先做 spec compliance review，再做 code quality review。

## 失败分支

- 若 schema 设计超过 M1 平台骨架预算：保留 `audit_log` 最小契约，配置版本拆为后续 M1 governance PR，并记录 superseded/拆分原因。
- 若 API contract 需要真实 Supabase/Postgres 写入才能验证：本 PR 只关闭 contract 与 schema，不关闭生产审计 readiness。
- 若 admin 入口需要真实 API/权限矩阵或日志中心才能验证：保留只读入口，完整日志/配置工作流拆到后续里程碑。
- 若发现必须新增 `business_config`、`feature_flag`、模板中心或完整配置中心表：拆到后续 spec，不扩大本 PR。

## 不做什么

- 不实现完整配置中心、日志中心、模板中心、角色编辑 UI、真实权限变更 UI、真实数据库写入 repository 或生产 readiness。
- 不实现 Telegram Bot/Business、对话、工单、客户资产、订单 connector、知识、AI prompt、模型路由、报价、SLA、eval runner 或 GA-0 发布动作。
- 不新增客户、会话、消息、订单、知识、LLM、渠道、蒸馏、导出或 eval seed schema。
- 不提交真实客户明文、截图、语音转写、raw/export/jsonl/csv 样本或脱敏样本内容。
- 不让真实客户消息进入第三方 LLM。

## 验收映射

- B-05：权限变更、租户切换、配置保存/回滚的审计事件契约含 actor/time/before/after；正式 `audit_log` schema 与 RLS baseline 存在。
- REQ-T10：配置版本最小契约覆盖业务配置、feature flag、模板复制后的租户内版本化 domain 与回滚引用。
- REQ-T12 / I-07：操作日志核心字段和高风险对象回跳字段进入 schema；完整日志中心筛选回查后续关闭。
- J-05：M1-04 spec、contracts 和测试证据滚动归档，不把审计/配置版本地基留到 M6 集中补签。
- K-03/K-04：实现 PR 必须引用本 spec 编号，触碰模块清单约束本 PR 范围。
