# M10-03 Support Operator Smoke

Spec: `docs/specs/M10-03-support-operator-smoke.md`
Status: `m10_03_support_operator_smoke_workflow_ready_not_run`
Recorded: 2026-07-09
Branch: `codex/m10-03-support-operator-smoke`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-03-support-operator-smoke`

## Current Truth

M10-03 exists to create the missing support-operator validation lane for the customer-service workbench:

- M9-06 proved a deterministic read-only employee session for conversation read evidence.
- M10-01 is the backend write closure branch for conversation-ticket DB mutations.
- M10-02 is the admin runtime truth gate branch that prevents configured runtime from silently falling back to synthetic rows.
- M10-03 will add the independent support-operator staging smoke for the write-capable customer-service path.

The workflow/script/test implementation is now local-validation ready. No live staging mutation has been run.

## Implemented Lane

- Workflow: `.github/workflows/m10-support-operator-smoke.yml`
- Script: `packages/authz/scripts/run-m10-support-operator-smoke.mjs`
- Runtime helpers: `packages/authz/scripts/m10-support-operator-smoke-runtime.mjs`, `packages/authz/scripts/m10-support-operator-smoke-api.mjs`, `packages/authz/scripts/m10-support-operator-smoke-db.mjs`
- Tests: `scripts/tests/m10-support-operator-smoke.test.mjs`

The lane provisions a deterministic support operator distinct from M9-06, writes exact permission grants for `tenant:read`, `conversation:read` and `ticket:write`, seeds one synthetic conversation, runs the conversation-ticket list/handoff/action HTTP path, then cleans the synthetic conversation/ticket rows and reports residue.

Post-review fixes recorded in this implementation:

- Supabase/Auth, DB access-fact, synthetic seed/smoke and residue stages now return sanitized blocked JSON instead of throwing raw provider/DB errors.
- Synthetic conversation seed uses the Postgres enum label `open`.
- Synthetic cleanup and residue checks are scoped by deterministic fixture id plus org, tenant and controlled ref/metadata predicates, including ticket and ticket-event cleanup through the controlled conversation ref.
- Seed failure is wrapped in the same cleanup `finally` as the HTTP smoke.
- Unsupported CLI arguments are not echoed back, so accidental secret-like argv values are not printed.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-03-support-operator-smoke` |
| branch | `codex/m10-03-support-operator-smoke` |
| status before preflight docs | `## codex/m10-03-support-operator-smoke` |
| root/main status | `## main...origin/main` |
| open PR audit before work | `[]` |
| no-merged branch audit before work | `codex/m10-01-conversation-ticket-db-writes`, `codex/m10-02-admin-conversation-runtime-truth-gate`, `codex/m10-03-support-operator-smoke` |

## Boundary

This evidence does not approve:

- live mutating staging dispatch;
- production traffic;
- 1.0 release;
- broad real customer traffic;
- customer/order data expansion;
- customer LLM/provider use;
- Telegram Business automatic reply;
- formal knowledge write, distill auto-write or confirmation bypass.

The live M10-03 pass remains owner-gated and also depends on M10-01 being merged and deployed to the staging API runtime.

## Required Sanitization

The M10-03 workflow/script must not print:

- password value;
- access token or refresh token;
- service role key;
- database URL;
- publishable key;
- raw Supabase auth response;
- customer text;
- conversation payload.

Allowed evidence is limited to sanitized operational facts such as status, HTTP status codes, counts, hash prefixes, org/tenant ids, deterministic smoke ids and permission count.

## Expected Success Token

If the workflow provisions the support operator, writes the exact permission facts and the synthetic staging API list/handoff/action sequence passes, the script status is:

- `m10_03_support_operator_write_smoke_passed_not_release`

Until that live workflow run exists, the current status remains:

- `m10_03_support_operator_smoke_workflow_ready_not_run`

## Validation Log

- `node --test scripts/tests/m10-support-operator-smoke.test.mjs`
  - Result: pass, 10/10 tests.
  - Coverage: missing env fails before provisioning, query-only DB URL fails before provisioning, exact three permission grants, M9 identity reuse rejection, fake Supabase token/list/handoff/action HTTP sequence with scoped headers, sanitized result output, structured blocked results for Auth/DB failures, lowercase DB enum seed, scoped cleanup/residue predicates including ticket rows, seed-failure cleanup, unsupported CLI argument redaction and workflow/spec/evidence static constraints.
- `node packages/authz/scripts/run-m10-support-operator-smoke.mjs --help`
  - Result: pass; help prints without requiring secrets, DB, Supabase or API network.
- `node node_modules/eslint/bin/eslint.js eslint.config.mjs packages/authz/scripts/run-m10-support-operator-smoke.mjs packages/authz/scripts/m10-support-operator-smoke-runtime.mjs packages/authz/scripts/m10-support-operator-smoke-api.mjs packages/authz/scripts/m10-support-operator-smoke-db.mjs scripts/tests/m10-support-operator-smoke.test.mjs`
  - Result: pass.
  - File-length proof: script entry `45` lines, runtime helper `308` lines, API helper `228` lines, DB helper `34` lines.
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M10-03-support-operator-smoke.md --include-worktree`
  - Result: pass.
  - Shape: changed files `8`; categories `config=1`, `docs=2`, `source=4`, `test=1`; source net LOC `397`.
- `git diff --check main...HEAD`
  - Result: pass.
- `git diff --check`
  - Result: pass.

Not run:

- Live workflow dispatch. This remains owner-gated and depends on M10-01 backend writes being merged and deployed to the staging API.
