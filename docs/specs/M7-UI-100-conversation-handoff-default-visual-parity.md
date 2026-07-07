# M7-UI-100 Conversation Handoff Default Visual Parity

## 目标

校准 `tenant.conversations` 在 synthetic fallback 下的首屏默认可见态，让首个 `pending_handoff` / AI suspended / SLA-risk 会话按 owner 当前原型呈现为可认领的业务状态：header 显示 `待人工`、`SLA 04:12`、vermilion `接管会话 T` 和 more icon；composer 可见 caveat 回到 `由 AI 生成，确认后才会发送给客户`。

本切片只修正会话默认可见态的 header/action/composer degraded 文案外露问题，不改变三栏几何，不声称 runtime closure，不接入真实 Telegram Business/Business draft/handoff API。

## Source Of Truth

- 视觉 source：owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`、解包源码 `/Users/atilla/源码/unpacked 6`、`docs/admin-design-system.md`。
- owner conversation source：`/Users/atilla/源码/unpacked 6/pages/conversations/MessageThread.tsx`、`Composer.tsx`、`ContextRail.tsx`。
- 治理/边界 source：`AGENTS.md`、v1.1 PRD/技术架构/后台设计/验收矩阵、`docs/specs/M7-UI-20-conversation-workbench-page.md`。
- 当前 owner/React 几何：1280x800 下 nav 232、topbar 52/53、conversation list 316、thread residual 392、rail 340。三栏几何保持 owner 同视口值，本 PR 不改栏宽。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- 确认本切片只处理 synthetic fallback 默认可见态视觉偏差。
- 确认 synthetic fallback 允许浏览器本地接管状态切换，但不代表生产 handoff runtime、Business/Telegram 外发或客户数据链路闭环。
- 保留真实账号、真实客户数据、LLM key、成本、合规、GA/release 决策为 owner-only。

AI agent:

- 只在 `/Users/atilla/.codex/worktrees/m7-ui-100-conversation-handoff-default-visual-parity` worktree、`codex/m7-ui-100-conversation-handoff-default-visual-parity` branch 写入。
- root/main checkout 只读，不写 root/main 未跟踪文件，不 revert 他人改动。
- 开工前记录 `pwd`、`git status --short --branch`、`git branch --show-current`。
- 先读 worktree 内 `AGENTS.md`、`docs/admin-design-system.md`、`docs/specs/M7-UI-20-conversation-workbench-page.md`、conversation 当前源码和 owner source。
- 产出 focused Playwright 覆盖与 evidence doc。

## 时间盒

0.25 workday。若需要 shared patterns、AppShell、DB/API、lockfile、全局 config、旧 PR stack、真实 handoff runtime 或 Business/Telegram 外发接入，停止并报告 `BLOCKED`。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-100-conversation-handoff-default-visual-parity.md`
  - `docs/evidence/M7/M7-UI-100-conversation-handoff-default-visual-parity.md`
  - `apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchHandoff.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/tests/m7-ui-100-conversation-handoff-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 4
- source net LOC: <= 180
- new source files: 0
- test files changed: <= 3
- docs changed: <= 2
- generated/lock/config/backend/API/DB/worker/cron/CI/global config: 0
- exceptions: none

## 实现要求

- Synthetic fallback 默认 active conversation 必须仍来自 owner-like fallback 数据，首个会话为 pending handoff / AI suspended / SLA-risk。
- Synthetic fallback 下 `接管会话 T` 必须视觉/语义可用，点击或键盘 `T` 只做浏览器本地状态切换到人工接管/AI 暂停/待人工处理；不得调用 `/conversation-ticket/conversations/*/handoff`，不得外发 Business/Telegram。
- 真实 API runtime 保留现有安全门禁：没有真实 `slaPolicyRef` 或 runtime 返回不可行动作时，handoff 仍禁用/降级，不放宽生产写入边界。
- 默认主 header/composer 可见 copy 不出现 `只读预览` 或长 `runtime-unavailable` 文案。
- Degraded/mock 边界必须仍可被测试/evidence 找到：`data-runtime-source="synthetic"`、`data-runtime-state="degraded"`、`m7-conversation-degraded` hidden/title、composer `data-runtime-boundary` 或等价证据。
- Composer 可见 caveat 必须是 `由 AI 生成，确认后才会发送给客户`。
- 不新增 page-local raw token 色值；如改 CSS，仅限 conversation 相关文件。
- 不改 shared patterns、AppShell、DB/API、lockfile、全局 config、旧 PR stack。

## Impeccable / Design Skill Layer

- 采用：product register。UZMAX conversation workbench 是 dense operational UI，优先状态识别、权限边界、键盘快捷键、稳定几何和熟悉控件。
- 采用：owner prototype 对 header 主动作和 composer caveat 的表达；使用现有 `Button`/`StatusBadge`/Lucide `Hand`/`MoreHorizontal`。
- 拒绝：把 `runtime-unavailable` 长工程说明留在主 header/composer 可见文案；该信息转为机器可见/非主视觉证据。
- 未运行 detector 作为阻断项：本切片只改已存在 conversation page-local CSS/logic，不新增视觉系统；M7 已知 side-stripe debt 不在本切片解决范围。

## 验收与证据

- Focused Playwright 从 group home 进入 `m7-group-enter-tenant-tenant-a`，到达 tenant conversations。
- 断言 workbench `data-runtime-source="synthetic"` 且 `data-runtime-state="degraded"`，degraded evidence 仍可定位。
- 断言 visible header/composer primary copy 不出现 `只读预览` / long `runtime-unavailable`。
- 断言 synthetic 默认 `接管会话 T` enabled，按钮为 owner vermilion human state，键盘 `T` 与点击都只改变本地状态，且无 handoff POST。
- 断言 1280x800 几何：nav 232、topbar 52/53、list 316、rail 340、thread residual 391-393。
- 最低命令：`git diff --check`、focused Prettier on changed files、focused Playwright conversation tests、`npm run build:admin`。时间允许运行 `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-100-conversation-handoff-default-visual-parity.md`。

## 不做什么

- 不接入真实 Business/Telegram 外发。
- 不调用或放宽真实 handoff API。
- 不声明 runtime closure、owner acceptance、GA/release approval。
- 不改三栏栏宽、AppShell、shared patterns/primitives、API/DB、lockfile 或全局 config。
- 不修复既有 conversation list side-stripe legacy debt。
