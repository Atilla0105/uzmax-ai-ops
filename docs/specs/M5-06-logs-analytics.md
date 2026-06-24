# M5-06 Logs Analytics

## 目标

Implement one narrow frontend/local-contract slice for M5 logs and analytics: a fixed analytics board, whitelisted dimensions, owner-confirmation-gated export draft governance, and login/presence/operation log center readback over synthetic local data.

This slice is admin frontend and pure local contract only. It must not call API/DB/runtime, generate export files, scan raw messages, read production logs, or mark M5/I-06/I-07 accepted.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: confirm this PR is only the M5-06 frontend/local-contract slice. It does not close M5, I-06/I-07 production acceptance, GA-0, production readiness, export approval, real customer/order data, customer LLM, LLM keys, cost, compliance or 1.0 release decisions.

AI agent: implement only the allowlisted docs/admin/test files in the assigned worktree, keep all analytics/log data synthetic, fail closed on unsafe dimensions/refs/raw fields, record evidence and validation, and keep M5 not accepted.

## 时间盒

0.5 个工作日. If changed source files exceed 4, net source LOC exceeds 600, new source files exceed 3, or meaningful implementation requires API/DB/runtime/export writes, stop and report `BLOCKED` with a smaller split.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5-06-logs-analytics.md`
  - `docs/evidence/M5/M5-06-logs-analytics.md`
  - `docs/evidence/M5/README.md`
  - `apps/admin/src/M5LogsAnalyticsShell.tsx`
  - `apps/admin/src/logsAnalyticsContracts.ts`
  - `apps/admin/src/m5-logs-analytics-shell.css`
  - `apps/admin/src/App.tsx`
  - `apps/admin/tests/m5-logs-analytics.spec.ts`
  - `scripts/tests/m5-logs-analytics.test.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only for this worker.
  - This slice must not touch `apps/api/**`, `packages/db/**`, `packages/distill/**`, `apps/worker/**`, `apps/cron/**`, `packages/engine/**`, `packages/capabilities/**`, `packages/llm-gateway/**`, `packages/evals/**`, package/lock/config/CI/guard files, raw samples, generated artifacts or production/release gates.

## 变更预算与路径分类

- source budget target: changed source files <= 4, net source LOC <= 600, new source files <= 3.
- docs: this spec, M5-06 evidence, M5 evidence README.
- source: `apps/admin/src/M5LogsAnalyticsShell.tsx`, `apps/admin/src/logsAnalyticsContracts.ts`, `apps/admin/src/m5-logs-analytics-shell.css`, `apps/admin/src/App.tsx`.
- test: `apps/admin/tests/m5-logs-analytics.spec.ts`, `scripts/tests/m5-logs-analytics.test.mjs`.
- generated/lock/config/API/DB/distill/worker/cron/engine/capabilities/llm-gateway/evals/raw samples/external provider/adapter: none.
- New source `rg` conclusion: searched `LogsAnalytics`, `logs analytics`, `log center`, `日志中心`, `analysis center`, `分析中心`, `export job`, `export_job`, `metric_daily`, `dimension`, `handoff_reason`, `real traffic baseline`, `login_log`, `presence_log`, `audit_log`, `operation log`, `操作日志`, `登录日志`, `在线日志` and high-risk controlled refs under `apps/admin/src`, `apps/admin/tests`, `scripts/tests`, `docs/specs`, `docs/evidence/M5` and `packages/db/src`. Existing implementation is limited to M1/M4 audit foundations, M5 planning/evidence and adjacent M5 confirmation/AI member shells; no M5 logs analytics admin shell or local export/dimension contract exists. New source belongs under `apps/admin/src/logsAnalyticsContracts.ts` and `apps/admin/src/M5LogsAnalyticsShell.tsx`, with a feature CSS file matching current M5 admin shell conventions.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API, SDK, provider, connector or adapter and performs no external call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M5-00-operations-loop-readiness-pack.md`, `docs/evidence/M5/README.md`, `docs/evidence/M5/M5-05-ai-member-console.md`, relevant v1.1 PRD/backoffice/technical/acceptance sections and existing M5 admin patterns before implementation.
- Worktree must be `/Users/atilla/Documents/uzmax-m5-06-logs-analytics`.
- Branch must be `codex/m5-06-logs-analytics`.
- Do not write to `/Users/atilla/Documents/UZMAX智能运营` root/main checkout.
- Start audit must be recorded in `docs/evidence/M5/M5-06-logs-analytics.md` before source/test implementation edits.
- `apps/api`, `packages/db`, `packages/distill`, worker/cron/runtime, lockfile, shared config, CI/guards, generated artifacts and production/release gates are outside this slice.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5-06-logs-analytics` |
| branch | `codex/m5-06-logs-analytics` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | read-only audit only |

## 并发派发证据

Single active writing worker for this spec. Touch list is distinct from DB schema/migrations, lockfile, shared config, CI/guard scripts, generated artifacts and release/production gates. It touches shared `apps/admin/src/App.tsx` and adds focused admin/test files, so any parallel admin-shell worker touching those files must wait or show explicit non-overlap in evidence. Physical worktree and branch are distinct from root/main.

## 事故与 closeout 记录

- Incident: none at start.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- M5 closeout is not in this slice; later M5-08 or owner evidence must decide milestone acceptance.

## 实施步骤

1. Record start audit evidence for worker/root/GitHub state.
2. Add pure local `logsAnalyticsContracts.ts` for allowed dimensions and export draft validation.
3. Ensure export drafts always return `formalExportWrite: false`, `requiresOwnerConfirmation: true`, whitelist dimensions, require controlled refs and reject raw/prompt/customer/order/phone/payment/secret/url/base64-ish/unsafe fields.
4. Add `M5LogsAnalyticsShell` using synthetic local state only: fixed v1.1 metric board, desktop dimension toggles, disabled confirmation-gated export draft controls, and log center filters for login, presence and operation logs.
5. Wire the shell into `apps/admin/src/App.tsx` after `M5AiMemberConsoleShell` and before release readiness.
6. Add focused Playwright coverage for desktop board/dimensions/export gating/log filters/high-risk controlled refs and 320px mobile log/metric readback/no horizontal overflow without full dimension/export editing.
7. Add focused Node tests for contract fail-closed cases, docs/status/scope, no backend/network imports and no sensitive raw data.
8. Update M5 evidence README and M5-06 evidence without marking M5 accepted.
9. Run required validation and record results.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, scope, boundaries, no sensitive data statement, acceptance mapping, validation and spec/code review result or placeholders.
- Local dimension helper accepts only `tenant`, `member`, `ai_member`, `channel`, `intent`, `time_grain`, `order_status`, `handoff_reason`.
- Fixed board displays resolution rate, handoff rate, SLA, cost, top questions, order query, draft adoption, knowledge health, confirmation queue 7-day pass rate, distill frequency and real traffic baseline.
- Export draft builder always returns `formalExportWrite: false` and `requiresOwnerConfirmation: true`, creates no file, accepts only whitelisted dimensions and controlled refs, and rejects unsafe refs/raw fields.
- Visible shell performs no real network calls and uses only synthetic local state.
- Log center exposes login, presence and operation filters/readback with the required columns.
- Operation high-risk rows expose controlled jump refs only.
- Confirm export action remains disabled/owner-confirmation-gated.
- Mobile/narrow viewport exposes log filters and essential metric readback, hides full dimension/export editing and has no horizontal overflow at 320px.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 4, net source LOC <= 600, new source files <= 3.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If source budget exceeds target: stop and report `BLOCKED` with proposed split.
- If tests require API/DB/distill/worker/cron/runtime aggregation, export files, provider calls, real customer/order data, raw logs or production audit behavior: stop and split to later M5 specs.
- If mobile full dimension/export editing is required for acceptance: stop and split because v1.1 mobile only guarantees fallback readback/urgent flows.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop and clean up before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No `apps/api/**`, `packages/db/**`, `packages/distill/**`, `apps/worker/**`, `apps/cron/**`, `packages/engine/**`, `packages/capabilities/**`, `packages/llm-gateway/**`, `packages/evals/**`, package/lock/config/CI/guard changes.
- No DB/Prisma runtime, metric aggregation job, export file creation, formal audit read/write, raw message scan, production log ingestion, provider/LLM call, alert delivery, production Redis/worker deployment, M6, GA-0, real customer/order data or 1.0 release claim.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 accepted claim.

## 验收映射

| Item | M5-06 status | Notes |
|---|---|---|
| I-06 | `frontend_local_contract_supported_not_closed` | Fixed board, dimension whitelist and local export draft governance are visible; runtime aggregation/export jobs remain future. |
| I-07 | `frontend_local_contract_supported_not_closed` | Login/presence/operation log readback is visible over synthetic data; persisted audit/log integration remains future. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-06 only; M5 closeout and release checklist remain future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-06. |
| K-04 | `active` | Worktree/branch and touch list are scoped; DB schema and global serial points are untouched. |

M5-06 closes no production acceptance item. It only provides the frontend/local-contract shell for later M5 runtime and closeout slices.
