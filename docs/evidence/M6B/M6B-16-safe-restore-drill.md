# M6B-16 Safe Restore Drill Evidence

> evidence_id: M6B-16-safe-restore-drill
> spec: `docs/specs/M6B-16-safe-restore-drill.md`
> tracking: Linear LAY-24
> status: `safe_restore_branch_schema_rls_drill_passed_rolled_up_by_m6b17_not_ga0`
> recorded_at: 2026-06-27
> sensitive_data_location: none; no DB URL, service role key, backup file, customer/order data or raw secret is recorded

## Scope

M6B-16 creates a real safe restore target using Supabase branching:

- Parent project: `uzmax-dev`, ref `enyocaykcgcfcswycujg`
- Organization: `kbuvfalyysfmptcazxnc`
- Branch name: `uzmax-restore-drill-20260627`
- Branch project ref: `hhclgxtjiuwghyifysdc`
- Branch id: `f8da704b-a4d8-4828-8d25-18f40f0956a6`
- Data mode: `with_data=false`
- Cost returned by Supabase connector: `$0.01344/hour`
- Cleanup: branch deleted after evidence capture; parent project branch list returned only `main`

This is a safe branch schema restore drill. It is not a PITR drill and does not restore production data.

Postscript: M6B-17 later rolls this proof into the external-input blocker closure for LAY-24. This file remains branch schema restore evidence only and does not approve GA-0, PITR or production-data restore.

## Evidence

| Area | Result | Notes |
|---|---|---|
| Cost check | pass | Supabase returned branch cost `$0.01344/hour`; owner had authorized lowest necessary cost. |
| Safe restore target creation | pass | `create_branch` created `uzmax-restore-drill-20260627`, project ref `hhclgxtjiuwghyifysdc`. |
| Branch readiness | pass | `list_branches` later returned status `FUNCTIONS_DEPLOYED`, `preview_project_status=ACTIVE_HEALTHY`, `with_data=false`. |
| Schema restore smoke | pass | SQL on branch ref found core public tables including `org`, `tenant`, `tenant_member`, `permission_grant`, `channel_connection`, `conversation`, and `ticket`. |
| RLS enabled | pass | The checked public tables returned `rowsecurity=true`. |
| Synthetic restore rows | pass | Inserted only controlled synthetic org/tenant/member/grant rows into branch ref `hhclgxtjiuwghyifysdc`. |
| Positive RLS smoke | pass | With role `uzmax_app_runtime` and matching `app.org_id` / `app.tenant_id`, visible rows were `org=1`, `tenant=1`, `tenant_member=1`, `permission_grant=1`. |
| Negative RLS smoke | pass | With mismatched tenant context, visible rows were all `0`. |
| Safe target cleanup | pass | Supabase `delete_branch` returned success for branch id `f8da704b-a4d8-4828-8d25-18f40f0956a6`; follow-up `list_branches` returned only parent `main`, so the temporary restore target is no longer live or connected to runtime services. |

## Boundary

This drill closes the missing safe restore target branch for LAY-24 using a Supabase branch/equivalent restore target. It does not claim:

- production restore;
- production backup/PITR restore;
- real customer/order data restore;
- storage object restore;
- service role or DB URL disclosure;
- GA-0 or 1.0 approval.

## Disposition

LAY-24 can move to Done for the GA-0 Activation safe restore target blocker if the project accepts Supabase branch schema restore + RLS smoke as the required safe restore drill. M6B-17 later records LAY-24 as Done from the accepted external-input closure rollup.

If a later release gate requires PITR or production backup material specifically, open a separate drill. Do not reopen LAY-24 for the already completed safe branch target proof.
