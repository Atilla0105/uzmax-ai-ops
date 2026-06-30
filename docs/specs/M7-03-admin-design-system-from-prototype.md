# M7-03 Admin Design System From Prototype

## 目标

基于 owner 提供的原型文件 `/Users/atilla/Downloads/uzmax需求的原型设计/UZMAX 运营塔台.dc.html` 与 `/Users/atilla/Downloads/uzmax需求的原型设计/support.js`，生成一套 UZMAX 后台 Design System 源稿，覆盖 design principles、tokens、grid/layout、iconography、typography、color、components、interaction、motion、responsive、accessibility、design patterns、naming、Figma organization 与 developer guidelines。

本 slice 只产出设计系统文档与证据，不改 admin 源码、不实现 `/design` 活体规范页、不改变 release/GA-0 状态。

## Owner

Owner：项目 owner 决定最终产品范围、真实业务事实、发布门禁、真实账号/客户数据、LLM key、成本和合规风险。

AI agent：读取 v1.1 source-of-truth、项目 Impeccable/Design Skill Layer、现有 token、原型文件，整理可落地的设计系统源稿，暴露原型与治理边界冲突并保留证据。

## 时间盒

0.5 个工作日。若设计系统需要真实 Figma 写入、admin 源码重构、token package 实现、Playwright 截图更新、生产/staging 改动或 owner 范围决策，则停止并拆到后续 spec。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-03-admin-design-system-from-prototype.md`
  - `README.md`
  - `DESIGN.md`
  - `docs/README.md`
  - `docs/doc-gates.md`
  - `docs/evidence/README.md`
  - `docs/evidence/M7/M7-00-uzmax-design-skill-layer.md`
  - `docs/admin-design-system.md`
  - `docs/evidence/M7/README.md`
  - `docs/evidence/M7/M7-03-admin-design-system-from-prototype.md`
  - `docs/incidents/INC-2026-06-29-m7-03-root-patch-target.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 可读取根 v1.1 文档、`PRODUCT.md`、`DESIGN.md`、`packages/ui-tokens/src/tokens.css`、`.agents/skills/impeccable/**`、现有 M7 evidence 与 owner 提供的两个原型文件。
  - 不提交或复制原型中的个人电话、真实账号、真实订单或敏感样本；本文档只抽象设计模式与 token。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files = 0、net source LOC = 0、new source files = 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 docs source-of-truth 草案、1 个 spec、1 个 evidence，更新 repo/docs/M7 entrypoints、doc-gates、DESIGN bridge notes 与 M7-00 follow-up naming；无 test/generated/lock/config/source 改动。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `Design System|设计系统|/design|Figma|Component Library|Design Tokens|tokens|Impeccable|M7-02`，确认现有 `DESIGN.md` 是设计 operating brief 而非完整 design system；M7-00 证据已建议 M7-01/M7-02 用于 UI follow-up，且主线已有 `M7-01-current-state-release-doc-alignment`，因此本 docs-only 设计系统使用 M7-03 作为视觉标准源，并将后续 UI 实现切片改用 `M7-UI-*` 避免撞号。
- 外部 API/SDK/provider/connector/adapter 依据：无。Lucide/Recharts 只沿用既有后台设计 v1.1 与 `DESIGN.md` 约束，不新增外部依赖。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`。
- 判断依据：`docs/doc-gates.md` 与验收矩阵 I-05。Design System 是后台体验与前端质量的发布质量输入，必须进入 repo 文档而不是停留在聊天里。
- 备注：本 slice 不声明 I-05 已关闭；它只提供设计系统源稿，未来仍需 token implementation、`/design` 活体规范页、lint 与视觉回归证据。

## 前置条件

- 已读取 `AGENTS.md`、四个 v1.1 根文档、`PRODUCT.md`、`DESIGN.md`、`packages/ui-tokens/src/tokens.css`、`.agents/skills/impeccable/SKILL.md`、`.agents/skills/impeccable/reference/product.md`、M7-00 evidence、owner 提供的两个原型文件。
- 已运行 Impeccable context loader：`/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/context.mjs --target apps/admin`。
- Worktree / branch：
  - worker worktree: `/Users/atilla/.codex/worktrees/m7-03-admin-design-system/UZMAX智能运营`
  - worker branch: `codex/m7-03-admin-design-system`
  - forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
  - entry evidence: `pwd` = worker path; `git status --short --branch` = `## codex/m7-03-admin-design-system`; `git branch --show-current` = `codex/m7-03-admin-design-system`; root/main status = `## main...origin/main`; local `gh` unavailable, so open PR audit cannot use GitHub CLI.
- 并发派发证据：single worker. This docs-only slice touches M7 docs/evidence and should be serial with other M7 documentation edits.
- 事故触发器：若写入 root/main、修改 admin source、提交原型个人明文/secret/customer/order data、改变 release gate 或扩大到 Figma/API/DB/runtime，停止并创建或引用 `docs/incidents/`。

## 实施步骤

1. 从原型抽取颜色、字号、圆角、间距、页面、组件、图标与交互结构。
2. 将原型抽取结果与 `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`、`DESIGN.md`、Impeccable product register 对齐，标记可采纳与不采纳的原型表达。
3. 新增 `docs/admin-design-system.md`，完整覆盖 owner 要求的 design system 章节，并写明 source-of-truth 优先级。
4. 更新 README、docs index、doc-gates、DESIGN.md、M7 evidence README 与 M7-00 evidence，使 M7-03 成为视觉系统标准源，并把后续 UI 实现改用 `M7-UI-*` 编号。
5. 更新本 slice evidence，记录输入、抽取结果、边界、M7-03 优先级和验证。
6. 运行 docs-only 验证：heading coverage、敏感值/边界 grep、stale M7 follow-up label grep、`git diff --check`、`guard:pr-shape` 若本地依赖可用。

## 通过条件

- `docs/admin-design-system.md` 存在，并覆盖 owner 明确列出的 15 个章节。
- 文档明确区分 canonical target tokens、implementation bridge tokens 与 prototype-only values。
- Component Library 写出核心组件及状态：default/hover/focus/active/disabled/loading/error/success/selected/open/permission/degraded where applicable。
- Interaction/Motion/Responsive/Accessibility/Developer Guidelines 均包含 UZMAX 后台的安全、权限、审计、移动兜底与 `/design` 回归要求。
- Evidence 记录原型抽取统计、Impeccable 采纳/拒绝结论和不关闭 release/I-05 的边界。
- Repo entrypoints point to `docs/admin-design-system.md` / M7-03 as the visual-system standard without making it supersede the four v1.1 source-of-truth docs.
- M7 evidence no longer treats `M7-01` as Global Admin Frame while an existing M7-01 release-current-state spec exists; planned UI implementation slices use `M7-UI-01` / `M7-UI-02`.

## 失败分支

- 若无法从原型读取结构：记录读取失败并只基于 v1.1 docs 生成临时设计系统草案。
- 若原型与 source-of-truth 冲突：source-of-truth 优先，原型表达进入 rejected/adapted list。
- 若实现需要 token package/source 改动：停止并拆到后续 implementation spec。
- 若需要真实 Figma 写入：停止并拆到 Figma handoff spec。
- 若 M7-03 与 earlier visual-doc alignment work conflicts：M7-03 is the standard; port only non-conflicting entrypoint/numbering/boundary fixes and supersede the earlier visual-doc alignment direction.

## 不做什么

- 不改 `apps/admin/**`、`packages/ui-tokens/**` 或任何 runtime/source/test/lock/config。
- 不实现 `/design` 页面、component primitives、visual regression tests 或 Figma 文件。
- 不启用 Impeccable hooks，不使用 Live Mode。
- 不提交原型文件、截图、真实客户/订单数据、电话号码、账号、secret 或 raw Telegram payload。
- 不批准 GA-0、production、真实客户流量、customer LLM、外部 SaaS onboarding、P1/P2 风险接受或 1.0 release。

## 验收映射

- I-01: 设计系统定义桌面核心页面模式，但不关闭核心主流程验收。
- I-02: 设计系统定义移动兜底范围，但不关闭移动 E2E。
- I-05: 设计系统源稿支持后续 token lint、`/design` 和视觉回归，但本 slice 不关闭 I-05。
- K-03/K-04: one spec / one branch / docs-only scope。

## Closeout / Incident 记录

- `docs/incidents/INC-2026-06-29-m7-03-root-patch-target.md`: first M7-03 `apply_patch` landed in root/main instead of the assigned worker worktree; generated docs were moved to the worker, root/main was restored clean, and subsequent patching uses worker-local `apply_patch` with root/main status verification.
