# M7-06 M7 UI Worker Boundary Incident

## 目标

记录 2026-07-02 M7 UI preflight workers 中发生的 root/main patch-target 写入边界事故，形成 repo 内可回查的 incident、evidence 和后续控制。

本 slice 只补充事故记录，不修改 UI source、不修改 worker 产物、不清理或合并其他分支。

## Owner

Owner：项目 owner 决定最终风险接受、发布、真实账号、真实客户数据、LLM key、成本和合规决策。

AI agent 责任：记录事实、影响、清理状态、未知边界和永久控制，避免只靠聊天记忆关闭过程事故。

## 时间盒

0.25 个工作日。若需要修改 guard、CLI 工具、worker runtime 或跨分支合并，停止并拆后续 spec。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-06-m7-ui-worker-boundary-incident.md`
  - `docs/evidence/M7/M7-06-m7-ui-worker-boundary-incident.md`
  - `docs/incidents/INC-2026-07-02-m7-ui-root-patch-target.md`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files = 0、net source LOC = 0、new source files = 0。
- test/generated/lock/config 预计变更：0。
- docs 预计变更：新增 3 个 docs/evidence/incident 文件。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`。
- 判断依据：`docs/incidents/README.md` 明确将写到分配 worktree 外、root/main checkout 或错分支列为 incident 记录阈值。

## 前置条件

- 已读取 `AGENTS.md`、`docs/incidents/README.md`、`docs/incidents/INCIDENT-template.md`。
- 已只读核对 M7-UI-00A 和 M7-UI-00B worker evidence 中的 root patch-target 记录。
- Worktree / branch：
  - worker worktree: `/Users/atilla/.codex/worktrees/m7-06-m7-ui-worker-boundary-incident/UZMAX智能运营`
  - worker branch: `codex/m7-06-m7-ui-worker-boundary-incident`
  - forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
  - entry evidence:
    - `pwd` = `/Users/atilla/.codex/worktrees/m7-06-m7-ui-worker-boundary-incident/UZMAX智能运营`
    - `git status --short --branch` = `## codex/m7-06-m7-ui-worker-boundary-incident`
    - `git branch --show-current` = `codex/m7-06-m7-ui-worker-boundary-incident`

## 实施步骤

1. 记录 entry state。
2. 读取 incident 规则、模板和相关 worker evidence。
3. 新增 incident 文件，覆盖发生了什么、影响、根因/未知、检测、清理、永久控制、证据链接和 owner/AI 边界。
4. 新增本 evidence。
5. 运行 `git diff --check`。
6. 运行 `guard:pr-shape`，base 使用 `codex/m7-05-prototype-visual-source-reset`。

## 通过条件

- 只改本 spec、M7 evidence 和 incident 文件。
- Incident 记录 M7-UI-00A 与 M7-UI-00B 的 root/main patch-target 事实。
- Incident 明确 root/main 已恢复干净，但这不取消记录义务。
- Incident 不声称未证明的时间线、CI、PR 或生产影响。
- `git diff --check` 和 `guard:pr-shape` 通过。

## 失败分支

- 若证据不足以证明具体文件，记录 unknown，不扩大事实。
- 若发现 root/main 仍有残留，停止并清理或拆 cleanup spec。
- 若需要工具级 guard 改造，记录 follow-up，不在本 slice 实现。

## 不做什么

- 不修改 `apps/admin/**`、`packages/**`、worker 文档产物、README、M7 evidence index、lockfile、config 或 generated files。
- 不提交、push、merge。
- 不批准 GA-0、production、真实客户数据、customer LLM、Telegram Business 自动回复或 1.0 release。

## 验收映射

- K-03/K-04：one spec / one branch / docs-only scope。
- Workspace isolation：记录并控制 root/main patch-target 写入边界事故。

## Closeout / Incident 记录

- Incident: `docs/incidents/INC-2026-07-02-m7-ui-root-patch-target.md`
