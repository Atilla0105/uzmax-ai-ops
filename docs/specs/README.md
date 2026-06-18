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
- Worktree / branch 前置条件
- 并发派发证据（仅并发 worker 或 coordinator 派发时需要）
- 事故与 closeout 记录
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

## Worktree / branch 前置条件

- 每个 worker spec 必须写明预期物理 worktree 路径、branch 名、禁止写入的 checkout，以及开工前要记录的 `pwd` / `git status --short --branch` / `git branch --show-current`。
- 并发 worker 只能在互斥物理 worktree 中执行；root/main checkout 只做协调、审计、同步、合并后清理和只读核对。
- coordinator 并发派发时，spec 或 dispatch evidence 必须记录 worktree 路径互斥、branch 互斥、触碰模块互斥；schema、lockfile、共享 config、CI/guard 脚本、全局生成物和 release/production 门禁改动必须全局串行。
- 单 worker、非并发派发的普通 spec 不需要单独 dispatch/worker plan evidence，但仍必须有 worktree/branch 前置条件。

## 事故触发与 closeout

- 以下事件达到阈值时必须进入 `docs/incidents/`：跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现。
- Incident 记录应包含发生了什么、影响、根因或未知、检测、清理、永久控制、institutionalized 状态、证据链接、owner/AI 边界。
- 里程碑 closeout 必须列出本里程碑已知 incident、清理状态、根因边界和防复发控制；没有 incident 时写 `none found in repo evidence`。
