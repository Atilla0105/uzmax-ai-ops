# GA0-01 Minimal Bot-Only Signoff

Spec: `docs/specs/M9-07-ga0-minimal-signoff-record.md`
Status: `ga0_minimal_bot_only_signoff_recorded_not_1_0`
Recorded: 2026-07-09

## Current Truth

The minimal Bot-only GA-0 signoff package is recorded for controlled internal/staging use.

This signoff is based on the project owner direction in the Codex thread to complete the minimal GA-0 signoff path, skip AI quality gates for this path, and create the smoke employee account needed to close M9-04.

This is not a 1.0 release decision and not production expansion.

## Closed Inputs

| Required record | Current status |
|---|---|
| M9-04 employee admin read evidence | `m9_04_employee_admin_read_passed_not_ga0_open` via M9-06 workflow run `29006898466` |
| M9-05 Bot redline/fuse leave-ticket drill | `m9_05_bot_redline_fuse_canary_passed_not_ga0` |
| M9-06 employee provisioning smoke | `m9_06_employee_account_provisioned_m9_04_live_passed_not_ga0_open` |

## Live Run Evidence

| Fact | Value |
|---|---|
| workflow | `M9 GA-0 Employee Smoke` |
| run | `29006898466` |
| job | `86080558072` |
| head SHA | `735934b6b8b15cda4b1aaf80996a18af4895ea5d` |
| conclusion | `success` |
| M9-06 status | `m9_06_employee_account_provisioned_m9_04_live_passed_not_ga0_open` |
| nested M9-04 status | `m9_04_employee_admin_read_passed_not_ga0_open` |
| conversation HTTP status | `200` |
| conversation count | `2` |
| smoke employee user id | `90000000-0000-4000-8000-000000000906` |
| smoke employee mode | `created` |
| permission count | `2` |
| permissions | `tenant:read`, `conversation:read` |

The sanitized JSON shape check passed locally against the downloaded artifact: no password key, service role key, database URL, access token, refresh token, raw response, customer text or conversation payload was present.

The earlier workflow run `29005953274` is superseded. It failed before provisioning because the workflow used Node 20; PR #288 switched the workflow to Node 24, and run `29006898466` is the controlling evidence.

## Signoff Scope

This record signs off only the minimal Bot-only GA-0 evidence package for controlled internal/staging operation.

The following remain explicitly not approved:

- 1.0 release.
- Production traffic.
- Broad real customer traffic.
- Broad real customer/order data expansion.
- Customer LLM/provider use.
- Telegram Business automatic reply.
- Formal knowledge write, distill auto-write or confirmation bypass.
- G-04 Uzbek quality blind review as passed.
- G-06 full >=200 eval quota as passed.

G-04 and G-06 are owner-deferred for this minimal Bot-only GA-0 path only. They remain open for 1.0 and any full release posture.

## Source Links

- `docs/evidence/M9/M9-04-admin-employee-read-evidence.md`
- `docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md`
- `docs/evidence/M9/M9-06-ga0-employee-provisioning-smoke.md`
- `docs/evidence/GA-0/GA0-00-minimal-boundary.md`
