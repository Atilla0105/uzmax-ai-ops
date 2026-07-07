# M7-UI-104 Internal Preview Consolidation

## 目标

Close out the stacked M7 visible UI branch set into one internal-preview candidate so the owner can review and steer the admin product toward real staff pilot usage from a clean repo state.

This spec does not add new product scope. It consolidates already implemented, spec-backed M7 visible UI slices on `codex/m7-ui-31-orders-visible-ui`, including the group shell, tenant entry, tenant pages, source-parity refreshes and conversation detail refinements. The outcome is a single visible admin preview line that can be merged, tested, and cleaned up instead of leaving dozens of draft PRs/worktrees as pseudo-work-in-progress.

This is still an internal preview. It does not claim owner final visual acceptance, runtime/API/DB closure, production readiness, GA, 1.0 release approval, real customer/order data use, LLM key/customer LLM use, Telegram Business automatic replies, cost/compliance approval or staff pilot launch approval.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Owner explicitly requested closeout: absorb branches, merge PR work, clean the environment and prepare the admin for a real closed loop.
- Owner remains the only decision maker for final scope, real account/data usage, cost/compliance, pilot launch and production/release approvals.
- Coordinator may close superseded draft PRs after verifying their commits are absorbed into the consolidation branch or are intentionally superseded.

AI agent:

- Work in `/Users/atilla/.codex/worktrees/m7-ui-31-orders-visible-ui` on branch `codex/m7-ui-31-orders-visible-ui` for any consolidation metadata edits.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main as coordinator checkout except for final merge/sync/cleanup.
- Verify merged preview behavior with fresh local commands before claiming closure.
- Clean only branches/worktrees/PRs whose work is merged, absorbed or explicitly superseded; do not discard unabsorbed value silently.

## 时间盒

0.5 workday for consolidation and cleanup. If full repo CI cannot pass without unrelated backend/runtime work, record the exact blocker and leave the environment clean with a single actionable preview branch/PR.

## Spec 类型

feature

## 触碰模块/文件

触碰模块集合（机器可读 glob/path，一行一个；禁止散文；PR shape guard 唯一读取本列表）：

- `docs/specs/`
- `docs/evidence/M7/`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/incidents/**`
- `apps/admin/src/App.tsx`
- `apps/admin/src/shell/**`
- `apps/admin/src/pages/**`
- `apps/admin/tests/**`
- 未列出的模块默认不可改.

## 变更预算与路径分类

- source changed files: large_change_exception, because this is a one-time closeout consolidation of many already spec-backed M7 UI slices.
- source net LOC: large_change_exception.
- new source files: large_change_exception.
- test files changed: broad M7 admin Playwright surface; no test weakening allowed.
- docs changed: M7 specs/evidence/ledger/incident records only.
- package/lock/generated/backend/API/DB/worker/cron/CI/global config: 0.
- external API/SDK/provider/connector/adapter basis: none; visible UI uses synthetic degraded/mock/read-only state only.

## 文档触发检查

updated

## 前置条件与读取记录

- `AGENTS.md`
- M7 UI specs and evidence already present on the branch.
- GitHub open PR state and local `git branch --no-merged main`.
- Current owner visual source boundary from `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6` and `docs/admin-design-system.md`.

## Consolidation Contract

- `codex/m7-ui-31-orders-visible-ui` becomes the internal preview consolidation branch.
- Superseded stacked/draft PRs can be closed after their commits are reachable from the consolidation branch or their scope is recorded as superseded.
- The root checkout must finish on clean `main` synced to `origin/main`.
- Local preview may use degraded/mock/read-only data only, with visible copy indicating it is not production data.
- Follow-up runtime work must be a separate closed-loop lane that wires real API/authz/RLS/eval gates into the preserved UI seams.

## Pass Conditions

- Consolidation branch builds admin UI locally.
- Fresh browser smoke confirms the admin preview renders and is not a blank page.
- No backend/API/DB/package/lock/global CI config changes are introduced by consolidation.
- `guard:pr-shape` passes for this consolidation spec with `large_change_exception`.
- Open PR/branch cleanup leaves only unmerged work that is either still actionable, blocked, or explicitly superseded.
- Final report separates internal preview readiness from runtime/staff-pilot/production readiness.

## 失败分支

- If full CI blocks only on the intended large consolidation shape, record the exact guard evidence and either update this spec/PR body or leave a single clear consolidation PR.
- If runtime/API/DB gaps block true staff usage, do not fake closure; keep the UI preview merged and open a runtime closed-loop path.
- If any branch contains unabsorbed value not reachable from the consolidation branch, do not delete it until it is merged, cherry-picked or explicitly superseded.

## 不做什么

- No backend/API/DB/schema/migration/package/lock/global CI changes.
- No real customer/order data.
- No automatic knowledge write, prompt/model/persona publish, external provider call or Telegram Business automatic reply.
- No owner final acceptance, staff pilot launch, GA, production or 1.0 release approval.
