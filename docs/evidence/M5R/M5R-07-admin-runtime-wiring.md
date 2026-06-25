# M5R-07 Admin Runtime Wiring Evidence

## Start Audit

Recorded from the assigned worktree before completing docs/tests.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/private/tmp/uzmax-m5r-07-admin-runtime-wiring` |
| assigned `git status --short --branch` | `## codex/m5r-07-admin-runtime-wiring` with M5R-07 admin shell edits and untracked admin client/test/docs files |
| assigned `git branch --show-current` | `codex/m5r-07-admin-runtime-wiring` |
| worker `HEAD` | `a1acf85c76b88b48302857e9c3e248f6fb9b4e3f` |
| root/main checkout | not written by this worker |
| branch/path mismatch | none found |

## Implementation Evidence

- `apps/admin/src/m5AdminRuntimeMode.ts` adds explicit opt-in runtime mode via `window.__UZMAX_M5R_ADMIN_RUNTIME__`. Default behavior remains local/synthetic.
- `apps/admin/src/confirmationQueueApiClient.ts` now accepts the M5R-02 runtime response shape where approved/edited config writes may return `formalWrite: true`; `auditDraft.formalWrite` must match the top-level value when present.
- `apps/admin/src/m5ConfirmationQueueRuntime.ts` and `apps/admin/src/m5LogsAnalyticsRuntime.tsx` hold compact admin-only mapping/table helpers so React shell files stay within lint limits.
- `apps/admin/src/aiMemberConsoleContracts.ts` now exports existing AI console labels/defaults used by the shell.
- `apps/admin/src/M5ConfirmationQueueShell.tsx` uses `confirmationQueueApiClient` in runtime mode for `GET /confirmation-queue/items`, `GET /confirmation-queue/items/:id` and `POST /confirmation-queue/items/:id/decisions`; an empty runtime queue renders as empty and does not fall back to synthetic local cards.
- `apps/admin/src/M5AiMemberConsoleShell.tsx` uses `aiMemberRuntimeApiClient` in runtime mode for state read, emergency stop, recovery and capability toggle. Capability enable uses `activeVersion.evalGateId` and optional `activeVersion.configVersionId` from runtime state; if eval evidence is missing, no enable API call is made.
- `apps/admin/src/M5LogsAnalyticsShell.tsx` uses `logsAnalyticsApiClient` in runtime mode for `GET /logs-analytics/board`, `GET /login-logs`, `GET /presence-logs`, `GET /operation-logs` and `POST /export-jobs`.
- `apps/admin/src/M5TemplateCenterShell.tsx` uses `templateCopyApiClient` in runtime mode for `POST /template-copy/copies`.
- Existing local shell flows remain the default when runtime mode is absent.

## Runtime/RLS Evidence

Direct true DB/RLS smoke omitted. M5R-07 is an admin wiring slice and does not own DB/RLS writes or backend repositories. It relies on prior runtime/API evidence:

- M5R-01 confirmation queue persistence: `docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md`.
- M5R-04 AI member runtime control: `docs/evidence/M5R/M5R-04-ai-member-runtime-control.md`.
- M5R-05 logs + analytics runtime: `docs/evidence/M5R/M5R-05-logs-analytics-runtime.md`.
- M5R-06 template copy runtime: `docs/evidence/M5R/M5R-06-template-copy-runtime.md`.

Those slices own true DB/RLS runtime behavior and record `UZMAX_RLS_DATABASE_URL` missing-env status where applicable. M5R-07 validates admin request paths with Playwright route fixtures; it must not claim direct true DB/RLS pass unless a real `UZMAX_RLS_DATABASE_URL` smoke is separately run.

Exact M5R-07 true DB/RLS status: `not_run_not_applicable_admin_wiring_slice__relies_on_m5r_01_04_05_06_runtime_evidence`.

## Playwright Evidence

`apps/admin/tests/m5r-admin-runtime-wiring.spec.ts` uses `page.route` fixtures and an opt-in `window.__UZMAX_M5R_ADMIN_RUNTIME__` init script to assert:

- desktop runtime requests include `/confirmation-queue`, `/ai-members`, `/logs-analytics` and `/template-copy`;
- confirmation details and decisions go through API paths;
- AI member state and capability toggle go through API paths, and capability enable body includes `evalGateId` plus `configVersionId` when runtime state returns them;
- empty runtime confirmation queue stays empty, shows no synthetic cards and keyboard approve/discard cannot hit local fallback actions;
- logs board/log/export job requests go through API paths;
- template copy request goes through API path;
- 320px confirmation approve/discard and AI emergency/recovery go through API paths.

## Source Budget

Pre-validation source budget check after tightening:

| Metric | Result |
|---|---|
| changed source files | 11 |
| new source files | 5 |
| net source LOC | 590 |
| source budget status | within default AGENTS budget |

Tracked shell/helper diff at the time of this evidence update was tightened to keep total source net LOC under 600 after adding `apps/admin/src/confirmationQueueApiClient.ts` to the source touch list. No `large_change_exception` is declared.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed local worktree dependencies after initial `playwright: command not found`. |
| `npm run format:check` | pass | Prettier check completed after line-budget tightening. |
| `npm run knip` | pass | No unused public exports after removing M5R runtime helper exports. |
| `npm run lint` | pass | ESLint completed after helper extraction kept React files within limits and shortcut handling under complexity limit. |
| `npm run typecheck` | pass | TypeScript no emit completed. |
| `node --test scripts/tests/m5r-admin-runtime-wiring.test.mjs` | pass | 3/3 focused docs/source anchor tests passed. |
| `npm run playwright -- apps/admin/tests/m5r-admin-runtime-wiring.spec.ts` | pass | 3/3 targeted Playwright tests passed, including eval-evidence enable body and empty runtime queue no-fallback coverage. |
| `node --test scripts/tests/m5-confirmation-queue-admin.test.mjs` | pass | Extra focused confirmation queue client contract passed, including `formalWrite: true` and mismatch rejection coverage. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5R-07-admin-runtime-wiring.md --include-worktree` | pass | Reported changed files 17; categories source 11, docs 3, test 3; source changed files 11, net LOC 590, new files 5. |
| `git diff --check` | pass | No whitespace errors. |

## No Sensitive Data Statement

No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets are added. Playwright fixtures use synthetic controlled refs only.

## Boundary

M5R-07 does not approve M5 owner acceptance, M5 runtime closeout, M5R-08 closeout, M6 release hardening, GA-0 opening, production readiness, real customer/order data, real LLM calls, customer LLM, external SaaS onboarding, production deploy or 1.0 release.

## Acceptance Mapping

| Item | M5R-07 status | Evidence |
|---|---|---|
| I-02 | `admin_mobile_runtime_wiring_supported_not_true_closeout` | 320px Playwright API-path assertions for confirmation approve/discard and AI emergency/recovery. |
| I-06 | `admin_logs_runtime_wiring_supported_not_export_release` | Logs shell routes board/log/export-job calls through API client; no export file is produced. |
| I-07 | `admin_ai_runtime_wiring_supported_not_owner_accepted` | AI member state/action/toggle API client wiring. |
| A-03/H-04/H-06 | `admin_template_copy_runtime_wiring_supported` | Template copy button routes to `/template-copy/copies`; DB/RLS copy proof remains M5R-06. |
| J-05 | `m5r_07_admin_wiring_evidence_added_not_owner_accepted` | Evidence only; owner acceptance remains future. |
| K-03 | `active` | One spec / one PR. |
| K-04 | `active` | Admin/docs/test scope only; DB/API/backend/global gates untouched. |
