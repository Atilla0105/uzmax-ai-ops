# UZMAX Agent Constitution

本文件是 UZMAX 智能运营系统所有 AI agent 的根规则。任何实现、评审、重构、文档更新都必须先读本文件，再读对应 spec 与 v1.1 正式文档。

## 1. Source Of Truth

- 产品范围以 `UZMAX智能运营系统-PRD-v1.1.md` 为准。
- 技术边界以 `UZMAX智能运营系统-技术架构-v1.1.md` 为准。
- 后台体验以 `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` 为准。
- 发布阻断以 `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` 为准。
- 新增工作必须先有 `docs/specs/` 下的 spec；一个 PR 只实现一个 spec。

## 2. Governance Roles

- 本项目只有一个真人决策者：项目 owner（用户本人）。
- AI agents 负责执行、复核、产证据、暴露风险和维护治理文件。
- 技术、AI、运营、设计/前端、DevOps 是检查视角和工作类型，不是多人签字卡点。
- AI agents 不得替项目 owner 做最终范围、发布、真实账号、真实客户数据、LLM key、成本和合规风险决策。

## 3. Dependency Rules

本节是 `UZMAX智能运营系统-技术架构-v1.1.md` §2.1 的高频执行镜像；若发生冲突，以技术架构 §2.1 为准，并在 M0-01 校准本节。

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

## 4. Directory Rules

- `apps/api`：NestJS HTTP/WebSocket 服务。
- `apps/admin`：React/Vite 后台，纯 API 客户端。
- `apps/worker`：BullMQ worker entrypoint。
- `apps/cron`：scheduled job entrypoint。
- `packages/db`：Prisma schema、generated client、RLS migrations。
- `packages/authz`：org/tenant/permission guards。
- `packages/channels`：Telegram Bot 与 Telegram Business adapters。
- `packages/engine`：conversation orchestration，不承载业务线语义。
- `packages/capabilities`：kb、vision、pricing、order-read、handoff 等能力。
- `packages/ops-assets`：quick replies、media assets、tags、custom fields。
- `packages/llm-gateway`：providers、routing、accounting、eval hooks。
- `packages/memory`：L1/L2/L3 context and retrieval。
- `packages/distill`：candidate generation and queues。
- `packages/evals`：eval runner、fixtures、redline checks。
- `packages/ui-tokens`：design tokens and linted CSS variables。
- `docs/adr`：重大架构决策。
- `docs/specs`：已批准或待批准的工作 spec。
- `docs/runbooks`：生产故障与发布演练。

## 5. Forbidden Patterns

- 禁止在没有 spec 的情况下新增模块、页面或能力。
- 禁止先写新实现再搜索已有实现；新增前必须 `rg` 检索。
- 禁止在可扩展现有实现时新增平行实现；新增 source 文件必须说明没有合适归属。
- 禁止跨 capability import。
- 禁止让 LLM 做报价、SLA、成本、订单状态等数值判断。
- 禁止在 `engine` 中写 Laylak、集运、乌兹别克等业务线词汇。
- 禁止组件内字面量样式；前端必须走 tokens/primitives/patterns。
- 禁止前端隐藏权限后后端仍可调用成功。
- 禁止绕过评测 gate 发布 prompt、知识、模型路由或 AI 人设变更。
- 禁止自动写入正式知识库；蒸馏候选必须经确认队列。
- 禁止通过删除测试、降低断言、增加 `.skip`/`.only`/`xit`/`xfail`、扩大 mock 或快照膨胀来让 CI 通过。
- 禁止编造外部 API、SDK 方法或平台能力；新增 provider/connector/adapter 必须引用官方文档、已生成类型、本地 spike 证据或 ADR-B。
- 禁止把格式化、重排、批量改名等 churn 混入行为变更；除非 formatter 强制，否则格式化变更必须单独成 PR/spec。

## 6. Change Flow

1. 先创建或确认 `docs/specs/REQ-xx.md` / `M*-xx.md`。
2. spec 必须写清目标、项目 owner 确认点、AI agent 执行/复核责任、时间盒、Spec 类型、触碰模块、变更预算、通过条件、失败分支、不做什么。
3. 触碰模块有交集的 spec 禁止并行。
4. `packages/db` schema 变更全局串行。
5. 实现完成后必须先做 spec compliance review，再做 code quality review。
6. 合并前必须通过 CI 和对应验收证据归档。
7. 每个工作切片结束、切换阶段或新开任务前，必须检查 `git branch --no-merged main` 与 `gh pr list --state open`；非 `main` 分支必须处于 open PR、已合并、已删除或在 spec/evidence 中显式标记 superseded 的状态。

## 6A. Workspace Isolation / Orchestration Safety

- 并发执行的基本单位是：一个 worker = 一个 git worktree = 一个 branch = 一个 spec。
- 并发 worker 不得共享同一个物理 checkout、git index、当前分支、`node_modules`、build/dist/cache 目录或未提交工作区状态。
- root/main checkout 只用于协调、审计、同步 `main`、合并后清理和只读核对；不得承载 worker 编辑。
- coordinator 派发 worker 前必须确认物理 worktree 路径互斥、目标 branch 互斥、spec 触碰模块互斥；`packages/db` schema、lockfile、共享 config、CI/guard 脚本、全局生成物和 release/production 门禁改动必须全局串行。
- worker 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`，并确认其路径与分支匹配 spec 前置条件；路径或分支不匹配时必须停止并报告。
- worker 若发现写入分配 worktree 外、错分支/main 直接提交、跨任务污染、secret/customer-data 边界擦边或 gate 绕过迹象，必须停止当前写入，报告影响范围，并进入 incident 记录或有 spec 的 cleanup 分支。
- 过程事故达到 `docs/incidents/README.md` 的触发阈值时，必须新增 incident 记录并给出持久控制；不得只在聊天或 PR 评论中口头关闭。
- 本节是编排安全规则，不新增多人签字流程；最终范围、发布、真实账号、真实客户数据、LLM key、成本和合规风险仍由项目 owner 决定。

## 7. Authoring Contract

- 开工前必须重读本文件和目标 spec，确认触碰模块清单；未列入清单的模块默认不可改。
- 修改优先级是：就地修改或扩展现有实现，必要时抽取/合并，再考虑新增文件。
- 新增 source 文件前必须执行 `rg` 搜索，并在 PR Hygiene 表说明搜索结论和新增归属理由。
- 有价值但不进入当前 PR 的本地改动或分支，必须先转成后续 spec/PR、记录 superseded 原因，或在删除前写明“不采纳/需重做”的结论；不得留下隐藏的本地-only 待办分支。
- 外部 API、SDK、provider、connector、adapter 的行为必须有依据；新增适配器路径必须引用 ADR-B 或对应 spike/官方文档证据。
- AI agent 可以提出 `large_change_exception` 或外部依赖例外，也可以在 cleanup/refactor 测试删除候选中声明 `test_weakening_exception`，但不能自批；例外必须在 PR Hygiene 表使用精确 token 声明，项目 owner 确认只能来自分支保护要求的 review 或等价审批记录。
- PR 描述必须自报触碰模块、路径分类、源码净增、测试变更、生成物/lockfile 变更、外部 API 依据和未完成项。

## 8. PR Hygiene Budgets

- PR 预算基于 spec 的触碰模块清单；触碰模块必须是机器可读 glob/path 列表，PR 改动必须是该清单的子集，未声明模块默认不可改。
- 路径分类必须区分 `source`、`test`、`generated`、`lock`、`config`、`docs`；硬性体积配额只作用于 `source`。
- 默认源码预算：changed source files <= 12、net source LOC <= 600、new source files <= 5；spec 可声明更严预算。
- M0-01 首个治理/脚手架 PR 可豁免默认源码体积预算和 `guard:pr-shape` 强制执行；豁免仅限 monorepo/CI/模板/空骨架，不得包含业务代码，且合入后必须启用 `guard:pr-shape`。
- `test` LOC 不计入源码预算；测试文件删除、测试数量下降、新增 `.skip`/`.only`/`xit`/`xfail` 默认阻断。若测试随死码、下线功能或重构 source 同步删除，且 Spec 类型为 `cleanup` 或 `refactor`，并在 PR Hygiene 表映射被删 source，脚本可标记为 cleanup/refactor 候选；是否合理仍由 review 判定。`test_weakening_exception` 只允许这类候选通过机器初筛；其他测试弱化没有机器例外通道，必须移除弱化或拆到满足条件的 cleanup/refactor spec。
- `generated`、`lock`、migration SQL、schema 生成 DTO、快照只报数不计入源码预算；生成器、schema 和手写源代码本身仍按 `source` 计。
- gross churn（新增行 + 删除行）必须在 PR 中报告，用于评审判断；默认不设硬卡，避免惩罚合理就地替换。
- ESLint 负责复杂度和文件长度：默认 complexity <= 10，普通源文件 <= 400 行，React 组件文件 <= 250 行，Nest service/controller <= 300 行。
- 分支保护或等价机制必须要求项目 owner review；超预算、测试弱化候选或外部依赖例外没有 owner approval 不得合并。owner approval 对测试弱化候选是必要条件，不替代 cleanup/refactor 与 source 映射的机器条件。

## 9. Spike Rules

- SPK-01 Telegram Business、SPK-02 订单 API、SPK-03 RLS x Prisma x 连接池、SPK-04 双鉴权链路都必须有 ADR。
- LLM 数据处理策略必须在 M0 形成 `ADR-003-llm-data-processing.md`；未签收前不得让真实客户消息进入第三方 LLM。
- Spike 必须在真实环境或足够贴近真实的基础设施中验证；不接受纯 mock 结论。
- 时间盒到期没有结论时按不可行分支执行。
- 失败分支必须是关闭、降级、顺延、改路径或写 ADR；不得写“继续观察”。

## 10. ADR Numbering

- 技术地基 ADR 使用数字序列：`ADR-001-*`、`ADR-002-*`、`ADR-003-*`。
- 外部业务依赖使用 B 序列：`ADR-B01-*`、`ADR-B02-*`。
- 后续若新增数据/合规专题仍优先使用数字序列，除非它是某个外部平台分支。

## 11. Review Checklist

- 是否引用了正确 spec。
- 是否超出 spec 范围。
- 是否重复造轮子。
- 是否违反依赖边界。
- 是否触碰红线、权限、RLS、评测 gate。
- 是否优先就地修改，新增 source 文件是否有 `rg` 证据和归属理由。
- PR Hygiene 表是否完整，改动是否在触碰模块和源码预算内。
- 是否存在测试弱化、`.skip`/`.only`、无依据快照膨胀或 mock 扩大。
- 新增外部 API/provider/connector/adapter 是否有官方文档、spike 证据或 ADR-B。
- 是否有测试或验收证据。
- 是否留下 ADR 或 runbook 需要的操作记录。
- 是否清理或记录未合并分支，避免有价值工作停留在无 PR、无 spec、无 superseded 结论的本地状态。
