# M1-05 Eval Seed Manifest And Runner

## 目标

建立 M1 种子评测集的正式 manifest 契约、配额校验和 minimal eval runner 入口，使 G-06 的 seed quota 可以被自动化验证。该 spec 只交付评测种子 manifest/runner 基线，不提交真实样本或脱敏样本内容，不实现 M2/M3/M4 能力，不放行客户 LLM 或 GA-0。

## Owner

Owner：项目 owner 最终确认 M1-05 合并许可、owner-local 受控样本位置、正式入集签收和后续 M2/M3 智能验收是否继续推进；AI agent 执行 eval seed manifest/runner 实现、spec compliance review、code quality review、验证和证据归档。项目 owner 仍负责真实客户数据、第三方 LLM、成本、合规和生产发布决策。

## 时间盒

1 个工作日。到期若 runner 无法在不提交样本内容的前提下验证 seed quota，则关闭本实现分支或拆成 docs-only manifest PR；不得伪造真实样本，不得夹带 M2/M3/M4、GA-0 或客户 LLM 路径继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M1-05-eval-seed-manifest-and-runner.md`
- `packages/evals/**`
- `docs/evidence/M1/eval-seed/**`
- `docs/evals/**`
- `scripts/tests/**`

说明/备注：

本 PR 允许把 `packages/evals` 从占位导出升级为 M1 seed manifest/quota runner，并允许更新 existing minimal eval test 与 eval 文档入口。未列出的模块默认不可改；尤其不得修改 `packages/db/**`、`apps/api/**`、`apps/admin/**`、`packages/engine/**`、`packages/channels/**`、`packages/capabilities/**`、`packages/llm-gateway/**`、`packages/memory/**`、`packages/distill/**` 或客户样本路径。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 220、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec；新增 `docs/evals/README.md`；新增 M1-05 runner manifest evidence；就地更新 `scripts/tests/eval-gate.test.mjs`。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `packages/evals`、`eval seed`、`G-06`、`history-samples-manifest`、`M1-05`、`eval:minimal`、`eval-trigger-paths`、`docs/evals`。当前 `packages/evals/src/index.ts` 只有 M0/M1 占位导出，`scripts/tests/eval-gate.test.mjs` 是已有 minimal eval 入口，没有可复用 seed runner 实现；为遵守就地优先，本 PR 不新增 source 文件，只扩展现有 eval package 入口和 minimal eval 测试。
- 外部 API/SDK/provider/connector/adapter 依据：无新增外部 API/provider/connector/adapter；runner 不调用 LLM、不访问第三方服务、不读取客户明文。
- 是否需要例外：无。

## 文档触发检查

- 结果：触发 `docs/evals/**`。
- 判断依据：`docs/doc-gates.md`。本 PR 将 `packages/evals/**` 从空骨架升级为真实 seed quota runner，必须新增 `docs/evals/README.md` 记录 runner 契约、样本内容不得入 Git、owner-local 受控存储和 G-06 边界。

## 前置条件

- Gate 1 decision 状态为 `go__m1_platform_skeleton_only`。
- `docs/evidence/M1/eval-seed/history-samples-manifest.md` 状态为 `sample_ready__gate1_go`，且只包含聚合摘要，不包含样本内容。
- M1-01、M1-02、M1-03、M1-04 已合并到 `main`。
- 当前无 open PR，`git branch --no-merged main` 无输出；本分支从最新 `main` 创建。

## 实施步骤

1. 在 `packages/evals/src/index.ts` 定义 M1 seed quota 常量、manifest 类型、owner-local storage policy 和纯 `evaluateSeedManifest` 校验函数。
2. 将 Gate 1 复判得到的 80 条 owner-local seed review 聚合数写成不含样本内容的 manifest summary；不得记录可公开访问链接、客户明文、截图、语音、订单、电话、地址或账号。
3. 扩展 `scripts/tests/eval-gate.test.mjs`，覆盖 runner 正向通过、配额不足、脱敏残留、样本内容入 Git 和第三方 LLM 放行等 fail-closed 路径。
4. 新增 `docs/evals/README.md`，说明 runner 用法、输入边界、G-06 seed/full target 区分和客户数据红线。
5. 新增 M1-05 evidence，记录 runner manifest、配额结果、未提交样本内容、未调用第三方 LLM 和剩余 full candidate 200 target 边界。

## 通过条件

- `npm run eval:minimal`、`npm run guard:eval-triggers -- --base origin/main`、`npm run test`、`npm run typecheck`、`npm run lint` 通过。
- 如时间允许，`npm run check` 通过。
- 自动化测试证明 seed quota runner 对 Gate 1 聚合 manifest 返回 pass，对配额不足、残留敏感模式、样本内容入 Git 和第三方 LLM 放行返回 fail。
- `docs/evals/README.md` 和 M1-05 evidence 清楚记录：仓库只保存 manifest、聚合计数、配额结果和受控存储状态；真实样本和脱敏样本内容仍在 owner-local 受控存储之外，不进 Git。
- PR 不提交 raw/export/jsonl/csv 样本，不引入 M2/M3/M4/GA-0 能力，不让真实客户消息进入第三方 LLM。
- 实现完成后先做 spec compliance review，再做 code quality review。

## 失败分支

- 若 seed review 聚合数不足 60、意图不足 30、乌语/俄语不足 20 或红线不足 10：将 M1 seed 状态改为 blocked，顺延 M2/M3 智能验收；不得用合成样本伪装真实样本。
- 若发现脱敏残留或受控存储策略不满足：关闭该批次或要求重新脱敏，不得局部修补后继续签收。
- 若 runner 需要读取真实样本内容才能验证：本 PR 只保留 manifest 契约与 fail-closed runner，正式入集另开受控执行路径。
- 若 full candidate 200 target 尚未满足：M1 只关闭 seed quota 可运行与当前 seed pass，不关闭 M6 前的 1.0 full set target。

## 不做什么

- 不提交真实客户明文、截图、语音转写、订单号、电话、地址、账号、raw/export/jsonl/csv 样本或脱敏样本内容。
- 不实现 prompt、知识、模型路由、LLM provider、eval judge、blind review UI、红线看板、M2/M3/M4 能力或 GA-0 发布动作。
- 不自动写入正式知识库，不生成蒸馏候选，不读取 production 数据库或第三方 LLM。
- 不修改 platform schema、API guard、admin shell、审计/配置版本 schema 或任何业务 capability。

## 验收映射

- G-06：seed quota runner 可运行；当前 Gate 1 聚合 manifest 满足 seed >= 60、意图 >= 30、乌语/俄语 >= 20、红线 >= 10，full >= 200 仍按 M6 前目标跟踪。
- J-05：M1-05 spec、eval 文档和 evidence 滚动归档，不把种子评测集责任留到发布前集中补签。
- K-03/K-04：实现 PR 必须引用本 spec 编号，触碰模块清单约束本 PR 范围。
