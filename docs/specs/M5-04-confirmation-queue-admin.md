# M5-04 Confirmation Queue Admin

## 目标

Implement one scoped admin slice for the M5 confirmation queue: a keyboard-first, high-density confirmation card shell, an admin API client contract for the M5-03 HTTP routes, an amber distill-health banner, conflict side-by-side diff visibility, and a mobile approve/discard fallback.

This slice is local/synthetic on the visible admin page. It anchors the `/confirmation-queue` API contract through a pure admin client, but the visible shell does not perform runtime network calls and does not write formal knowledge, customer profile, eval, DB, worker, provider or production state.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: confirm this PR is only the M5-04 admin shell and client-contract slice. It does not close M5, production H-02/H-03/H-07/I-02 acceptance, GA-0, production readiness, real customer/order data, customer LLM, LLM keys, cost, compliance or 1.0 release decisions.

AI agent: implement only the allowlisted docs/admin/test files in the assigned worktree, preserve the M5-03 `formalWrite: false` and controlled-ref boundary, keep the visible shell synthetic/local, record evidence and validation, and keep M5 not accepted.

## 时间盒

0.5 个工作日. If changed source files exceed 4, net source LOC exceeds 600, new source files exceed 3, or meaningful implementation requires API/DB/distill/runtime writes, stop and report `BLOCKED` with a smaller split.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5-04-confirmation-queue-admin.md`
  - `docs/evidence/M5/M5-04-confirmation-queue-admin.md`
  - `docs/evidence/M5/README.md`
  - `docs/incidents/INC-2026-06-24-m5-04-root-patch-target.md`
  - `apps/admin/src/confirmationQueueApiClient.ts`
  - `apps/admin/src/M5ConfirmationQueueShell.tsx`
  - `apps/admin/src/m5-confirmation-queue-shell.css`
  - `apps/admin/src/App.tsx`
  - `apps/admin/tests/m5-confirmation-queue.spec.ts`
  - `scripts/tests/m5-confirmation-queue-admin.test.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only for this worker.
  - This slice must not touch `apps/api/**`, `packages/db/**`, `packages/distill/**`, `apps/worker/**`, `apps/cron/**`, `packages/engine/**`, `packages/capabilities/**`, `packages/llm-gateway/**`, `packages/evals/**`, package/lock/config/CI/guard files, raw samples, generated artifacts or production/release docs outside this allowlist.

## 变更预算与路径分类

- source budget target: changed source files <= 4, net source LOC <= 600, new source files <= 3.
- docs: this spec, M5-04 evidence, M5 evidence README, one required incident record for the root patch-target boundary event detected during this slice.
- source: `apps/admin/src/confirmationQueueApiClient.ts`, `apps/admin/src/M5ConfirmationQueueShell.tsx`, `apps/admin/src/m5-confirmation-queue-shell.css`, `apps/admin/src/App.tsx`.
- test: `apps/admin/tests/m5-confirmation-queue.spec.ts`, `scripts/tests/m5-confirmation-queue-admin.test.mjs`.
- generated/lock/config/API/DB/distill/worker/cron/engine/capabilities/llm-gateway/evals/raw samples/external provider/adapter: none.
- New source `rg` conclusion: searched `ConfirmationQueue`, `confirmation queue`, `confirmation-queue`, `create.*ApiClient`, `formalWrite`, `controlled ref`, `raw carrier` and `diffPayload` under `apps/admin/src`, `apps/admin/tests`, `scripts/tests`, `docs/specs` and `docs/evidence/M5`. Existing admin client patterns are M4 order/customer clients; existing confirmation queue implementation is M5-03 API code only. No admin confirmation queue client or shell exists, so new source belongs under `apps/admin/src/confirmationQueueApiClient.ts` and `apps/admin/src/M5ConfirmationQueueShell.tsx`, with a feature CSS file matching current M2/M4 admin shell conventions.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API, SDK, provider, connector or adapter and performs no external call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M5-00-operations-loop-readiness-pack.md`, `docs/specs/M5-01-db-contract-foundation.md`, `docs/specs/M5-02-distill-guardrails.md`, `docs/specs/M5-03-confirmation-queue-api.md`, `docs/evidence/M5/README.md`, `docs/evidence/M5/M5-03-confirmation-queue-api.md`, relevant v1.1 PRD/backoffice/acceptance sections and existing admin patterns before implementation.
- Worktree must be `/Users/atilla/Documents/uzmax-m5-04-confirmation-queue-admin`.
- Branch must be `codex/m5-04-confirmation-queue-admin`.
- Do not write to `/Users/atilla/Documents/UZMAX智能运营` root/main checkout.
- Start audit must be recorded in `docs/evidence/M5/M5-04-confirmation-queue-admin.md` before source/test implementation edits.
- `apps/api`, `packages/db`, `packages/distill`, worker/cron/runtime, lockfile, shared config, CI/guards, generated artifacts and production/release gates are outside this slice.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5-04-confirmation-queue-admin` |
| branch | `codex/m5-04-confirmation-queue-admin` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | read-only audit only |

## 并发派发证据

Single active writing worker for this spec. Touch list is distinct from M5-03 API source and does not touch DB schema/migrations, lockfile, shared config, CI/guard scripts, generated artifacts or release/production gates. It touches shared `apps/admin/src/App.tsx` and adds focused `apps/admin/tests/m5-confirmation-queue.spec.ts`, so any parallel admin-shell worker touching those files must wait or show explicit non-overlap in evidence. Physical worktree and branch are distinct from root/main.

## 事故与 closeout 记录

- Incident: `docs/incidents/INC-2026-06-24-m5-04-root-patch-target.md` records and cleans up an initial patch-target error where this worker's first docs/source patch landed in root/main before being transferred to the assigned worktree and removed from root.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- M5 closeout is not in this slice; later M5-08 or owner evidence must decide milestone acceptance.

## 实施步骤

1. Record start audit evidence for worker/root/GitHub state.
2. Add pure `createConfirmationQueueApiClient` for `GET /confirmation-queue/items`, `GET /confirmation-queue/items/:itemId` and `POST /confirmation-queue/items/:itemId/decisions`.
3. Validate list/detail/decision response shape, candidate kinds/statuses, controlled refs, conflict diff shape, raw-key rejection and `formalWrite === false` for decisions/audit.
4. Add `M5ConfirmationQueueShell` using synthetic local state, keyboard `J/K/A/E/D`, amber health banner, local recovery draft/disabled confirmation gate, conflict diff, minimal default fields and expandable details.
5. Wire the shell into `apps/admin/src/App.tsx` after M4 order/customer shells and before release readiness.
6. Add focused Playwright coverage for desktop queue, keyboard actions, amber banner, conflict diff and mobile approve/discard fallback with edit disabled/desktop-only.
7. Add focused Node tests for admin client paths/validation, docs/evidence status and source guard patterns.
8. Update M5 evidence README and M5-04 evidence without marking M5 accepted.
9. Run required validation and commit if all checks pass.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, scope, validation, acceptance mapping, boundaries and no sensitive data statement.
- Admin client uses explicit fetcher injection, relative base path only, no backend imports, no global `fetch`, and maps to `/confirmation-queue/items`, `/confirmation-queue/items/:itemId` and `/confirmation-queue/items/:itemId/decisions`.
- Admin client validates list/detail/decision response shape, candidate kind/status/action, controlled refs and raw-ish key/value boundaries.
- Admin client rejects decision responses unless top-level and audit `formalWrite` are exactly `false`.
- Visible shell performs no real network calls and uses only synthetic controlled refs, summary text, counts and local state.
- Desktop queue is single-column and keyboard-first: `J/K` moves selection, `A` approves locally, `E` enters edit state for desktop, `D` discards locally.
- Candidate types include knowledge, profile, eval and conflict; conflict candidate shows mandatory side-by-side diff and no skip-to-formal-write path.
- Queue top shows today candidate count, daily cap 10, 7-day pass rate, distill frequency and latest downshift reason.
- 3-day low pass-rate/downshift risk shows an amber banner with view reason and recover-daily entry; recovery is visibly confirmation-gated, disabled or local draft only.
- Card defaults are minimal and details are expandable for owner daily processing <= 5 minutes.
- Mobile/narrow viewport exposes approve/discard fallback and makes edit desktop-only/disabled without promising full mobile editing.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 4, net source LOC <= 600, new source files <= 3.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If source budget exceeds target: stop and report `BLOCKED` with proposed split.
- If tests require API/DB/distill/worker/cron/runtime formal writes, provider calls, real customer/order data, raw exports or production behavior: stop and split to later M5 specs.
- If mobile full editing is required for acceptance: stop and split because v1.1 only requires mobile approve/discard fallback.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop and clean up before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No `apps/api/**`, `packages/db/**`, `packages/distill/**`, `apps/worker/**`, `apps/cron/**`, `packages/engine/**`, `packages/capabilities/**`, `packages/llm-gateway/**`, `packages/evals/**`, package/lock/config/CI/guard changes.
- No DB/Prisma runtime, formal knowledge write, customer profile write, eval write, real API call in the visible shell, provider/LLM call, alert delivery, production Redis/worker deployment, M6, GA-0, real customer/order data or 1.0 release claim.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 accepted claim.

## 验收映射

| Item | M5-04 status | Notes |
|---|---|---|
| H-02 | `admin_ui_supported_not_closed` | Admin shell and client enforce human approve/edit/discard decisions and `formalWrite: false`; formal write pipeline/integration remains future. |
| H-03 | `admin_ui_supported_not_closed` | Conflict candidate shows side-by-side diff in admin E2E; DB/runtime formal storage prevention remains covered by M5-03/future integration. |
| H-07 | `admin_ui_supported_not_closed` | Admin exposes cap/pass-rate/frequency/downshift risk and recovery as confirmation-gated local draft/disabled only; persisted scheduler/audit/recovery remains future. |
| I-02 | `admin_ui_supported_not_closed` | Mobile fallback exposes approve/discard and disables/redirects edit to desktop; full mobile editing is out of scope. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-04 only; M5 closeout and release checklist remain future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-04. |
| K-04 | `active` | Worktree/branch and touch list are scoped; DB schema and global serial points remain untouched. |

M5-04 closes no production acceptance item. It only provides the admin UI/client contract shell for later M5 runtime and closeout slices.
