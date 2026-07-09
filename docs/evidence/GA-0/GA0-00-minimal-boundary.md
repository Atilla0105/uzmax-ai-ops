# GA0-00 Minimal GA-0 Boundary

Spec: `docs/specs/M9-03-ga0-minimal-signoff-boundary.md`
Status: `ga0_minimal_bot_only_boundary_recorded_ai_quality_deferred_not_open`
Recorded: 2026-07-09

## Boundary

This evidence records the selected minimal GA-0 signoff boundary. It does not open GA-0 and does not approve 1.0.

The selected path is Bot-only controlled internal/staging signoff. It is not production, not Telegram Business automatic reply, not formal knowledge write, not broad real customer traffic, not customer LLM approval and not a 1.0 release decision.

## Owner Decision

Project owner explicitly approved deferring G-04 and G-06 for the minimal GA-0 path only:

- G-04 Uzbek quality blind review is `owner_deferred_for_minimal_ga0_only_not_passed`.
- G-06 full >=200 eval quota is `owner_deferred_for_minimal_ga0_only_not_passed`.

This is an owner-approved deferral/exception, not a pass. G-04 and G-06 remain open for 1.0 and any full release posture.

## Required Before GA-0 Can Be Marked Opened

GA-0 remains locked until all three follow-up records exist:

- M9-04 employee admin read evidence.
- M9-05 Bot redline/fuse leave-ticket drill.
- M9-06 owner signoff/open record.

M9-03 only prepares the source-of-truth boundary. It is not the final GA-0 open action.

M9-04 is not closable from local environment alone. Local env evidence does not supply Supabase employee email/password/access token evidence or `UZMAX_RLS_DATABASE_URL` evidence. M9-04 must prove real employee session read behavior through Vercel admin/Supabase, or explicitly record an owner-input blocker if that access is not provided.

M9-05 cannot be closed by the M8 supervisor alone. Existing M8 supervisor evidence proves inbound plus outbound `SENT` or open ticket behavior, but it does not distinguish redline/fuse suppression, zero outbound for a canary, or a reason code. M9-05 needs a tiny follow-up drill script/test unless an existing runtime-evidence path can prove those exact facts.

## Not Approved

- 1.0 remains blocked.
- No production deployment or production traffic is approved.
- No production/customer data expansion is approved.
- No customer LLM or real provider approval is granted.
- No Telegram Business automatic reply or Business expansion is approved.
- No formal knowledge write, distill auto-write or confirmation bypass is approved.
- No broad real customer traffic is approved.
- No GA-0 open audit record is created by this slice.

## Current Evidence Inputs

| Input | Current interpretation |
|---|---|
| `docs/evidence/M6/M6-09-final-acceptance-rollup.md` | Historical M6 no-go package; G-04/G-06 and L-02 remained open. |
| `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md` | External-input blocker class cleared from staging/test-only evidence; GA-0 still locked. |
| `docs/evidence/M8/M8-08-staging-runtime-closeout.md` | Internal staging Bot closed loop evidence exists; production, broad customer traffic, customer LLM, Business and 1.0 remain unapproved. |
| `docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md` | Admin frontend is on Vercel and can reach Render staging API with permission-safe failure behavior; real employee read evidence still requires M9-04. |

## Acceptance Mapping

| Acceptance item | Status |
|---|---|
| G-04 | deferred for minimal Bot-only GA-0 only, not passed |
| G-06 | deferred for minimal Bot-only GA-0 only, not passed |
| L-01 | locked pending M9-04, M9-05 and M9-06 |
| L-02 | M9-05 Bot redline/fuse leave-ticket drill required before opening; current M8 supervisor alone is insufficient |
| 1.0 | blocked |

## Expected M9-05 Minimal Touch List

If no existing runtime-evidence path can prove redline/fuse suppression, zero outbound for a canary and a reason code, the expected minimal future M9-05 touch list is:

- `docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md`
- `docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md`
- `packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs`
- `scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs`
- `package.json`

## Validation

Focused validation for this evidence is `node --test scripts/tests/m9-ga0-minimal-boundary.test.mjs`.
