# M0-01 Monorepo / CI / AGENTS 治理骨架

## 目标

在 M0 建立可被后续实现 agent 依赖的仓库地基：monorepo 目录、基础 CI、部署链路占位、`AGENTS.md`、ADR/spec/runbook 目录与模板、PR 规范和并行治理清单。当前开工包里的 `docs/` 与 `AGENTS.md` 是正式 monorepo 的治理种子，M0-01 的任务是把它们迁入或立起到真实工程仓库，并补齐 apps/packages 空骨架与 CI，不是从空白重新设计。该 spec 只交付工程治理骨架，不写任何业务功能。

## Owner

Owner：AI agent 实施和自检；项目 owner 确认 Gate 0、仓库创建和合并许可。

## 时间盒

M0 内 1-2 个工作日。若 CI/部署账号依赖未就绪，治理文档与本地门禁先完成，外部部署验证进入失败分支。

## 触碰模块/文件

- `AGENTS.md`
- `package.json`、workspace 配置、基础 lint/test/typecheck 配置
- `.github/` 或等价 CI 配置
- `apps/api`、`apps/admin`、`apps/worker`、`apps/cron` 空骨架
- `packages/db`、`packages/authz`、`packages/*` 空骨架与边界配置
- dependency-cruiser import DAG 配置
- forbidden-terms grep 或自定义 ESLint 配置
- 评测触发路径映射配置
- `docs/adr/`、`docs/specs/`、`docs/runbooks/`
- PR 模板、spec 模板、ADR 模板、runbook 索引

## 前置条件

- 确认包管理器、Node 版本、CI 运行器与仓库托管方式。
- `M0-00` 基础设施 provisioning 达到 Gate 0 最低要求；Render、Vercel、Supabase 的项目名或占位环境变量命名达成一致。
- v1.1 技术架构中的 monorepo 边界、依赖规则和 L1-L3 治理口径不再另起一套术语。
- Gate 0 Go/No-Go 记录已判定为 Go；未 Go 前不得启动 M0-01。

## 实施步骤

1. 以当前 `docs/` 与 `AGENTS.md` 为治理种子迁入正式 monorepo；迁入后保留版本、路径、签收证据和 ADR/spec/runbook 结构。
2. 搭建 monorepo 空骨架，确保各 app/package 只有入口、README 或占位测试，不包含业务 API、业务页面、业务 schema。
3. 校准 `AGENTS.md`，固化依赖规则、目录命名、禁止模式、先搜后写、spec 先行、一 PR 一 spec、schema 串行等规则。
4. 建立 CI 顺序门禁：`tsc --strict`、ESLint、dependency-cruiser、forbidden-terms、jscpd、knip、单元测试、评测触发、size-limit、Playwright。M0 可使用最小 app 或空集测试，但 job 必须可运行、失败必须阻断。
5. 将 import DAG 与词汇规则拆开实现：dependency-cruiser 只管 import 依赖；`packages/engine` 禁业务词由 grep 或自定义 ESLint 管。
6. 建立 K-02 评测触发路径映射：`prompts/**`、`packages/llm-gateway/**/routes/**`、`packages/db/**/knowledge*`、`packages/db/**/ai_member*`、`packages/evals/**`、`configs/**/ai-persona/**`、`docs/specs/**ai**`。
7. 建立 ADR/spec/runbook 模板，ADR 至少能承接 ADR-001/ADR-002/ADR-003，runbook 至少有 RLS 误配、部署回滚、CI 门禁失败的占位条目。
8. 建立 PR 模板与检查脚本：PR 必须引用 spec 编号，触碰模块清单必须存在，重复或交叉触碰时提示串行。
9. 建立部署链路占位：API、worker、cron、admin 的构建命令与环境变量清单可被 CI 调用，但不要求接真实业务流量。

## 通过条件

- 空仓库骨架可在本地和 CI 完成 typecheck/lint/test/build 流程；M0 阶段的最小测试也必须真实执行并能阻断失败。
- 当前开工包的 `docs/` 与 `AGENTS.md` 已进入正式 monorepo，且路径、签收证据、Gate 记录没有丢失。
- dependency-cruiser 能拦截一个故意跨边界 import 的负例。
- forbidden-terms 门禁能拦截 `packages/engine` 中出现业务线词汇的负例。
- size-limit 和 Playwright 在 M0 可对最小 Vite app 或空集 fixture 运行，但 job 必须真实执行、失败阻断；不要求 M0 已有 `/design` 与三核心屏。
- K-02 评测触发路径映射存在，并能在触碰路径时触发最小评测 job。
- PR 模板或 CI 能拦截无 spec 编号的 PR。
- `AGENTS.md`、ADR 模板、spec 模板、runbook 索引存在，且与 v1.1 架构术语一致。
- 部署链路至少能说明各进程的构建、启动、回滚和环境变量入口。

## 失败分支

- 若 CI 平台暂不可用，必须保留本地脚本与 CI 配置草案，并在 runbook 标明外部阻断项。
- 若 dependency-cruiser 或等价工具无法覆盖全部 import 边界，先覆盖 `admin` 禁止 import 后端包、`capabilities/*` 禁止互相 import、主链路 DAG；其余写入 ADR 待补。
- 若 forbidden-terms 无法实现，M0-01 不得通过；不能把业务词禁用伪装成 dependency-cruiser 规则。
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
- J-04/J-06：runbook 与 ADR 骨架为后续 RLS/鉴权 spike 证据归档提供入口。
