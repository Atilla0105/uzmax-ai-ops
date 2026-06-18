# Incidents

本目录记录影响交付治理、安全边界或发布门禁可信度的过程事故。Incident 记录不是 blame 文档，也不是新增多人签字流程；它用于把已发生的问题、已清理状态、未知边界和永久控制留在 repo 里，避免只靠聊天记忆。

## 何时必须记录

以下任一情况达到阈值时，必须新增或更新 incident：

- 跨任务污染：一个 worker 的改动、缓存、依赖、生成物或 git 状态影响另一个 spec/worker。
- 写到分配 worktree 外：包括 root/main checkout、其他 worker worktree 或未授权路径。
- 错分支或 main 直接提交：worker 编辑发生在非 spec 指定 branch，或直接在 main/root checkout 承载实现。
- secret/customer-data 边界擦边：敏感值、真实客户数据、raw payload、截图、语音、个人账号等进入不该进入的路径，哪怕最终被移除。
- gate 绕过：通过删测试、弱化断言、扩大 mock、跳过 guard、伪造证据或错误使用 PR/CI 状态让门禁失真。
- 同一过程失败在一个里程碑内重复出现，或一次失败暴露了可复发的编排缺陷。

## 记录要求

每个 incident 应覆盖：

- 发生了什么：只写可证明事实和明确来源。
- 影响：对代码、文档、CI、发布、数据或交付可信度的实际或潜在影响。
- 根因 / 未知：区分已确认根因、结构性失败模式和无法从 repo 证明的时间线。
- 检测：谁或什么 evidence 发现了问题。
- 清理：已经移除、恢复、验证的内容，以及仍未验证的边界。
- 永久控制：规则、模板、guard、runbook 或流程控制；写清是否已落地。
- Institutionalized 状态：`draft`、`pending_merge`、`institutionalized_in_docs`、`guarded`、`superseded` 之一。
- 证据链接：spec、evidence、PR、CI、commit 或命令记录。
- Owner / AI 边界：AI 负责记录、清理和控制建议；项目 owner 负责最终风险接受、范围、发布和真实数据/账号/成本/合规决策。

## 命名

- 文件名：`INC-YYYY-MM-DD-short-slug.md`。
- 一个文件记录一个事故或一组同根因的紧密事故。
- 如果后续 guard 或 runbook 接管控制，在原 incident 中追加状态变化，不另写平行真源。
