# M6B-17 GA-0 External Blocker Rollup Evidence

> evidence_id: M6B-17-ga0-external-blocker-rollup
> spec_id: M6B-17
> status: external_input_blockers_cleared_ga0_still_locked_not_release
> created_at: 2026-06-27
> source_files: `AGENTS.md`, `docs/specs/M6B-17-ga0-external-blocker-rollup.md`, `docs/evidence/M6B/README.md`, `docs/release.md`, Linear LAY-19, LAY-23, LAY-24, LAY-30 comments/statuses, Render staging resources, Vercel `uzmax-admin` preview deployments
> sensitive_data_location: none
> redaction_status: no secret values, DB URLs, Bot tokens, webhook secrets, raw customer/order/message data or provider keys

## Result

The external-input blockers that previously kept GA-0 activation stalled are cleared in staging/test-only evidence:

| Tracker | Status | Closure evidence |
|---|---|---|
| LAY-30 | Done | Render staging API `/healthz` 200 and `/readyz` 200 after live Supabase/Auth/RLS env and synthetic authz facts were activated. |
| LAY-19 | Done | Render staging API, worker, cron and Redis are live; alert Telegram fire proof succeeded; worker and cron heartbeat evidence recorded. |
| LAY-23 | Done | API, worker, cron and admin completed A -> B -> A deploy rollback drill with live platform IDs and queue/idempotency evidence. |
| LAY-24 | Done | Safe restore drill ran against an isolated Supabase safe target/branch, post-restore RLS smoke passed and the safe target was removed. |

This clears the "missing external input" class of blockers. It does not open GA-0.

## Live Runtime Closure

| Area | Evidence |
|---|---|
| API staging | `https://uzmax-api-staging.onrender.com`; final rollback state `main` / `4de3f9a211a32607b5a845b19886681587bd39d6`; `/healthz` 200, `/readyz` 200 and missing-secret webhook 401 after A rollback. |
| Worker staging | Render `uzmax-worker-staging` / `srv-d8vqa6e7r5hc73ai7a10`; final rollback deploy `dep-d8vra4m7r5hc73aj7i7g`; `worker.ready`; controlled update `providerUpdateId=604311060` completed once with `attemptsMade=1`. |
| Worker rollover safety | Controlled update `providerUpdateId=604301642` was accepted during the B window and later completed once with `attemptsMade=1`; no observed loss or duplicate completion. |
| Cron staging | Render `uzmax-cron-staging` / `crn-d8vqntu7r5hc73ailb60`; final A build `bld-d8vrb3ugvqtc738ro9h0`; final run `startedAt=2026-06-27T11:37:03.957Z`, `status=skipped`, reason `daily_unit_already_completed`. |
| Admin staging | Vercel `uzmax-admin` / `prj_5XhdIOD2zxmDASwimiYCXZICC1F5`; B preview `dpl_BSzZhFasAyPESAAHZV6c2g8xNmV8`; A rollback preview `dpl_FF8arhXgtBXmcr9p7T2LfQfSsQ4t`; final project latest deployment is A with `target=null`. |
| Alert fire | LAY-19 evidence records controlled alert send through `UZMAX_ALERT_TELEGRAM_BOT_TOKEN` / `UZMAX_ALERT_TELEGRAM_CHAT_ID` using redacted IDs only. |
| Restore | LAY-24 evidence records isolated safe target restore, RLS smoke, source/target isolation and cleanup. |

## Platform Boundary

- All platform actions were staging/test-only.
- Vercel admin deployments used preview `target=null`; no production promotion occurred.
- Render services ended on `main` / `4de3f9a211a32607b5a845b19886681587bd39d6`.
- Temporary rollback branch `codex/m6b-rollback-drill-b` was deleted after the drill.
- No production/customer data, production Bot token, customer outbound traffic, customer LLM or real provider workflow was opened.

## GA-0 Posture

GA-0 remains locked because owner release approval is still a separate decision and this docs slice does not change production/customer-data boundaries. The cleared item is only the external-input blocker class:

- staging runtime is now live enough to support GA-0 activation evidence;
- deploy/rollback and safe restore drills are no longer blocked on missing owner/platform input;
- the release gate still requires explicit owner opening and any remaining non-external release conditions in the acceptance matrix.

## Validation

| Check | Result |
|---|---|
| Root/main preflight | clean before M6B-17 worktree creation |
| Assigned worktree | `/tmp/uzmax-m6b17-rollup` |
| Assigned branch | `codex/m6b-17-ga0-external-rollup` |
| Linear tracker check | LAY-19, LAY-23, LAY-24 and LAY-30 are Done |
| Temporary branch cleanup | `codex/m6b-rollback-drill-b` remote branch deleted after rollback drill |
| Secret boundary | no secret values are recorded in this file |
