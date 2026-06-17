# M1-03 Admin Group Tenant Shell

## 目标

建立 M1 平台骨架的最小后台壳：集团层/租户层工作区框架、顶栏、租户切换器、授权工作台入口、发布与验收只读入口、状态/权限/降级提示和 `/design` 基线视觉回归。该 spec 只交付 admin frontend shell，不接真实客户数据、不实现业务工作台、正式审计闭环、配置版本、eval runner、渠道、AI、订单或 GA-0 发布动作。

## Owner

Owner：项目 owner 最终确认 M1-03 合并许可、真实 preview/prod access protection 和后续 M1 顺序；AI agent 执行后台壳实现、spec compliance review、code quality review、验证和证据归档。项目 owner 仍负责真实账号、真实客户数据、生产发布和合规/成本决策。

## 时间盒

1 个工作日。到期若后台壳、租户切换器或发布验收只读入口无法形成可测试 UI，则关闭本实现分支或拆出更小 design shell；不得夹带 M1-04/M1-05 或非 M1 能力继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M1-03-admin-group-tenant-shell.md`
- `apps/admin/**`
- `packages/ui-tokens/**`

说明/备注：

本 PR 只允许把 `apps/admin` 从 M0 design harness 升级为 M1 admin shell，并允许更新 `packages/ui-tokens` 的后台视觉 token。未列出的模块默认不可改；尤其不得修改 `apps/api/**`、`packages/db/**`、`packages/authz/**`、`packages/engine/**`、`packages/channels/**`、`packages/capabilities/**`、`packages/llm-gateway/**`、`packages/evals/**` 或客户样本路径。

## 变更预算与路径分类

- source 预算：changed source files <= 5、net source LOC <= 500、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec；就地更新 admin shell、CSS、ui tokens 和 Playwright design test。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `M1-03`、`admin group`、`tenant shell`、`租户切换器`、`发布与验收`、`授权工作台`、`design-harness`、`tenant-switch`、`release`；当前 `apps/admin` 只有 M0 design harness，没有可复用后台壳文件。为遵守就地优先，本 spec 不新增 source 文件，只更新现有 `App.tsx`、`styles.css`、`tokens.css` 和测试。
- 外部 API/SDK/provider/connector/adapter 依据：无新增外部 API/provider/connector/adapter；admin 不 import 后端包。
- 是否需要例外：无。

## 文档触发检查

- 结果：none。
- 判断依据：`docs/doc-gates.md`。本 PR 不新增 contracts、eval fixtures、OpenAPI、environment、observability 或 release runbook 能力路径；M1-03 shell 的范围由本 spec 与后台设计文档约束。

## 前置条件

- Gate 1 decision 状态为 `go__m1_platform_skeleton_only`。
- M1-01 与 M1-02 已合并到 `main`。
- 当前无 open PR，`git branch --no-merged main` 无输出；本分支从最新 `main` 创建。

## 实施步骤

1. 将 M0 admin design harness 就地升级为集团/租户双层后台壳，保留桌面优先、高密度、状态优先的工作区布局。
2. 实现顶栏：当前层级、租户切换器、环境标识、系统心跳、搜索、通知、用户菜单占位；不得展示客户明文。
3. 实现集团层只读总览：租户健康、异常租户、AI 熔断/模型故障、connector 降级、红线事件和发布 gate 状态的骨架。
4. 实现租户层骨架：授权工作台入口、团队权限入口、租户只读工作区状态、permission denied/degraded 状态；不得进入对话、客户、订单、知识真实业务实现。
5. 实现发布与验收只读入口：展示 M0/M1/GA-0 gate 状态、owner 签收占位、阻断项；发布/开闸动作必须禁用。
6. 更新 ui tokens 与 CSS，避免组件内 inline style 或非 token 色值；保持 `apps/admin` 不 import 后端包。
7. 更新 Playwright 测试，覆盖 admin shell、租户切换器、集团/租户层、授权入口、发布验收入口和无客户明文。

## 通过条件

- `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、`npm run playwright` 通过。
- 如时间允许，`npm run check` 通过。
- Playwright 证明 admin shell 可见，租户切换器存在，集团层不展示客户明文，授权入口与发布验收只读入口可见，发布动作禁用。
- PR 不提交 raw/export/jsonl/csv 样本，不引入 M2/M3/M4/GA-0 能力，不让真实客户消息进入第三方 LLM。
- 实现完成后先做 spec compliance review，再做 code quality review。

## 失败分支

- 若 admin shell 超过 source 预算：拆成更小 shell/layout PR，不夹带业务页面。
- 若需要真实 API/WS、真实账号或多租户测试账号才能证明权限：本 PR 只能关闭 frontend shell，不关闭生产 A-02。
- 若发布验收入口需要正式审计或 gate schema 才能验证：保留只读骨架，拆到 M1-04 或后续 release spec。
- 若新增依赖触发高危 audit 或体积超限：移除依赖，回到 CSS/token-only shell。

## 不做什么

- 不实现真实登录、真实 API client、WebSocket、后台数据写操作、正式权限编辑、审计写入、配置版本、feature flag、发布/GA-0 开闸动作或生产 readiness。
- 不实现对话、工单、客户资产、订单、知识与资源、确认队列、评测中心、AI 成员、分析或日志的业务工作流。
- 不新增 `audit_log`、配置版本、eval seed manifest/runner 或业务 schema。
- 不实现 Telegram Bot/Business、订单 connector、AI prompt/模型路由/知识发布、报价、SLA 或客户资产闭环。
- 不提交真实客户明文、截图、语音转写、raw/export/jsonl/csv 样本或脱敏样本内容。

## 验收映射

- A-01：提供集团层健康与风险聚合 shell；完整数据种子和 owner 手工验收后续关闭。
- A-02：提供租户层授权工作台 shell；完整多账号 E2E 仍依赖真实 authz/API 后续关闭。
- B-03：集团层只展示聚合/状态，不展示客户明文。
- B-04：前端展示 permission denied/degraded 状态；后端权限矩阵已由 M1-02 基线，完整矩阵后续关闭。
- J-05：提供发布与验收只读入口骨架，后续证据归档和 owner 签收闭环单独完成。
- I-05：更新 `/design` 视觉回归覆盖后台 shell token 使用。
- K-03/K-04：实现 PR 必须引用本 spec 编号，触碰模块清单约束本 PR 范围。
