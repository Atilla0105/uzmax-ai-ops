# M7-UI-103 Conversation Composer Source Parity

## 目标

校准 `apps/admin` tenant conversation workbench 底部 composer，使 synthetic/degraded 状态下的 draft composer 更贴近 owner HTML 与 `/Users/atilla/源码/unpacked 6/pages/conversations/Composer.tsx`：紧凑 padding、draft pill、icon-only 工具按钮、语言/红线 meta、编辑草稿和确认发送节奏。

本 PR 只处理 composer 视觉壳与测试合约，不处理 sidebar/topbar、API/DB、其它页面或移动端重新设计。

## Source Of Truth / Source Mapping

- Owner HTML: `/Users/atilla/Downloads/运营塔台1.0.html`。
- Unpacked source: `/Users/atilla/源码/unpacked 6/pages/conversations/Composer.tsx`。
- 当前 React: `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` + same-page private `conversationWorkbenchComposer.tsx`。
- Governance: root `AGENTS.md`、v1.1 PRD/技术架构/后台设计/验收矩阵、`docs/specs/M7-UI-20-conversation-workbench-page.md`。

| Source point | React mapping |
| --- | --- |
| Composer shell `padding: 12px 18px 14px` | `.uz-conv-composer` already keeps `12px 18px 14px`; preserve. |
| State row `gap: 8`, `margin-bottom: 9` | `.uz-conv-composer__state` already keeps source density; preserve. |
| Draft area `border-radius: 9px`, `padding: 11px 13px`, `line-height: 1.55` | existing textarea density remains unchanged. |
| Draft pill icon + `Business 草稿 · 待确认` | add Lucide `PencilLine` inside the existing `StatusBadge`. |
| Caveat `由 AI 生成，确认后才会发送给客户` | keep visible next to the pill. |
| Tool buttons are compact icon controls only | render paperclip and quote snippet as icon-only buttons with `aria-label`/`title`; no visible `附件`/`话术片段` text. |
| Bottom bar meta/action | keep tools, `乌兹别克语（拉丁） · 红线检查通过`, `编辑草稿`, green `确认发送` with send icon and visible `⌘↵`. |

## 项目 owner 确认点与 AI agent 责任

Owner/coordinator:

- 确认本切片只处理 composer source parity，不代表 runtime closure、Business/Telegram 外发、真实客户数据或 GA/release approval。
- 保留真实账号、真实客户数据、LLM key、成本、合规、发布和 owner final visual acceptance 为 owner-only。

AI agent:

- 只在 `/Users/atilla/.codex/worktrees/m7-ui-103-conversation-composer-source-parity` worktree、`codex/m7-ui-103-conversation-composer-source-parity` branch 写入。
- 开工前记录 `pwd`、`git status --short --branch`、`git branch --show-current`。
- 先读 root `AGENTS.md`、Impeccable product context、owner/unpacked composer source、当前 React 和 conversation tests。
- 只改本 spec 声明的路径；不 revert、checkout、reset、清理或覆盖其他 worker 改动。

## 时间盒

0.25 workday。若需要 shared primitives/tokens/patterns、AppShell、router、API/DB、package/lock/global config 或真实 runtime 接入，停止并报告 `BLOCKED`。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-103-conversation-composer-source-parity.md`
  - `docs/evidence/M7/M7-UI-103-conversation-composer-source-parity.md`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchComposer.tsx`
  - `apps/admin/tests/m7-ui-103-conversation-composer-source-parity.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 2
- source net LOC: <= 80
- new source files: <= 1
- test files changed: <= 1
- docs changed: <= 2
- generated/lock/config/backend/API/DB/worker/cron/CI/global config: 0
- exceptions: none

PR Hygiene / `rg` 结论：`rg -n "function Composer|composerState|fallbackDraft|draftSubject|uz-conv-composer" apps/admin/src/pages/conversations apps/admin/tests` 显示 composer 组件逻辑原本只落在 `conversationWorkbenchStyles.tsx`；测试侧已有 UI-100 composer 状态断言和本 focused test 断言，但没有合适的既有 composer owner file 可就地归属。拆出 `apps/admin/src/pages/conversations/conversationWorkbenchComposer.tsx` 是同页面私有 component，用于同时满足 ESLint React 文件 `max-lines <=250` 与正常 Prettier 格式化，降低在 styles 文件内硬挤 JSX 的 churn；不新增共享 primitive/token/pattern。

## 实现要求

- Composer 保持 source density：padding `12px 18px 14px`、state row gap `8`/margin `9`、textarea radius `9`、padding `11/13`、line-height `1.55`。
- Draft state pill 必须显示 Pencil icon + `Business 草稿 · 待确认`。
- Pill 旁边 copy 必须保持 `由 AI 生成，确认后才会发送给客户`。
- Tool buttons 必须是 compact icon-only controls：paperclip / quote-snippet；不得在可见 UI 上显示 `附件` 或 `话术片段`。允许 `aria-label`/`title` 作为无障碍名称。
- Bottom bar 必须保持工具按钮组、`乌兹别克语（拉丁） · 红线检查通过`、`编辑草稿`、绿色 `确认发送`，并在确认按钮里显示 send icon 与 visible `⌘↵` kbd。
- Runtime 仍为 synthetic/degraded/read-only；不得新增 API 接入、后端连接、真实 Business/Telegram 外发或客户数据写入。
- 测试必须从 `/design` 集团层选择租户进入对话页，不能直接绕过到万能 dashboard。

## Impeccable / Design Skill Layer

- 采用：Impeccable product register。UZMAX conversation workbench 是 dense operational UI，优先熟悉控件、稳定几何、状态可读和权限边界。
- 采用：owner source 的 compact composer anatomy、Pencil draft pill、icon-only tools、语言/红线 meta 与 confirm keyboard cue。
- 拒绝：把 `附件` / `话术片段` 作为可见按钮文字留在 composer；原因是 owner source 使用 icon-only compact controls，本切片要消除旧 React 可见文字偏差。
- 拒绝：借本切片重做移动端布局、shared primitives、sidebar/topbar 或 runtime API；原因是超出 spec 和触碰模块。

## 验收与证据

- Focused Playwright route conversation API 为非 JSON，验证 synthetic/degraded fallback。
- 从 `/design` 打开，确认 `admin-shell` 初始 `group`，选择租户 A 后为 `tenant`，并进入 `tenant.conversations`。
- 断言 composer state/copy/draft/lang/redline/编辑草稿/确认发送/`⌘↵`。
- 断言可见 composer 区域不包含 `附件` 和 `话术片段`；同时 icon tool buttons 有 `aria-label`/`title`，数量和尺寸可测。
- 断言关键几何：nav `232`、topbar `52-53`、list `316`、rail `340`、composer 高度/位置不导致 body 横向滚动。
- 产出桌面 `1280x800` screenshot、移动 readable fallback screenshot、metrics JSON 到 `/tmp/uzmax-m7-ui-103-conversation-composer-source-parity/`，并写入 evidence。
- 最低命令：`git diff --check`、focused Playwright test、`npm run typecheck`、`npm run build:admin`。若依赖安装或环境阻断，必须记录具体原因。

## 禁止行为 / 不做什么

- 不接入真实 Business/Telegram 外发。
- 不新增 API/DB/backend/worker/cron/runtime connector。
- 不声明 runtime closure、owner acceptance、GA/release approval。
- 不改 sidebar/topbar、AppShell、router、shared primitives/tokens/patterns、其它页面、package/lock/global config。
- 不通过 `.skip`/`.only`/`xit`/`xfail` 或放宽断言让测试通过。
