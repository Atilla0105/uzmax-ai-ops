# M0-01 Monorepo / CI / AGENTS 治理骨架

## 目标

在 M0 建立可被后续实现 agent 依赖的仓库地基：monorepo 目录、基础 CI、部署链路占位、`AGENTS.md`、ADR/spec/runbook 目录与模板、PR 规范和并行治理清单。当前开工包里的 `docs/` 与 `AGENTS.md` 是正式 monorepo 的治理种子，M0-01 的任务是把它们迁入或立起到真实工程仓库，并补齐 apps/packages 空骨架与 CI，不是从空白重新设计。该 spec 只交付工程治理骨架，不写任何业务功能。

## Owner

Owner：AI agent 实施和自检；项目 owner 确认 Gate 0、仓库创建和合并许可。

## 时间盒

M0 内 1-2 个工作日。若 CI/部署账号依赖未就绪，治理文档与本地门禁先完成，外部部署验证进入失败分支。

## Spec 类型

infra

## 触碰模块/文件

- `AGENTS.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `eslint.config.mjs`
- `.prettierrc.json`
- `.prettierignore`
- `dependency-cruiser.config.cjs`
- `jscpd.config.json`
- `knip.json`
- `playwright.config.ts`
- `vitest.config.ts`
- `.github/**`
- `apps/api/**`
- `apps/admin/**`
- `apps/worker/**`
- `apps/cron/**`
- `packages/**`
- `scripts/**`
- `configs/**`
- PR hygiene guard：`guard:pr-shape` 或等价脚本
- 评测触发路径映射配置
- `docs/adr/`、`docs/specs/`、`docs/runbooks/`
- PR 模板、spec 模板、ADR 模板、runbook 索引
- CODEOWNERS、分支保护或等价 owner approval 机制

## 变更预算与路径分类

- M0-01 首个治理/脚手架 PR 使用一次性 bootstrap 例外：source 预算和 `guard:pr-shape` 强制执行可豁免，但必须验证 guard 正/负例，并在合入后开启强制。
- path categories：source、test、generated、lock、config、docs。
- 新增 source 文件前的 `rg` 搜索结论：当前仓库无 `apps/`、`packages/`、`scripts/` 实现资产，新增文件归属为 M0-01 空骨架与门禁脚本。
- 外部 API/SDK/provider/connector/adapter 依据：无；本 spec 不新增外部业务适配器。
- Exception：`large_change_exception`，仅限 M0-01 bootstrap，禁止业务代码混入。

## 前置条件

- 确认包管理器、Node 版本、CI 运行器与仓库托管方式。
- `M0-00` 基础设施 provisioning 达到 Gate 0 最低要求；Render、Vercel、Supabase 的项目名或占位环境变量命名达成一致。
- v1.1 技术架构中的 monorepo 边界、依赖规则和 L1-L3 治理口径不再另起一套术语。
- Gate 0 Go/No-Go 记录已判定为 Go；未 Go 前不得启动 M0-01。

## 实施步骤

1. 以当前 `docs/` 与 `AGENTS.md` 为治理种子迁入正式 monorepo；迁入后保留版本、路径、签收证据和 ADR/spec/runbook 结构。
2. 搭建 monorepo 空骨架，确保各 app/package 只有入口、README 或占位测试，不包含业务 API、业务页面、业务 schema。
3. 校准 `AGENTS.md`，固化依赖规则、目录命名、禁止模式、作者期合同、PR Hygiene Budgets、先搜后写、spec 先行、一 PR 一 spec、schema 串行等规则。
4. 建立技术架构 §12.2 的 CI 顺序门禁：`tsc --strict`、ESLint、dependency-cruiser、forbidden-terms、jscpd、knip、单元测试、评测触发、size-limit、Playwright；并补入作者期辅助门禁 formatter / `format:check` 与 `guard:pr-shape`。M0 可使用最小 app 或空集测试，但 job 必须可运行、失败必须阻断。
5. 将 import DAG 与词汇规则拆开实现：dependency-cruiser 只管 import 依赖；`packages/engine` 禁业务词由 grep 或自定义 ESLint 管。
6. 建立 K-02 评测触发路径映射：`prompts/**`、`packages/llm-gateway/**/routes/**`、`packages/db/**/knowledge*`、`packages/db/**/ai_member*`、`packages/evals/**`、`configs/**/ai-persona/**`、`docs/specs/**ai**`。
7. 建立 ADR/spec/runbook 模板，ADR 至少能承接 ADR-001/ADR-002/ADR-003，runbook 至少有 RLS 误配、部署回滚、CI 门禁失败的占位条目。
8. 建立 PR 模板与检查脚本：PR 必须引用 spec 编号，Spec 类型必须存在，`触碰模块/文件` 必须作为唯一触碰模块真源且为机器可读 glob/path 列表，重复或交叉触碰时提示串行；PR Hygiene 表必须自报路径分类、源码预算、测试变更、generated/lock/config/docs 变更、gross churn、外部 API 依据和例外状态。
9. 定义例外工件：PR Hygiene 表必须使用 `Exception: none|large_change_exception|test_weakening_exception|external_dependency_exception` 精确 token；脚本只判断 token 是否存在，项目 owner 批准由 CODEOWNERS/branch protection 或等价 review 机制执行。
10. 实现 `guard:pr-shape` 或等价脚本：按 `source`、`test`、`generated`、`lock`、`config`、`docs` 分类；只对 `source` 执行体积硬卡；测试 LOC 不计入源码预算；generated、lock、migration SQL、schema 生成 DTO、快照只报数；PR 改动必须是 spec 触碰模块清单的子集。
11. 建立测试弱化门禁：新增 `.skip`、`.only`、`xit`、`xfail`，删除测试文件或测试数量下降时阻断；若 Spec 类型为 `cleanup` 或 `refactor`，测试随死码、下线功能或重构 source 同步删除，且 PR Hygiene 表映射被删 source，脚本可标记为 cleanup/refactor 候选；是否真实合理仍由 review 判定。其他例外必须在 PR 中声明并由项目 owner 批准。
12. 建立外部适配器门禁：新增 provider/connector/adapter 路径时必须引用官方文档、已生成类型、本地 spike 证据或 ADR-B；机器脚本至少能阻断“新增适配器但无 ADR-B/spike/官方文档/生成类型依据”的 PR。
13. 建立 ESLint 复杂度和文件长度规则：complexity <= 10；普通源文件 <= 400 行；React 组件文件 <= 250 行；Nest service/controller <= 300 行。该规则由 ESLint 执行，不塞进 `guard:pr-shape`。
14. 建立 CODEOWNERS、GitHub branch protection 或等价机制，确保超预算、测试弱化和外部依赖例外不能由 AI agent 自批。
15. 明确自举顺序：M0-01 首个治理/脚手架 PR 可豁免默认源码体积预算和 `guard:pr-shape` 强制执行，但必须验证 guard 的正/负例并在合入后开启强制；该 PR 不得包含业务代码。
16. 建立部署链路占位：API、worker、cron、admin 的构建命令与环境变量清单可被 CI 调用，但不要求接真实业务流量。

## 通过条件

- 空仓库骨架可在本地和 CI 完成 typecheck/lint/test/build 流程；M0 阶段的最小测试也必须真实执行并能阻断失败。
- 当前开工包的 `docs/` 与 `AGENTS.md` 已进入正式 monorepo，且路径、签收证据、Gate 记录没有丢失。
- dependency-cruiser 能拦截一个故意跨边界 import 的负例。
- forbidden-terms 门禁能拦截 `packages/engine` 中出现业务线词汇的负例。
- size-limit 和 Playwright 在 M0 可对最小 Vite app 或空集 fixture 运行，但 job 必须真实执行、失败阻断；不要求 M0 已有 `/design` 与三核心屏。
- K-02 评测触发路径映射存在，并能在触碰路径时触发最小评测 job。
- PR 模板或 CI 能拦截无 spec 编号的 PR。
- PR Hygiene 表存在，且字段覆盖触碰模块、路径分类、source 预算、test 变更、generated/lock/config/docs、gross churn、外部 API 依据和例外状态。
- Spec 类型使用机器可读枚举：`feature`、`fix`、`refactor`、`cleanup`、`spike`、`docs`、`infra`。
- `触碰模块/文件` 是唯一触碰模块真源，使用机器可读 glob/path；`guard:pr-shape` 能用该集合判断 PR 改动是否越界。
- 测试删除的 cleanup/refactor 候选条件可机器识别：Spec 类型为 `cleanup` 或 `refactor`、同 PR 有 source 删除、PR Hygiene 表映射被删 source；最终合理性由 review 判定。
- 例外工件使用精确 token；脚本能区分无例外、超预算例外、测试弱化例外和外部依赖例外，且不把 AI 在正文写的“approved”当作 owner approval。
- `guard:pr-shape` 或等价脚本能拦截：无 spec 编号、改动超出 spec 触碰模块、source 超预算且无 owner 例外、新增适配器但无依据、测试弱化且无 owner 例外。
- `guard:pr-shape` 的路径分类正确排除 generated、lock、migration SQL、schema 生成 DTO、快照和测试 LOC；这些变更只报数，不消耗 source 预算。
- ESLint 能拦截复杂度和文件长度超限；formatter / `format:check` 能拦截未格式化变更。
- CODEOWNERS、分支保护或等价机制已配置，能要求项目 owner review；AI agent 不能自批 `large_change_exception`、`test_weakening_exception` 或外部依赖例外。
- M0-01 首个治理/脚手架 PR 的一次性豁免已在 PR Hygiene 表声明，且该 PR 只包含 monorepo/CI/模板/空骨架，不包含业务代码；后续 PR 不沿用该豁免。
- `AGENTS.md`、ADR 模板、spec 模板、runbook 索引存在，且与 v1.1 架构术语一致。
- 部署链路至少能说明各进程的构建、启动、回滚和环境变量入口。

## 失败分支

- 若 CI 平台暂不可用，必须保留本地脚本与 CI 配置草案，并在 runbook 标明外部阻断项。
- 若 dependency-cruiser 或等价工具无法覆盖全部 import 边界，先覆盖 `admin` 禁止 import 后端包、`capabilities/*` 禁止互相 import、主链路 DAG；其余写入 ADR 待补。
- 若 forbidden-terms 无法实现，M0-01 不得通过；不能把业务词禁用伪装成 dependency-cruiser 规则。
- 若 `guard:pr-shape` 无法覆盖所有 PR Hygiene 项，必须至少阻断无 spec、越触碰模块、source 超预算、测试 `.skip`/`.only`、新增适配器无 ADR-B/spike/官方文档/生成类型依据；其余写入 ADR 或 runbook 待补，且不得影响 Gate 1 的 P0 项。
- 若分支保护或 CODEOWNERS 暂不可配置，M0-01 不得以“AI 可自批例外”的状态通过；必须改用等价 owner approval 机制或顺延。
- 若触碰模块清单无法机器解析，M0-01 不得通过；不得用自由文本替代 glob/path。
- 若部署账号未就绪，不跳过治理验收；只把 J-01 的真实回滚演练标为外部依赖未签收。

## 不做什么

- 不实现客户、会话、订单、知识库、AI 成员、权限 UI 等业务功能。
- 不创建业务数据库 schema 或业务种子数据。
- 不接 Telegram、订单 SaaS、LLM provider 的真实能力。
- 不写业务文案、prompt、人设或评测集内容。

## 验收映射

- K-01：依赖治理 CI 负例必须失败。
- K-02：评测治理先建立可运行的路径触发与最小阻断规则，不实现具体评测内容。
- K-03：PR 必须引用 spec 编号，一 PR 一 spec。
- K-04：spec 触碰模块清单用于并行治理，schema 改动声明全局串行。
- 作者期补充验收项：PR Hygiene Budgets、`guard:pr-shape`、formatter、ESLint 复杂度/文件长度和 owner approval 是 M0-01 内部治理补丁，不新增验收矩阵编号；待下一次合法基线修订时，与技术架构 §12.2 和验收矩阵 K 系列一并收编。
- J-04/J-06：runbook 与 ADR 骨架为后续 RLS/鉴权 spike 证据归档提供入口。
