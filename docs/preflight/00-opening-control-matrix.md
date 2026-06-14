# UZMAX 智能运营系统开工控制矩阵

> 版本：v1.1 开工准备  
> 依据：`UZMAX智能运营系统-PRD-v1.1.md`、`UZMAX智能运营系统-技术架构-v1.1.md`、`UZMAX智能运营系统-后台设计与前端架构-v1.1.md`、`UZMAX智能运营系统-1.0验收矩阵-v1.1.md`  
> 适用范围：正式工程仓库创建前，到允许进入 M1 业务骨架前。  

## 0. 控制原则

- 开工顺序固定为：文档签字 -> 基础设施 provisioning -> Gate 0 -> M0 治理骨架 -> SPK-03 -> SPK-04 -> LLM 数据处理 ADR -> M1 平台骨架准备。
- 闸门闭合必须严格串行：OCM-00 闭合 -> OCM-00A 闭合 -> Gate 0 复判。账号和 manifest 草稿可以提前准备，尤其是 Supabase dev，但 OCM-00A 不得早于 OCM-00 闭合。
- 本项目只有一个真人决策者：项目 owner。技术、AI、运营、设计/前端、DevOps 是检查视角和工作类型，不是多人签字卡点。
- AI agents 负责执行、复核、产证据和暴露风险；不得替项目 owner 做最终范围、发布、真实账号、真实客户数据和成本风险决策。
- 1.0 是可正式运营版本，不按 MVP 口径缩水；M0-M6 是内部推进闸门，不是外部分期发布。
- 关键输入不后补；历史样本、教程素材、真实账号、订单资料、双语话术、验收签收延迟时，对应闸门顺延。
- 失败分支不得写“继续观察”。任何失败只能在关闭、降级、顺延、改路径、写 ADR 中选择一种或多种闭环动作。
- Owner 默认指项目 owner；执行方、复核方和证据生产方可标为 AI agent 或具体工具链。

## 1. 开工顺序矩阵

| 编号 | 事项 | 决策/执行 | 时间盒 | 开始条件 | 通过条件 | 失败分支 | 产出物 | 阻断等级 |
|---|---|---|---|---|---|---|---|---|
| OCM-00 | 文档签字与 1.0 口径冻结 | 项目 owner 决策；AI agent 复核 hash、修订记录和跨文档一致性 | 0.5 天 | 四份 v1.1 正式文档齐备；技术架构如有签字前实质修订，必须已有修订记录或版本 bump | 四份 v1.1 文档被确认为唯一开工基线；1.0 非 MVP、内部平台边界、non-goals、P0/P1/P2 规则、关键输入清单均被项目 owner 接受；无未解释的跨文档冲突 | 未确认则顺延 Gate 0；发现范围冲突则写 ADR 后再确认；外部 SaaS/营销能力误入范围则关闭该范围；关键输入缺失则顺延对应闸门；发现静默基线变更则补修订记录并重新生成 hash | 文档签收记录；开工范围确认；关键输入责任表 | P0 |
| OCM-00A | 基础设施账号与环境 provisioning | 项目 owner 提供账号/密钥决策；AI agent 填 manifest、检查缺口和失败分支 | 1 个工作日 | OCM-00 已进入审阅；项目 owner 可访问或可创建 Git/CI、Supabase、Render、Vercel、Sentry/日志、LLM provider、Telegram Bot 管理入口；闭合前必须 OCM-00 已通过 | OCM-00 已闭合；Gate 0 最低环境满足：Git/CI 可用、Supabase dev 可用于 SPK-03/04、LLM key 策略进入 ADR-003、Telegram 测试 bot 准备或有明确顺延记录；所有环境有 manifest、密钥保管方式、失败分支 | Git/CI 不可用则关闭 Gate 0；Supabase dev 缺失则顺延 SPK-03/04；LLM key 策略不明则禁止真实客户消息进 LLM；Telegram 测试号缺失则顺延 Bot/Business spike；若 OCM-00 确认后改动技术栈，则回炉对应 manifest；改路径必须写 ADR | `docs/preflight/03-infrastructure-provisioning.md`；`docs/evidence/M0/infra/*` manifest | P0 |
| Gate 0 | 允许创建正式工程仓库/CI | 项目 owner 最终判定；AI agent 逐项复判并更新证据 | 立即判定 | OCM-00 与 OCM-00A 通过 | 满足“Gate 0 判定条件”六项后，产出 Go/No-Go 记录并归档，才允许创建正式工程仓库、初始化 CI、建立治理目录；不得开始业务能力实现 | 任一条件不满足则关闭正式仓库创建；需要补充决策时写 ADR；输入延迟时顺延；CI 平台不可用时改路径但不得跳过门禁；不得以口头复判替代记录 | Gate 0 Go/No-Go 记录 | P0 |
| OCM-01 | M0 治理骨架 | AI agent 实施；项目 owner 确认风险和合并许可 | 1-2 天 | Gate 0 已通过；正式工程仓库/CI 创建权限已放行；当前 `docs/` 与 `AGENTS.md` 作为种子可迁入正式 monorepo | 仓库根目录具备 `AGENTS.md`；`docs/adr/`、`docs/specs/`、PR 模板、spec 编号规则、批准规则完成；CI 门禁清单见技术架构 §12.2；无业务能力代码混入 M0 | 治理文件缺失则顺延 M0 关闭；CI 阻断项不可实现则改路径并写 ADR；业务代码混入则关闭该变更；P0 门禁不得降级为占位 | M0 治理骨架；CI 门禁清单；PR/spec 模板；初始 ADR 索引 | P0 |
| OCM-02 | SPK-03：RLS x Prisma x 连接池 | AI agent 执行 spike 和压测；项目 owner 确认隔离风险 | 2 个工作日 | M0 治理骨架可用；测试数据库、双租户样例、Prisma/RLS spike 分支准备完成 | 证明事务内 `set_config(key, value, true)` 查询后随事务结束清除；Prisma 采用 `$transaction` 包裹或 Client Extension 统一注入二选一；两个租户上下文各 1000 请求交错压测零串话；压测进入 CI 常驻；结论写入 ADR-001 | transaction mode 失败则按 session mode 专用连接池、关键路径直连、repository 强制隔离 + RLS 纵深防御顺序改路径；仍无法证明零串话则关闭 M1 开工授权并写 ADR；只得到 mock 结论则顺延，不允许通过 | ADR-001；RLS/连接池压测报告；CI 常驻用例；隔离风险说明 | P0 |
| OCM-03 | SPK-04：双鉴权链路 | AI agent 执行 spike；项目 owner 确认权限和数据风险 | 1.5 个工作日 | SPK-03 已给出可执行隔离方案；鉴权、租户切换、WebSocket、Storage 签名 URL spike 样例准备完成 | 验证 JWT -> 后端 guard -> `AccessContext` -> RLS 会话变量全链路；覆盖 HTTP、WebSocket、token 刷新、租户切换缓存失效、Supabase Storage 签名 URL 租户校验；结论写入 ADR-002；关键路径测试进入 CI | 任一链路缺口则改路径并写 ADR；Storage 签名 URL 不能保证租户校验则降级为关闭敏感文件路径或改为后端代理；token/缓存缺陷未修复则顺延 Gate 1；无法证明业务权限唯一事实源则关闭 M1 开工授权 | ADR-002；双鉴权链路测试报告；HTTP/WS/Storage 覆盖清单；CI 常驻用例 | P0 |
| OCM-03A | LLM 数据处理 ADR | AI agent 起草和取证；项目 owner 确认真实客户数据与成本风险 | 1 个工作日 | LLM provider 候选、key 管理、留存/区域/日志策略可查；红线字段和 PII 字段初稿存在 | ADR-003 明确哪些数据可进 LLM、PII/redaction、zero-retention/retention、区域、trace 脱敏、fallback provider 同策略、失败分支；真实客户消息进入 LLM 前可执行 | provider 不满足策略则关闭该 provider 或限制任务类型；PII redaction 未实现则禁止真实客户消息进入 LLM；区域/留存无法确认则顺延 GA-0 与生产流量 | `docs/adr/ADR-003-llm-data-processing.md`；`docs/evidence/M0/llm-data-processing/*` | P0 |
| OCM-04 | M1 平台骨架准备 | AI agent 拆 spec；项目 owner 确认范围和开工授权 | 1-2 天 | SPK-03 与 SPK-04 均通过；ADR-001/ADR-002/ADR-003 已签收；M0 CI 和治理目录可用 | M1 scope 明确为 org/tenant/authz/schema、集团层/租户层壳、审计、配置版本、种子评测集；对应 `docs/specs/` 已拆分且一 spec 一 PR；历史真实咨询样本导出责任与截止时间明确；集团层/租户层壳、发布与验收控制台入口、审计/配置版本方案完成准备；无 M2/M3 业务能力提前混入 | M1 spec 过大则降级拆分；历史样本未确认则顺延 M1 智能能力相关工作并写 ADR；平台骨架依赖缺失则改路径；M2/M3 能力混入则关闭该范围；P1 残项必须有项目 owner 确认、修复日期和风险说明 | M1 readiness pack；M1 spec 清单；项目输入排期；平台骨架边界说明 | P0 |
| Gate 1 | 允许进入 M1 业务骨架 | 项目 owner 最终判定；AI agent 逐项复判并更新证据 | 立即判定 | OCM-01 至 OCM-04 全部完成；ADR-001/ADR-002/ADR-003 和 CI 证据齐备 | 满足“Gate 1 判定条件”全部条目后，才允许实现 M1 业务骨架相关 PR；仍不得进入 M2 渠道、M3 AI 能力、M4 订单客户能力 | 任一 P0 未过则关闭 M1 业务骨架开工；可替代路径明确时改路径并写 ADR；输入延迟时顺延；非阻断残项只能降级为 P1/P2 并带项目 owner 确认、修复日期和风险说明 | Gate 1 Go/No-Go 记录；M1 开工授权 | P0 |

OCM-02 的执行 spec 为 `docs/specs/SPK-03-rls-prisma-pool.md`。`M0-02` 保留给已合入的治理 cleanup 历史记录，不再作为 RLS spike 的活跃 spec 编号。

## 2. Gate 0 判定条件

Gate 0 名称：**允许创建正式工程仓库/CI**。

只有以下条件全部满足时，Gate 0 才能判定为 Go：

1. 四份 v1.1 文档均完成项目 owner 确认，并被确认为唯一正式开工基线。
2. 1.0 非 MVP、内部平台边界、non-goals、关键输入不后补、P0 阻断规则已被项目 owner 接受。
3. 基础设施 provisioning 已达到 Gate 0 最低要求：Git/CI 可用、Supabase dev 可用、LLM key 策略进入 ADR-003、Telegram 测试 bot 准备或有明确顺延记录。
4. 正式工程仓库的首批动作仅限 M0 治理骨架：monorepo/CI、`AGENTS.md`、`docs/adr/`、`docs/specs/`、PR 模板、门禁脚本与最小可运行测试。
5. 已明确 SPK-03、SPK-04 和 ADR-003 必须在 M0 完成。
6. 已明确失败处理方式：关闭、降级、顺延、改路径、写 ADR；不得使用“继续观察”作为结论。

Gate 0 No-Go 时：

- 不创建正式工程仓库/CI，或关闭已创建但未进入协作的空仓库。
- 文档冲突由 AI agent 提出修订方案，项目 owner 确认后写 ADR 或修订签收记录。
- 项目 owner 输入缺失时顺延，不允许以“后补”替代确认。

## 3. Gate 1 判定条件

Gate 1 名称：**允许进入 M1 业务骨架**。

只有以下条件全部满足时，Gate 1 才能判定为 Go：

1. M0 治理骨架已通过，仓库根目录具备 `AGENTS.md`，`docs/adr/`、`docs/specs/`、PR 模板和 spec 编号规则可用。
2. CI 已能实际执行并阻断技术架构 §12.2 的 L2 机器执法清单；M0 阶段可以使用最小 app 或空集测试，但 job 必须可运行、失败必须阻断，不允许仅做占位追踪。
3. SPK-03 通过：RLS x Prisma x 连接池压测证明双租户交错请求零串话，测试进入 CI 常驻，ADR-001 已确认。
4. SPK-04 通过：JWT -> 后端 guard -> `AccessContext` -> RLS 会话变量链路覆盖 HTTP、WebSocket、token 刷新、租户切换缓存失效、Storage 签名 URL 校验，ADR-002 已确认。
5. ADR-003 已确认：真实客户消息进入第三方 LLM 的 PII、留存、区域、trace、fallback provider 和失败分支明确。
6. M1 readiness pack 已确认，M1 仅覆盖 org/tenant/authz/schema、集团层/租户层壳、审计、配置版本、种子评测集准备，不夹带 M2/M3/M4 能力。
7. 历史真实咨询样本导出、种子评测集责任、验收证据归档方式已明确；任何延迟都已经写 ADR 或顺延对应闸门。
8. 当前无 P0 残项；P1/P2 残项如存在，必须有项目 owner 明确确认、修复截止日期和风险说明。

Gate 1 No-Go 时：

- 关闭 M1 业务骨架开工授权，不允许以局部实现绕过 M0/SPK 结论。
- 隔离或鉴权路径不成立时改路径并写 ADR。
- 项目 owner 输入缺失时顺延；非阻断体验项可降级，但必须写明风险和修复日期。

## 4. 交付归档要求

- 每个编号项关闭时必须归档证据链接、项目 owner 确认状态、阻断项、ADR 链接。
- Gate 0 与 Gate 1 的 Go/No-Go 记录必须进入发布与验收控制台的证据链。
- 后续 M1-M6 不得把 P0 证据集中堆到 M6；每个里程碑关闭时当场签收归档。
