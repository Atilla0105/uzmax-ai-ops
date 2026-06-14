# Specs

每个 spec 是一个可交付、可验收、可排期的最小工作单元。一个 PR 只允许实现一个 spec。

## 新建或实质更新 spec 必填字段

- 目标
- 项目 owner 确认点与 AI agent 执行/复核责任
- 时间盒
- Spec 类型
- 触碰模块/文件
- 变更预算与路径分类
- 文档触发检查
- 前置条件
- 实施步骤
- 通过条件
- 失败分支
- 不做什么
- 验收映射

## 并行规则

- 触碰模块有交集的 spec 禁止并行。
- `packages/db` schema 变更为全局串行点。
- 没有失败分支的 spec 不能开工。
- Spec 类型必须是 `feature`、`fix`、`refactor`、`cleanup`、`spike`、`docs`、`infra` 之一。
- `触碰模块/文件` 是唯一触碰模块真源，必须是机器可读 glob/path 列表；自由文本说明只能写在备注里，`guard:pr-shape` 不读取。
- 变更预算缺失时使用 `AGENTS.md` 的默认 PR Hygiene Budgets。
- 文档触发检查只写 `none`、`updated` 或 `new doc required`；判断依据是 `docs/doc-gates.md`，不是人工长文说明。
- 活跃 spike spec 使用 `SPK-xx` 作为文件名和引用 ID；历史 cleanup/infra spec 可以保留原合并时的 `M0-xx` 编号。
