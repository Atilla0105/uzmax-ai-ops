# UZMAX 智能运营系统 技术架构 v1.1

> 状态：1.0 投入版技术方案修订版  
> 日期：2026-06-13  
> 派生自：`UZMAX智能运营系统-PRD-v1.1.md`  
> 本文件回答“怎么建、边界在哪里、如何验证架构不漂移”。
> 签字前修订记录：2026-06-13 补全 §2.1 包依赖边界；对齐 §2 docs 树与实际 `preflight/`、`evidence/` 目录；拆分 dependency-cruiser 与 forbidden-terms 门禁；补入 ADR-003 LLM 数据处理和基础设施 provisioning 作为 M0/Gate 前置。

---

## 1. 架构总览

UZMAX 1.0 采用 **NestJS 模块化单体 + Supabase Postgres/RLS + Render 托管运行时 + Vercel 后台前端**。

```text
Telegram Bot / Telegram Business / Admin Web
        |
        v
Render: NestJS API
  - webhook ingress
  - admin REST API
  - WebSocket realtime gateway
  - auth/session guard
        |
        +--> Render Worker: BullMQ consumers
        |      - conversation engine
        |      - LLM calls
        |      - order sync/import
        |      - analytics aggregation
        |      - distill/eval jobs
        |
        +--> Render Cron
        |      - distill schedule
        |      - heartbeat
        |      - close idle conversations
        |      - backup/export triggers
        |
        v
Supabase
  - Postgres + RLS
  - Auth
  - Storage
  - Edge-compatible signed URLs

Vercel: React/Vite Admin
  - pure API client
  - no direct DB writes
```

### 1.1 运行进程

- `api`：NestJS HTTP/WebSocket 服务，处理 Telegram webhook、后台 API、实时事件、鉴权。
- `worker`：BullMQ 消费者，处理对话引擎、LLM、订单同步、导入、分析聚合、评测、蒸馏。
- `cron`：定时调度，触发蒸馏、心跳、归档、导入重试、在线日志结算、成本统计。
- `admin`：Vercel 上的 React/Vite 静态前端，所有数据通过 API/WS 获取。

### 1.2 技术选型

| 层 | 选型 | 决定 |
|---|---|---|
| 后端 | NestJS + TypeScript strict | 模块边界清晰，适合 API/worker/cron 共用领域代码 |
| 数据库 | Supabase Postgres + Prisma | Prisma 管 schema/type，Postgres RLS 做强隔离 |
| 鉴权 | Supabase Auth + 后端 session guard | 前端登录托管，后端统一注入 org/tenant 权限上下文 |
| 存储 | Supabase Storage | 素材、导入文件、评测样本附件、截图诊断样例 |
| 队列 | Redis + BullMQ on Render | 长任务、重试、幂等、限流与异步处理 |
| 后台 | React + Vite + TanStack Query | 纯 API 客户端，高密度运营台 |
| 实时 | WebSocket | 会话、工单、presence、心跳、评测运行状态 |
| 部署 | Render + Supabase + Vercel | 全托管为主，避免自运维单机 |

## 2. Monorepo 边界

```text
uzmax-ops/
  AGENTS.md             # agent 开发宪法
  apps/
    api/                 # NestJS API + WS gateway
    admin/               # React/Vite 后台
    worker/              # BullMQ worker entrypoint
    cron/                # scheduled job entrypoint
  packages/
    db/                  # Prisma schema, generated client, RLS migrations
    authz/               # org/tenant/permission guards
    channels/            # telegram-bot, telegram-business adapters
    engine/              # conversation orchestration, no business semantics
    capabilities/        # kb, vision, pricing, order-read, handoff
    ops-assets/          # quick replies, media assets, tags, custom fields
    llm-gateway/         # providers, routing, accounting, eval hooks
    memory/              # L1/L2/L3 context and retrieval
    distill/             # candidate generation and queues
    evals/               # eval runner, fixtures, redline checks
    ui-tokens/           # design tokens and linted CSS variables
  docs/
    prd/                 # 正式工程仓库内可放 PRD 索引/副本；当前规划阶段 v1.1 文档保留在根目录
    adr/
    preflight/
    specs/
    runbooks/
    evidence/
```

### 2.1 依赖规则

- 主链路：`channels -> engine -> capabilities -> db/llm-gateway`。
- `authz` 可被 `apps/api`、`apps/worker` 和后台 API 层调用；`authz` 不得依赖 `capabilities`、`engine`、`channels`。
- `memory` 可依赖 `db`、`llm-gateway`；只允许由 `engine` 或离线任务调用，不得直接调用 `channels`。
- `distill` 可依赖 `db`、`memory`、`llm-gateway`、`evals`；不得进入实时对话同步路径。
- `ops-assets` 可被后台 API 层与 `capabilities/kb` 使用；不得反向依赖 `engine` 或 `channels`。
- `evals` 可依赖 fixtures、`llm-gateway`、测试 DB utilities；不得进入生产请求链路。
- `ui-tokens` 只能向前端 primitives/patterns/pages 输出 token；不得依赖业务包。
- `capabilities/*` 之间禁止互相 import；需要组合时只能由 `engine` 编排。
- `admin` 只调用 API/WS，禁止 import 后端包。
- `engine` 禁止出现业务线词汇；业务语义在租户配置、知识库、能力模块内部。该规则由 forbidden-terms grep 或自定义 ESLint 规则执行，不由 dependency-cruiser 执行。
- DTO 从 schema 或明确契约生成；禁止手写漂移的请求/响应类型。

## 3. 多租户与 RLS

### 3.1 租户模型

- `org`：UZMAX 集团组织。
- `tenant`：内部业务线，如 Laylak；每个租户拥有独立客户、会话、知识、配置、AI 成员、订单连接。
- `tenant_member`：成员在租户内的角色、权限、presence、语言、通知偏好。
- `org_member`：集团层权限，用于集团总览、模板中心、租户管理。

### 3.2 隔离策略

- 所有租户业务表带 `org_id`、`tenant_id`。
- API 请求进入后端后生成 `AccessContext{orgId, tenantIds, permissions}`。
- Prisma 查询必须经 repository 层注入租户条件；禁止业务代码裸查跨租户表。
- Postgres RLS 使用当前请求上下文变量做二次约束；即使 repository 漏条件也不能越权读取。
- RLS 上下文注入必须先通过 SPK-03：在事务内执行 `set_config(key, value, true)` 后再执行查询，确认变量随事务结束清除；Prisma 侧只能采用 `$transaction` 包裹或 Prisma Client Extension 统一注入二选一。
- SPK-03 的并发压测必须沉淀为 CI 常驻用例：两个租户上下文各 1000 请求交错打入，断言零串话；若 transaction mode 无法保证，按 session mode 专用连接池、关键路径直连、repository 强制隔离 + RLS 纵深防御的顺序评估替代方案，并写 ADR-001。
- 权限唯一事实源是后端表：`tenant_member` 与 `permission_grant`；Supabase Auth 只负责身份认证与 JWT 签发，JWT 不承载业务权限 claim。
- SPK-04 必须验证 JWT -> 后端 guard -> `AccessContext` -> RLS 会话变量的完整链路，覆盖 HTTP、WebSocket、token 刷新、租户切换缓存失效、Supabase Storage 签名 URL 租户校验，并写 ADR-002。
- 集团聚合视图使用只读 SQL view/materialized view，不返回客户明文和会话内容。

### 3.3 模板复制

- `knowledge_template`、`ai_member_template`、`config_template`、`eval_template` 属集团资产。
- `quick_reply_template`、`field_template`、`tag_template` 可作为模板中心的轻量资产，用于复制成熟客服后台基本配置。
- 创建租户时可从模板复制；复制后生成租户内版本，后续与模板解耦。
- 模板更新只提示可同步，不自动覆盖租户生产配置。

## 4. 核心数据实体

必须在 v1.0 schema 中显式建模：

- 平台：`org`、`tenant`、`org_member`、`tenant_member`、`permission_grant`。
- 渠道：`channel_connection`、`business_connection`、`telegram_update_dedupe`。
- AI：`ai_member`、`ai_member_version`、`ai_capability_toggle`、`llm_route`、`llm_call_log`。
- 客服：`customer`、`customer_identity`、`conversation`、`message`、`ticket`、`ticket_event`。
- 客户资产：`custom_field_definition`、`customer_field_value`、`tag_definition`、`tag_assignment`。
- 知识与资源：`kb_entry`、`kb_stage`、`quick_reply_library`、`quick_reply`、`media_asset`、`kb_candidate`、`knowledge_template`。
- 订单：`order_connector`、`order_snapshot`、`order_query_log`、`import_job`、`import_row_error`。
- 报价：`quote_record`，含输入、配置版本、结果、有效期、创建来源。
- 评测：`eval_case`、`eval_run`、`eval_result`、`eval_gate`、`blind_review_task`。
- 分析：`metric_daily`、`analysis_saved_view`、`export_job`。
- 治理：`business_config`、`config_version`、`feature_flag`、`login_log`、`presence_log`、`audit_log`、`redline_event`、`breaker_event`。
- 蒸馏健康：`distill_health_daily` 记录候选数、通过率、降频状态、告警与人工恢复审计引用。
- 交付治理：`spec_record`、`acceptance_evidence` 可先以文档/CI 元数据实现，进入产品后台前至少要能被发布 checklist 引用。

## 5. 渠道与对话引擎

### 5.1 Telegram Bot

- webhook 只做验签、归一化、幂等去重、入队、快速返回。
- 支持文本、图片、语音、callback、素材发送、群聊/频道分诊、不支持类型处理。
- 所有出站消息经过租户配置、红线过滤、成本护栏、AI 成员状态检查。

### 5.2 Telegram Business 草稿模式

- 接收 `business_connection` 与 `business_message` 类更新，保存连接状态、权限、business account owner。
- 对 Business 消息区分客户消息与人工本人消息；人工本人消息进入会话记录并暂停 AI 继续草稿，避免抢答。
- AI 生成 `draft_reply`，写入后台草稿；只有持权限成员点击发送后，才使用 `business_connection_id` 代发。
- 1.0 禁止自动发送 Business 回复；任何绕过人工确认的路径视为阻断缺陷。
- SPK-01 必须在 M2 闸门内用真实 Telegram Business 账号验证授权范围、bot 是否能收到客服本人消息、`business_connection_id` 代发限制；结论写 ADR-B01，并按验收矩阵条件式分支启用或关闭 Business 模块。

### 5.3 引擎流程

```text
InboundMessage
  -> tenant/channel identity resolve
  -> customer/session resolve
  -> aggregation window
  -> AI member state gate
  -> context assembly
  -> intent route
  -> capability invoke
  -> redline/output policy
  -> send Bot response OR create Business draft OR handoff ticket
```

## 6. 能力模块

- `kb`：事实条目、旅程阶段、阶段定位、素材引用、未知转人工。
- `vision`：截图诊断，不确定时返回 `uncertain`。
- `speech`：语音转写，保留原语音文件 ref 与转写置信度。
- `pricing`：纯函数报价，LLM 只抽参；每次报价生成 `quote_record`。
- `handoff`：工单创建、presence 路由、SLA、升级链、通知。
- `order-read`：只读订单查询，API connector 优先，导入快照兜底。
- `distill`：生成知识候选、档案候选、评测候选，确认前不入正式库。
- `ops-assets`：管理公共/私人话术、素材、客户字段、客户标签、会话标签；供对话工作台、客户资产中心、分析中心复用。

### 6.1 上下文 Token 预算

面向客户或 Business 草稿的调用必须由 context assembler 统一组装，按段硬截断，并在 `llm_call_log` 或 trace 中记录截断事件。默认预算存入版本化 `business_config`，租户可调但必须进入评测 gate。

| 段 | 默认预算 | 备注 |
|---|---:|---|
| 系统提示、红线、人设 | ~2k | 标记 prompt cache breakpoint |
| 知识条目、教程阶段卡 | ~1-2k | 只放命中片段和必要阶段 |
| 客户档案 L3 | ~0.3k | 结构化摘要优先 |
| 上次会话摘要 L2 | ~0.3k | 不放完整历史 |
| 近期原文 L1 | ~1-2k | 最近 10-20 条 |
| 合计 | ~5-7k | `draft_reply` 同预算 |

### 6.2 蒸馏健康护栏

- 每租户每日候选条目上限为 10 条，按置信度排序截断。
- 确认队列 7 日滚动通过率写入 `distill_health_daily`，进入分析中心固定看板。
- 连续 3 日通过率低于 40% 时，蒸馏调度自动降频为每周一次并告警 owner；确认队列顶部显示琥珀提示条。
- 恢复每日频率只能人工操作，必须写 `audit_log`；系统不得自动恢复。

## 7. LLM 网关与评测门禁

- 任务级路由：`intent_classify`、`kb_answer`、`vision_diag`、`speech_postprocess`、`summarize`、`profile_update`、`draft_reply`、`distill_daily`、`journey_import`、`eval_judge`。
- 每个任务有 primary、fallbacks、超时、成本预算、token 预算、评测 gate。
- 面向客户或草稿的任务不能读取 internal 配置字段。
- `kb_answer` 与 `draft_reply` 必须通过乌语拉丁/西里尔、俄语、红线、误报专项。
- prompt、知识、模型路由、AI 人设变更触发评测；未通过时 API 拒绝发布到 production 版本。

### 7.1 评测集配额

种子集必须在 M1 建成，作为 M2/M3 验收前置条件；不得后置到发布前。种子集不少于 60 条：意图 30、乌俄问答 20、红线攻击 10，来源为脱敏真实咨询样本。

1.0 全量集必须在 M6 前建成，不少于 200 条：

| 类别 | 条数 | 硬断言 |
|---|---:|---|
| 意图分类 | 50 | 核心意图不可漏召回 |
| 教程阶段定位 | 20 | 输出整条教程全文即失败 |
| 乌语拉丁问答 | 20 | owner 盲评 |
| 乌语西里尔问答 | 20 | owner 盲评 |
| 俄语问答 | 20 | owner 盲评或规则评分 |
| 报价提参 | 20 | 输出价格数字且非来自 `quote_record` 即失败 |
| 截图诊断 | 20 | 低置信度强答即失败 |
| 红线攻击 | 20 | 敏感数字模式出现即失败，必须 100% 通过 |
| 红线误报 | 10 | 正常货重/尺寸数字被拦截即失败 |
| Business 草稿 | 10 | 出现自动发送路径即失败 |
| 降级行为 | 10 | AllProvidersDown 时沉默或报错外露即失败 |

负反馈样本与转人工后人工改写的回答自动生成评测候选，进入确认队列；owner 确认后入集，使评测集随生产数据生长。

## 8. 订单 connector

- connector 接口：`searchOrders(query, tenantId)`、`getOrder(orderId)`、`syncRecent(cursor)`。
- 返回数据写入 `order_snapshot`，包含来源、外部 ID、状态、批次、更新时间、过期时间、原始 payload 摘要。
- API 失败时不阻塞客服流程；后台显示 connector 降级，并允许使用最近导入快照。
- CSV/表格导入生成 `import_job`，逐行校验，错误可下载，成功行进入订单快照。
- SPK-02 必须在 M4 前用真实订单 SaaS API 文档或沙箱凭据验证 API 是否存在、鉴权方式、字段覆盖、频率限制与数据新鲜度。若无 API 或不可用，导入快照升级为订单数据主路径，E-03 过期提示与 E-04 禁止编造仍为 P0。

## 9. 分析、日志与导出

- 分析中心读取 `metric_daily` 与事实表聚合，不直接扫全量消息明文。
- 支持固定看板与可配置分析表；维度白名单为租户、成员、AI 成员、渠道、意图、时间粒度、订单状态、转人工原因。
- 导出统一走 `export_job`，记录操作者、筛选条件、文件引用、完成状态和过期时间。
- `login_log` 记录登录类型、成员、位置/IP、设备、时间；敏感位置只在授权角色可见。
- `presence_log` 记录成员在线/离线、更新方式、更新时间、持续时长；路由仍以实时 presence 为准。
- `audit_log` 记录操作模块、功能、对象、内容、before/after 版本；高风险操作必须可跳回业务对象。

## 10. 部署与运维

- Supabase：Postgres、Auth、Storage、RLS、每日备份、连接池。
- Render API：最小实例防冷启动，健康检查，滚动部署。
- Render worker：可横向扩展，按队列分 concurrency，所有 job 幂等。
- Render cron：蒸馏、导入同步、心跳、归档、统计、presence 结算；不用 Vercel cron 承担核心后台任务。
- Vercel：后台静态部署、预览环境、边缘缓存静态资源；不承载长任务。
- 日志：traceId 串联 webhook、engine、LLM、order connector、outbound、audit。
- 告警：心跳丢失、队列积压、模型全挂、RLS 策略错误、红线熔断、订单 connector 连续失败。

## 11. 治理与交付

- M0 架构与治理：基础设施账号/环境 provisioning、monorepo、CI、部署链路、AGENTS.md、ADR、SPK-03 RLS x Prisma x 连接池、SPK-04 双鉴权链路、ADR-003 LLM 数据处理。
- M1 平台骨架：org/tenant/authz/schema、集团层/租户层壳、审计、配置版本、种子评测集。
- M2 渠道与对话：Bot 生产链路、SPK-01 Business 草稿实测与接入、对话工作台、工单。
- M3 AI 能力：知识、教程、报价、截图、语音、LLM 网关、评测门禁。
- GA-0 生产内测闸门：M2 + M3 关闭后，仅 Bot 渠道在受控条件下接真实流量，启动蒸馏、评测候选、乌语语料与指标基线；不是正式发布。
- M4 订单与客户：SPK-02 订单 API 实测、订单 connector 或导入主路径、客户资产中心、字段/标签、报价记录、身份归并。
- M5 运营闭环：蒸馏健康护栏、确认队列、AI 成员控制台、分析中心、日志中心、模板中心。
- M6 发布加固：熔断演练、RLS 越权测试、故障注入、备份恢复、全量验收与残项清零。

1.0 正式发布必须一次性通过验收矩阵；M0-M6 是内部推进闸门，不是对外分期发布。

### 11.1 GA-0 进入条件与内测规则

GA-0 进入条件全部满足后才可开闸：M2/M3 闸门关闭；红线攻击类评测 100% 通过；红线出站过滤器在生产生效；用户级熔断故障注入通过；AI 成员急停验收通过；心跳告警、Sentry、全链路 traceId 在线；api 与 worker 各完成一次回滚演练；确认队列可用；双语引导话术已交付。

GA-0 只覆盖 Bot 渠道真实流量，Business 与订单能力不进入内测。第 1 周仅承接非人工时段 21:00-9:00，第 2 周起按 owner 决定全时段开放。触发熔断或红线事件时 AI 成员离线、全量留单，bot 本体不下线。内测产生的真实会话、工单、报价、负反馈可作为验收证据，但不降低任何 1.0 验收项等级。

### 11.2 Owner 侧关键路径

AI 开发吞吐不是本项目唯一关键路径。以下 owner 输入任一延迟，对应闸门顺延，且顺延决定写 ADR；不允许“先做着，素材后补”。

| 交付物 | 消费方 | 截止闸门 | 延迟影响 |
|---|---|---|---|
| Supabase/Render/Vercel/Sentry/LLM key/Bot 账号环境 | M0、SPK-03、SPK-04、LLM 数据处理 | Gate 0 前 | M0 工程仓库/CI 与真实环境 spike 顺延 |
| 历史真实咨询样本导出（脱敏） | 种子评测集 | M1 前 | M2 智能能力无法验收 |
| 一期教程完整素材包 | 旅程导入、种子知识库 | M3 前 | 教程能力无内容可跑 |
| 截图诊断样例 >= 20 张 | 诊断评测集 | M3 前 | F-02 无法验收 |
| 乌语拉丁/西里尔/俄语盲评 | G-04 门禁 | M3 闸门内 | 强模型锁定，路由优化冻结 |
| Telegram Business 真实账号（含 Premium） | SPK-01 | M2 并行 | Business 条目走不可行分支 |
| 订单 SaaS API 文档/沙箱凭据，或确认无 API | SPK-02 | M4 前 | E-01 走无 API 分支 |
| 双语引导话术与通知模板终稿 | GA-0 | GA-0 前 | 内测引导链路缺话术 |
| 1.0 验收证据签收 | 发布门禁 | 滚动进行 | 未签收项阻断发布 |

验收不得堆积到 M6 集中签收。每个里程碑关闭时，该里程碑覆盖的验收项必须当场签收归档；M6 只做全链路演练与残项清零。

## 12. AI 开发治理

### 12.1 L1 宪法

仓库根目录必须有 `AGENTS.md`，内容包括 §2.1 依赖规则、目录与命名规范、禁止模式清单、先搜后写指令。禁止模式至少包括：手写漂移 DTO、跨 capability import、LLM 算数、`engine` 出现业务语义词、组件内字面量样式。所有重大架构决策写入 `docs/adr/`，避免后续 agent 移除设计意图。

### 12.2 L2 机器执法

CI 必须按顺序执行以下门禁，任一失败即阻断合并：

1. `tsc --strict`
2. ESLint，含 boundaries 规则
3. dependency-cruiser，违反 §2.1 的 import DAG 即失败
4. forbidden-terms grep 或自定义 ESLint，`packages/engine` 出现业务线词汇即失败
5. jscpd，重复率阈值 3%
6. knip，死代码零容忍；确需保留必须有显式 ignore 与原因
7. 单元测试，pricing、SLA 等纯函数 100% 覆盖
8. 评测集触发检查：触碰 `prompts/**`、`packages/llm-gateway/**/routes/**`、`packages/db/**/knowledge*`、`packages/db/**/ai_member*`、`packages/evals/**`、`configs/**/ai-persona/**`、`docs/specs/**ai**` 时强制跑对应评测；红线类 100%
9. 前端 size-limit，租户对话首屏 <= 250KB gzip；M0 允许最小 app 空集检查，但 job 必须可运行且失败阻断
10. Playwright 视觉回归，覆盖 `/design` 与三核心屏；M0 允许最小 `/design` 占位页或空集检查，但 job 必须可运行且失败阻断

### 12.3 L3 变更流程

每个 REQ 必须先形成 `docs/specs/REQ-xx.md`，内容包括目标、触碰模块、新增文件、不做什么。owner 批准后实现 agent 才能开工。每个 PR 只实现一个 spec，PR 描述必须引用 spec 编号。独立审查 agent 按固定清单检查是否重复造轮、越依赖边界、超出 spec 范围、触碰红线相关代码。CI 绿且审查通过后才可合并。

### 12.4 并行纪律

每份 spec 必须声明触碰模块清单；触碰模块有交集的 spec 禁止并行实现，由 spec 队列串行调度。`packages/db` schema 变更是全局串行点，任何时刻最多一个 PR 修改 schema。

### 12.5 定期垃圾回收

每周一次维护会话，输入为 jscpd、knip、复杂度报告。专职 refactor agent 只做合并重复、删除死码、收紧接口，禁止加功能；产出走同样 PR 流程。

### 12.6 ADR 编号

- 技术地基 ADR 使用数字序列：`ADR-001-*`、`ADR-002-*`、`ADR-003-*`。
- 外部业务依赖使用 B 序列：`ADR-B01-*`、`ADR-B02-*`。
- 当前保留编号：`ADR-001-rls-prisma-pool.md`、`ADR-002-dual-auth-access-context.md`、`ADR-003-llm-data-processing.md`、`ADR-B01-telegram-business.md`、`ADR-B02-order-api.md`。

---

## 参考

- Telegram Bot API: https://core.telegram.org/bots/api
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Render Background Workers: https://render.com/docs/background-workers
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
