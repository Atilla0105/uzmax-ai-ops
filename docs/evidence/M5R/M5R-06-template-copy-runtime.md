# M5R-06 Template Copy Runtime Evidence

## Start Audit

Recorded on 2026-06-25 before implementation edits from the assigned M5R-06 worktree.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/private/tmp/uzmax-m5r-06-template-copy-runtime` |
| assigned `git status --short --branch` | `## codex/m5r-06-template-copy-runtime` |
| assigned `git branch --show-current` | `codex/m5r-06-template-copy-runtime` |
| worker `HEAD` | `42f2a87ace645ddc3d4dd354b789509c12d42760` |
| worker `origin/main` | `42f2a87ace645ddc3d4dd354b789509c12d42760` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| open PR audit | `gh pr list --state open --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit before edits | `git branch --no-merged main` returned no branch output |
| linked worktree git-dir/common-dir | worker git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5r-06-template-copy-runtime`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git`; superproject empty |

## Scope

M5R-06 adds a minimal runtime source for copying controlled group template refs into tenant-owned independent `config_version` rows:

- supported template kinds: `ai_member`, `config`, `eval`, `quick_reply`;
- proof path uses existing `config_version(config_domain = template_copy)` and `audit_log`;
- copied tenant versions are DRAFT snapshots and do not activate or overwrite production config;
- copy payload stores controlled source refs/metadata only;
- source ref/metadata changes after copy do not mutate existing copied tenant payloads.

Allowed files are exactly the allowlist in `docs/specs/M5R-06-template-copy-runtime.md`. Root/main checkout is read-only for this worker.

## Current DB Contract Check

Existing DB/runtime tables before M5R-06:

- present: `config_version` with `ConfigVersionDomain.TEMPLATE_COPY`, version/key uniqueness, tenant scope, forced RLS and `uzmax_app_runtime` select/insert grants;
- present: `audit_log` with tenant scope, before/after content, forced RLS and `uzmax_app_runtime` select/insert grants;
- no dedicated group-template table exists and none is required for the M5R-06 proof path.

M5R-06 therefore does not add Prisma schema, migration, RLS policy or generated-client changes.

## Process Incident

`docs/incidents/INC-2026-06-25-m5r-06-root-patch-target.md` records a worker patch-target boundary error: the first M5R-06 docs/source/test/smoke patch landed in `/Users/atilla/Documents/UZMAX智能运营` root/main instead of the assigned `/private/tmp/uzmax-m5r-06-template-copy-runtime` worktree.

Impact was limited to uncommitted M5R-06 files and tracked edits created by this worker. The tracked diff was applied to the assigned worktree, untracked files were moved to the assigned worktree, then root/main tracked files were restored. Post-cleanup root/main status returned to `## main...origin/main`. No commit, push, PR, secret, customer/order data, LLM call, production deploy or external SaaS action occurred during the incident.

The assigned worktree now holds the M5R-06 diff and this incident record.

## Boundaries

This slice does not implement admin UI runtime wiring, Playwright API-backed admin closure, broad template library, `packages/ops-assets` expansion, quick-reply CRUD/search/import/export, template sync runtime, production config overwrite, worker/cron behavior, schema/migration changes, production deploy, external SaaS onboarding, real customer/order data, customer LLM, real LLM calls, GA-0, M6, M5 owner acceptance or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5R-06 uses synthetic UUIDs, controlled refs, synthetic org/tenant names and structured metadata only.

## Runtime/RLS Evidence

- `apps/api/src/template-copy-runtime.ts` exposes a minimal `POST /template-copy/copies` controller guarded by `ApiAccessContextGuard` and `template:write` permission.
- `apps/api/src/template-copy-runtime.contracts.ts` accepts only supported template kinds `ai_member`, `config`, `eval` and `quick_reply`; source template refs must be `controlled://group-template/...`; snapshot/reason/control refs must be controlled refs; unsafe raw/customer/order/prompt/completion/secret/blob/url/file/base64-like ref bodies or path segments fail closed.
- `apps/api/src/template-copy-runtime.repository.ts` keeps default mode disabled and requires explicit `UZMAX_TEMPLATE_COPY_RUNTIME_MODE=rls_prisma_gateway`; bare `prisma_gateway` is rejected.
- Explicit runtime uses `createRlsTransactionContext`, restricted `uzmax_app_runtime` role and transaction-scoped `app.org_id` / `app.tenant_id` before DB reads/writes.
- Runtime writes only existing `config_version` and `audit_log`: a tenant-owned `config_version` with `domain = TEMPLATE_COPY`, `status = DRAFT`, no `activatedAt`, increasing version per tenant/key, and payload snapshot containing controlled source refs plus `formalTenantWrite: false` and `templateAutoOverwrite: false`.
- Runtime audit rows use `eventType = template_copy.copied`, `module = template_copy_runtime`, actor, source template ref, config version ref, template kind and before/after copy metadata; audit `before` stores only previous version id/ref/version/template metadata and safe controlled source refs, not the whole previous payload.
- `apps/api/src/app.module.ts` wires the controller/provider disabled by default; missing DB env does not affect default AppModule boot.
- `apps/api/scripts/runtime-compiler.mjs` emits template-copy runtime modules for focused tests and true DB smoke support.
- `packages/ops-assets/src/index.ts` remains the placeholder package export; no broad ops-assets template library was added.

## Quality Review Fix

QUALITY_BLOCKED follow-up completed in the same M5R-06 branch/PR:

- controlled-ref validation now normalizes the ref body and rejects unsafe raw/customer/order/prompt/completion/secret/blob/url/file/base64-like material inside path segments for source, snapshot, updated, reason and control refs;
- audit `before` metadata no longer persists `previous.payload` wholesale and focused tests assert arbitrary prior payload fields are absent.

## True DB/RLS Smoke Status

`blocked_by_missing_env`.

Command:

`node packages/db/scripts/run-m5r-template-copy-true-db-smoke.mjs`

Result: expected fail-closed before Prisma client construction or DB mutation.

Exact local error:

`Error: UZMAX_RLS_DATABASE_URL is required`

The support runner is ready to execute same-tenant positive and wrong-tenant/missing-context negative DB/RLS probes when `UZMAX_RLS_DATABASE_URL` is available. It seeds synthetic org/tenant rows, copies a `quick_reply` group template ref into `config_version(domain=TEMPLATE_COPY, status=DRAFT)`, reads back `audit_log`, proves tenant-B cannot see tenant-A copied config versions, checks missing-context reads return zero rows under restricted role, then performs a second source snapshot copy and asserts the first tenant payload remains unchanged.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed locked dependencies because `node_modules` was missing at worker start. |
| `node --test scripts/tests/m5r-template-copy-runtime.test.mjs` | pass | 6/6 focused tests passed after quality-review fix. |
| `node packages/db/scripts/run-m5r-template-copy-true-db-smoke.mjs` | expected fail-closed | Missing `UZMAX_RLS_DATABASE_URL`; exact error `UZMAX_RLS_DATABASE_URL is required`. |
| `npm run typecheck -- --pretty false` | pass | TypeScript no-emit check passed. |
| `npm run lint` | pass | ESLint passed after splitting input validation complexity. |
| `npm run knip` | pass | No unused exports. |
| `npm run jscpd` | pass | No duplicates found after reshaping local helpers. |
| `npm run depcruise` | pass | No dependency violations. |
| `npm run format:check` | pass | Prettier check passed. |
| `npm run guard:prettier-ignore -- --base origin/main` | pass | Frozen ignore boundary and diff check passed. |
| `npm run guard:forbidden-terms` | pass | Forbidden terms guard passed. |
| `npm run guard:eval-triggers -- --base origin/main` | pass | No eval-triggering paths changed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | Linked worker worktree accepted; dirty allowed. |
| `npm run guard:worker-boundary -- --assigned /private/tmp/uzmax-m5r-06-template-copy-runtime --root /Users/atilla/Documents/UZMAX智能运营` | pass | Explicit assigned/root boundary check passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5R-06-template-copy-runtime.md --include-worktree` | pass before final evidence update | Pre-stage run found 12 changed files and categories source 6/docs 4/test 2; final staged rerun is required after evidence update. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors before final evidence update. |
| `npm run test` | pass | Full Node suite passed: 386 tests, 77 suites, 0 failures. |
| `npm run build` | pass | API/worker/cron type-only builds and admin Vite build passed. |

## Source Budget

Manual source budget from `git diff --numstat origin/main` after the quality-review fix and before final evidence update:

| Metric | Value | Budget status |
|---|---:|---|
| changed source files | 6 | within target `<= 8` |
| net source LOC | +589 | within target `<= 600` |
| new source files | 4 | within target `<= 4` |
| test LOC | +475 | test, not source budget |
| docs/incident LOC before final evidence update | +315 / -3 | docs, not source budget |

Source files counted:

- `apps/api/scripts/runtime-compiler.mjs`: +39 / -1
- `apps/api/src/app.module.ts`: +23 / -0
- `apps/api/src/template-copy-runtime.contracts.ts`: +235 / -0
- `apps/api/src/template-copy-runtime.repository.ts`: +210 / -0
- `apps/api/src/template-copy-runtime.ts`: +74 / -0
- `packages/db/scripts/run-m5r-template-copy-true-db-smoke.mjs`: +9 / -0

No `large_change_exception` is used.

## Spec Compliance Review

Pass.

- One spec only: `docs/specs/M5R-06-template-copy-runtime.md`.
- Touch list is limited to M5R-06 docs/evidence/incident, minimal API runtime source, focused test and true DB smoke support.
- Existing `config_version` and `audit_log` contracts were sufficient; no Prisma schema, migration, RLS policy or generated-client changes were made.
- `packages/ops-assets` remains a placeholder and is not expanded.
- Runtime writes DRAFT `template_copy` config versions only; no production config overwrite or automatic activation is added.
- Supported proof kind includes `quick_reply`; full quick-reply search/import/export/permission closure remains future.
- No admin UI runtime wiring, worker/cron, real customer/order data, real template material, external provider calls, production deploy or owner acceptance claim is included.
- True DB/RLS remains blocked only by missing `UZMAX_RLS_DATABASE_URL`.
- No tests were deleted, skipped, weakened, broadened by mock expansion or snapshot-inflated.

## Code Quality Review

Pass.

- Runtime mode is explicit and fail-closed: default disabled, `rls_prisma_gateway` only, bare `prisma_gateway` rejected.
- Contracts reject unsafe raw/customer/order/prompt/completion/secret/blob/file/url/base64-like payload keys and controlled-ref body/path material before repository calls.
- RLS transaction setup mirrors prior M5R patterns while avoiding duplicate helper shapes caught by `jscpd`.
- The repository keeps copy behavior narrow: previous version lookup, DRAFT config-version create and audit-log create only.
- Focused tests cover disabled/default mode, RLS transaction shape, supported kind validation, unsafe payload rejection, no schema/ops-assets expansion and missing-env true DB failure.
- The true DB smoke support is synthetic-only, cleans up rows, and asserts residue `0` when a DB URL is available.

## Acceptance Mapping

| Item | M5R-06 status | Evidence target |
|---|---|---|
| A-03 | `template_copy_runtime_supported_not_admin_wired` | Runtime copy creates tenant-owned independent `template_copy` config versions; visible admin wiring remains M5R-07. |
| H-04 | `template_copy_independent_version_supported_not_full_template_center_closed` | Tenant copy is a DRAFT immutable snapshot; group source ref/metadata changes do not auto-pollute the tenant version. |
| H-06 | `quick_reply_template_copy_path_supported_not_full_quick_reply_closed` | `quick_reply` is supported as the smallest proof kind; public/private quick-reply search, import/export and permissions remain future. |
| J-05 | `m5r_06_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-06 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-06. |
| K-04 | `active` | Worker worktree/branch/touch list are scoped; schema/migration/ops-assets/global gates remain untouched. |

M5R-06 does not update M5 owner acceptance status.
