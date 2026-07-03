# M7-UI-00A Fixture Sanitization Map

## 目标

为 M7 UI 迁移第一波建立 fixture / sensitive sample sanitization map，明确 owner 当前原型 `/Users/atilla/Downloads/运营塔台1.0.html` 和原始母版源码 `/Users/atilla/源码/unpacked 6` 中的样本数据风险类别、可保留 UI 结构边界、必须替换为合成 fixture 的边界，以及后续 page worker 的验收规则。

本 slice 只产出 docs/evidence，不实现代码、不迁移页面、不提交原型原始文件、不复制完整疑似敏感值。

## Owner

Owner：项目 owner 决定最终范围、真实账号、真实客户数据、真实订单数据、LLM key、成本、合规和发布风险。

Owner 确认点：

- 后续 UI page worker 只能把 owner 原型和 `unpacked 6` 当作视觉、结构、组件、交互和状态源，不能把其中的客户、订单、联系方式、payload、URL 或平台样本文案当作可迁移数据源。
- 后续截图、测试、fixture 和 evidence 必须能证明使用的是合成数据或 redacted placeholder。
- 真实/半真实样本是否需要人工留存、删除、重采样或合规处理，不由 AI agent 自行决定。

AI agent 执行/复核责任：

- 读取 `AGENTS.md`、M7-05 spec/evidence 和当前 admin fixtures/tests/evidence 结构。
- 只读扫描 `/Users/atilla/Downloads/运营塔台1.0.html` 与 `/Users/atilla/源码/unpacked 6`，记录类型、路径和计数，不记录完整疑似敏感值。
- 产出 `docs/admin-ui-fixture-sanitization-map.md` 和本 slice evidence。
- 复核本 slice diff 只包含允许的 3 个 docs 文件。

## 时间盒

0.25 个工作日。若需要实现 fixtures、修改 tests、迁移页面、移动/格式化 `unpacked 6`、人工判定真实客户数据处置、或写入 README/索引/source/test，停止并交回 coordinator 拆分后续 spec。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-00A-fixture-sanitization-map.md`
  - `docs/evidence/M7/M7-UI-00A-fixture-sanitization-map.md`
  - `docs/admin-ui-fixture-sanitization-map.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 可只读读取 `AGENTS.md`、M7-05 spec/evidence、`docs/admin-design-system.md`、`docs/evidence/M7/README.md`、`apps/admin/**`、现有 tests/evidence，以及 owner 输入源 `/Users/atilla/Downloads/运营塔台1.0.html` 和 `/Users/atilla/源码/unpacked 6`。
  - `/Users/atilla/源码/unpacked 6` 必须冻结，不得修改、移动、格式化或写入。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files = 0、net source LOC = 0、new source files = 0。
- test/generated/lock/config 预计变更：0。
- docs 预计变更：新增 3 个 docs/evidence 文件。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已只读检索现有 admin tests/source 中的 synthetic / controlled-ref / forbidden-sample 约束，确认本 slice 应产出 docs map 而非新增 runtime fixture 文件。
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：`new doc required`。
- 判断依据：M7-05 已将 owner 原型和 `unpacked 6` 提升为后续 UI 视觉源；这些输入包含样本数据风险信号。后续 UI worker 需要 repo 内固定清理图，避免将 raw/prototype samples 复制到 source、tests、screenshots 或 evidence。

## 前置条件

- 已读取 `AGENTS.md`。
- 已读取 `docs/specs/M7-05-prototype-visual-source-reset.md`。
- 已读取 `docs/evidence/M7/M7-05-prototype-visual-source-reset.md`。
- 已只读核对当前 repo 中 admin source/tests/evidence 相关结构。
- Worktree / branch：
  - worker worktree: `/Users/atilla/.codex/worktrees/m7-ui-01-fixture-sanitization-map/UZMAX智能运营`
  - worker branch: `codex/m7-ui-00a-fixture-sanitization-map`
  - forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
  - entry evidence:
    - `pwd` = `/Users/atilla/.codex/worktrees/m7-ui-01-fixture-sanitization-map/UZMAX智能运营`
    - `git status --short --branch` = `## codex/m7-ui-00a-fixture-sanitization-map`
    - `git branch --show-current` = `codex/m7-ui-00a-fixture-sanitization-map`
- 并发派发证据：assigned worker path and branch are unique for this spec; this docs-only slice touches only the three listed files and does not modify shared source, tests, lockfiles, config, generated artifacts, release gates or runtime code.
- 事故触发器：若发现写入 root/main、写到分配 worktree 外、修改 `unpacked 6`、复制完整疑似敏感值、修改 source/test/README/index、或绕过 guard，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 记录并核对 worker `pwd`、`git status --short --branch`、`git branch --show-current`。
2. 读取 AGENTS、M7-05 spec/evidence 和当前 admin tests/source/evidence 中的 fixture/synthetic 约束。
3. 对 HTML 与 `unpacked 6` 执行只读 regex/count/path 扫描，输出类别和计数，不输出完整命中值。
4. 新增 `docs/admin-ui-fixture-sanitization-map.md`，定义可保留/必须替换边界、合成 fixture 命名、脱敏规则和后续 page worker 验收要求。
5. 新增本 evidence，记录扫描命令、命中类型、保守判断、未完成项和 open PR 检查限制。
6. 运行 `git diff --check`。
7. 尝试运行 `guard:pr-shape`，base 使用 `codex/m7-05-prototype-visual-source-reset`，spec 使用本文件；若失败，记录原因。

## 通过条件

- 本 spec、evidence 和 `docs/admin-ui-fixture-sanitization-map.md` 存在，且只改这 3 个文件。
- `docs/admin-ui-fixture-sanitization-map.md` 覆盖客户名、电话、邮箱、Telegram/社媒、订单号、金额、地址、国家/城市、物流轨迹、商户/组织名、API/secret/URL、真实平台文案等样本类别。
- 文档明确区分可保留 UI 标签/结构与必须替换为 synthetic fixture 的样本值。
- 文档明确后续 fixture 命名与脱敏规则，包括 synthetic tenant/customer/order identifiers、固定假数据格式、禁止 raw/export/jsonl/csv 样本入库。
- 文档明确未来 page worker 的验收要求：不得复制真实/半真实样本；截图/测试数据必须可证明为合成；权限/客户数据边界必须保留。
- 文档不泄露完整疑似敏感值，只记录类型、路径、redacted 示例和计数。
- `git diff --check` 通过；`guard:pr-shape` 运行成功或 evidence 记录失败原因。

## 失败分支

- 若输入源不可读：记录不可读路径和系统错误，保守要求 future worker 不得使用该输入源中的任何样本值。
- 若扫描命中疑似 secret/customer/order data 但无法确认真假：按敏感处理，只允许 redacted type/count/path 记录。
- 若需要迁移 fixture 或改测试才能落实规则：停止并拆到后续 implementation spec。
- 若 `guard:pr-shape` 因本地依赖、base 分支或工具不可用失败：记录命令和失败原因，不扩大 scope。
- 若发现 `unpacked 6` 已被本 worker 写入或移动：停止并进入 incident 记录。

## 不做什么

- 不改 `apps/admin/**`、`packages/**`、runtime source、tests、lockfiles、config、generated artifacts、README 或 docs indexes。
- 不提交、push、merge。
- 不移动、格式化、复制或写入 `/Users/atilla/源码/unpacked 6`。
- 不提交 `/Users/atilla/Downloads/运营塔台1.0.html` 或 `unpacked 6` 的 raw source。
- 不把完整客户名、电话、邮箱、订单号、地址、tracking、secret、URL、payload、jsonl/csv/xlsx/export 样本文本写入 repo。
- 不批准 GA-0、production、真实客户流量、customer LLM、Telegram Business 自动回复或 1.0 release。

## 验收映射

- I-05: 支持后续 UI token/living spec/visual migration 的样本安全前置，但本 slice 不关闭 I-05。
- K-03/K-04: one spec / one branch / docs-only scope。
- M7-05: 承接 prototype visual-source reset 的敏感样本边界，不改变视觉源优先级。

## Closeout / Incident 记录

This worker encountered and repaired a patch-target write-boundary issue: the first `apply_patch` invocation created the three intended files in root/main instead of the assigned worker worktree. The files were removed from root/main, recreated in the assigned worker, and evidence records the limitation. A separate coordinator incident record is required because `docs/incidents/README.md` treats root/main write-boundary events as incident-triggering.
