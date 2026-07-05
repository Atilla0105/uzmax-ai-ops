# M7-UI-54 配置页

## 目标
在租户路由上实现可见的 `tenant.config` / 配置 页面，按 owner prototype / unpacked config source 的内部配置导航、版本头、配置表单/表格与本地确认行为呈现真实 UI。

## Owner
Owner：项目 owner。

## 时间盒
2026-07-05（缺失证据时转入失败分支或降级）。

## Spec 类型
feature

## 触碰模块/文件
- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/config/ConfigPage.tsx`
- `apps/admin/src/pages/config/configFallback.ts`
- `apps/admin/tests/m7-ui-config-page.spec.ts`
- `docs/specs/M7-UI-54-config-page.md`
- `docs/evidence/M7/M7-UI-54-config-page.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`

## 变更预算与路径分类
- source 预算：changed source files <= 12、net source LOC <= 600、new source files <= 5
- test/generated/lock/config/docs 预计按需变更
- 无外部 API/SDK 依赖
- 无例外

## 文档触发检查
- `none`

## 前置条件
- Worktree：`/Users/atilla/.codex/worktrees/m7-ui-54-config-visible-ui`
- 分支：`codex/m7-ui-54-config-visible-ui`
- Base：`origin/codex/m7-ui-53-team-visible-ui`

## 实施步骤
1. 在 `registry.ts` 将 `tenant.config` 的 `targetSpecId` 调整为 `M7-UI-54-config-page`，状态更新为 `visible_mvp_candidate_pending_pr_review`。
2. 在 `PageOutlet.tsx` 接入 `ConfigPage`，保持租户层 shell 与选中租户上下文。
3. 用 `ConfigPage/configFallback` 实现 8 段内部配置导航、版本头、dirty badge、版本历史、保存并生成版本、本地回滚、渠道测试/启停、connector 测试/切换。
4. 新增 focused Playwright 覆盖 tenant shell、8 段切换、本地保存/回滚、渠道/connector local-only 操作、强制状态与 320px fallback。

## 通过条件
- 选择租户后点击配置，进入 `tenant.config`，外层 shell 仍为租户层，管理分类下显示配置。
- 页面默认 degraded/mock/browser-local only，可见 `no production config write / no audit write / no connector switch / no eval-gated publish`。
- `loading/empty/error/permission/degraded` 可由 URL query 验证。
- Playwright 关键场景通过并产出截图 + 指标。

## 失败分支
- 若 UI 源对照或验证失败，回退到最小可见实现并在 evidence 中记录 blocked/remaining delta。

## 不做什么
- 不做 DB/API/config persistence/audit write/connector runtime switch/eval-gated publish/order import runtime。
- 不声明 owner visual acceptance、runtime closure、release closure。

## Impeccable / Design Skill Layer
- 采纳：产品型 admin UI、密集表单/表格、状态优先、移动仅 readable fallback、边界文案可见。
- 拒绝：旧 `--uzmax-*` 作为新视觉源、dashboard 化卡片堆砌、生产写入暗示。
