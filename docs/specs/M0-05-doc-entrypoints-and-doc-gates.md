# M0-05 Doc Entrypoints and Doc Gates

## 目标

建立 UZMAX 文档按真实能力生长的入口和触发机制。PR1 只补人类入口、安全入口、doc-gate 触发矩阵和轻量模板字段；PR2 在 PR1 被 dogfood 后再实现机器 guard。本文档不一次性创建未来的 eval/contracts/env/observability/release 手册。

## Owner

Owner：项目 owner 确认文档触发原则和合并许可；AI agent 执行、复核范围，并产出验证证据。项目 owner 仍是唯一真人决策者，AI agent 不得把文档触发字段当作范围或发布审批。

## 时间盒

PR1：0.5 个工作日。

PR2：PR1 dogfood 至少一次后另行实施；若触发规则误报或仍不稳定，PR2 顺延，不得直接 hard-fail。

## Spec 类型

docs

## 触碰模块/文件

- `README.md`
- `SECURITY.md`
- `docs/README.md`
- `docs/doc-gates.md`
- `docs/specs/README.md`
- `docs/specs/SPEC-template.md`
- `docs/specs/M0-05-doc-entrypoints-and-doc-gates.md`
- `.github/pull_request_template.md`

说明/备注：

本触碰清单仅覆盖 PR1。PR2 若实现 guard:doc-triggers，必须先更新本 spec 或另开后续 spec，使相关 guard、test、package 和 CI 路径进入机器可读触碰清单。

PR1 不清理重复副本、macOS 元数据或其他噪声文件；此类 cleanup 必须另开 cleanup spec/PR。

未列出的模块默认不可改。

## 变更预算与路径分类

- path categories：docs。
- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增根 README、薄 SECURITY、doc-gate 矩阵；更新 docs/spec 索引与 PR 模板。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated。
- 判断依据：本 PR 自身建立 `docs/doc-gates.md` 和模板字段，不因空骨架提前创建未来手册。
- 备注：PR/spec 中的 Documentation triggers 字段只是 forcing function；PR2 以后以 `guard:doc-triggers` 对当前 repo 树的推导结果为权威。

## 前置条件

- M0-01 已合入 main，仓库具备 `AGENTS.md`、docs/specs、PR 模板和 guard 基础。
- Gate 0 只放行 M0 治理/CI 骨架，不放行业务能力实现。
- 不把通用最佳实践清单当作必须立即存在的项目文档。

## 实施步骤

1. 新增根 `README.md`，作为人类入口，说明项目定位、当前阶段、安装/检查命令、文档地图和当前禁止事项。
2. 新增极薄 `SECURITY.md`，只提供漏洞、secret 和真实客户数据入口，并引用 ADR-003 与 secret 轮换 runbook；不复写完整数据处理政策。
3. 新增 `docs/doc-gates.md`，定义文档触发矩阵，强调真实能力/路径/闸门出现后再补对应文档。
4. 更新 `docs/README.md`，把 `docs/doc-gates.md` 纳入文档地图和事实主源说明。
5. 更新 `docs/specs/README.md` 与 `docs/specs/SPEC-template.md`，增加条件式“文档触发检查”，未命中 doc-gate 时写 `none`。
6. 更新 PR 模板，增加 `Documentation triggers: none / updated / new doc required` 提醒，并声明该字段不是权威真源。

## 通过条件

- 根 `README.md` 能让新人知道项目是什么、当前阶段、怎么检查、读哪些文档。
- `SECURITY.md` 只做入口，不复写 ADR-003。
- `docs/doc-gates.md` 说明何时补文档、为什么不提前补，以及 PR2 guard 必须是当前 repo 树存在性检查。
- spec 模板有条件触发检查，不制造每个 spec 都填长声明的仪式；未命中时可写 `none`。
- PR 模板的 Documentation triggers 是提醒，不成为事实主源。
- docs-only validation 按当前仓库规则跑通，至少执行 `npm run format:check`、`npm run guard:pr-shape -- --base origin/main` 和 `git diff --check`。

## 失败分支

- 若 PR1 文档入口开始复写 PRD、技术架构、验收矩阵或 ADR-003 正文，关闭该重复内容，改为链接事实主源。
- 若 doc-gate 矩阵要求提前创建空的 eval/contracts/observability/release 手册，删除该要求并恢复为触发条件。
- 若发现模板字段导致所有 spec 都写仪式化长声明，收紧为 `none / updated / new doc required`。
- 若 PR2 guard 误报率高，先 observation 或顺延；不得一次性把所有未来文档 gate hard-fail。

## 不做什么

- 不一次补齐 12 份文档。
- 不创建空的 `docs/evals/README.md`、`docs/contracts/README.md`、`docs/observability.md`、`docs/release.md` 等未来手册。
- 不实现 `scripts/guards/doc-trigger-paths.mjs`。
- 不修改 `package.json`、`npm run check` 或 CI。
- 不让 PR body 或 spec 人工字段成为 doc-gate 权威真源。
- 不把空骨架当真实能力触发。
- 不清理重复副本文件或其他噪声文件。

## 验收映射

- K-03：PR 继续引用 spec，并保持一 PR 一 spec 的治理入口。
- K-04：doc-gate 触发矩阵服务于后续并行/阶段治理，PR1 只建立低风险文档入口。
- J-04/J-05：安全入口、文档地图和未来 release/gate 文档触发条件为后续 runbook、发布证据归档提供入口。
