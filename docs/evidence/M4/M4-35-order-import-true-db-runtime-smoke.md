# M4-35 Order Import True DB Runtime Smoke Evidence

> spec: `docs/specs/M4-35-order-import-true-db-runtime-smoke.md`
> branch: `codex/m4-35-order-import-true-db-runtime-smoke`
> worktree: `/Users/atilla/Documents/uzmax-m4-35-order-import-true-db-runtime-smoke`
> target: Supabase `uzmax-dev` dev main through `UZMAX_RLS_DATABASE_URL`
> date: 2026-06-23

## Scope

This evidence records the minimum M4 order import runtime smoke that can run against the real Supabase dev main DB after M4-34 applied the M1-M4 schema/RLS baseline.

The smoke exercises:

- worker CSV text import draft generation for one successful order snapshot and one row error;
- worker Prisma persistence mapping from contract enum values to Prisma Client enum names;
- RLS-context DB writes under `set local role "uzmax_app_runtime"` with transaction-local `app.org_id` and `app.tenant_id`;
- API order-import repository reads through the RLS Prisma transaction runner;
- tenant A visibility and tenant B non-visibility for the synthetic import rows;
- cleanup of the synthetic org and child rows with residue check `0`.

This is not full E-02 closure. It does not cover admin browser E2E, BullMQ/Redis execution, Storage upload/download runtime, XLSX parsing, real CSV samples, real customer/order data, external order API, AI order-read runtime, eval redlines, production DB or GA release readiness.

## Synthetic Data Boundary

The smoke uses fixed non-real UUIDs and controlled refs only:

| Item | Value |
|---|---|
| Org | `11111111-1111-4111-8111-111111111135` / `m4-35-synthetic-org` |
| Tenant A | `22222222-2222-4222-8222-222222222135` |
| Tenant B | `33333333-3333-4333-8333-333333333135` |
| User | `44444444-4444-4444-8444-444444444135` |
| Import job | `55555555-5555-4555-8555-555555555135` |
| Order snapshot | `66666666-6666-4666-8666-666666666135` |
| Row error | `77777777-7777-4777-8777-777777777135` |
| Source ref | `storage://order-imports/m4-35-true-db-runtime-smoke.csv` |
| Order ref | `controlled://order/m4-35-ref-a` |
| Marker | `metadata.synthetic_spec = M4-35` |

No raw order/customer data, screenshots, phone/address/payment/order IDs, credentials, env files or secret values are written to repo or printed by the smoke.

## Verification Commands

Local worker validation target:

```bash
node --test scripts/tests/m4-order-import-worker-prisma-persistence-contract.test.mjs
```

CI true DB validation target:

```bash
npm run smoke:m4-order-import:true-db
```

The root script delegates to `@uzmax/db`:

```bash
npm run -w @uzmax/db smoke:m4-order-import:true-db
```

The CI step must receive `UZMAX_RLS_DATABASE_URL` from GitHub Actions secrets. The local shell does not need to store or print that secret.

## Runtime Assertions

The true DB smoke asserts:

| Check | Expected |
|---|---|
| Worker generated persisted counts | `{ importJobs: 1, rowErrors: 1, snapshots: 1 }` |
| RLS write context | `uzmax_app_runtime`, tenant A |
| Tenant A `listJobs` | includes synthetic import job |
| Tenant A `getJob` | returns synthetic import job |
| Tenant A `listRowErrors` | returns one synthetic row error |
| Tenant A `findSnapshot(order_ref)` | returns synthetic order snapshot |
| Tenant B `listJobs` | does not include synthetic import job |
| Tenant B `findSnapshot(order_ref)` | returns `undefined` |
| Cleanup residue | `0` |

## Results

Local validation before PR:

| Command | Result |
|---|---|
| `npm ci` | pass; worktree-local `node_modules` installed |
| `npm run -w @uzmax/db prisma:generate` | pass |
| `npx prettier --write ...touched files...` | pass; no broad churn |
| `node --test scripts/tests/m4-order-import-worker-prisma-persistence-contract.test.mjs` | pass, 4 tests |
| `npm run format:check` | pass |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm run depcruise` | pass, no dependency violations |
| `npm run jscpd` | pass, 0 clones |
| `npm run knip` | pass after moving the smoke under `@uzmax/db` so `@prisma/client` remains declared in the owning workspace |
| `npm run guard:prettier-ignore -- --base origin/main` | pass |
| `npm run guard:forbidden-terms` | pass |
| `npm run guard:eval-triggers -- --base origin/main` | pass, no eval-triggering paths changed |
| `npm run guard:doc-triggers` | pass |
| `npm run guard:workspace` | pass for linked worker worktree |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-35-order-import-true-db-runtime-smoke.md --include-worktree` | pass; 8 changed files, categories config 3/source 2/test 1/docs 2 |
| `npm run test` | pass, 271 tests |
| `npm run build` | pass |
| `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-35-order-import-true-db-runtime-smoke npm run guard:worker-boundary` | pass; CI-mode physical root enforcement limited/skipped |

Local true DB smoke:

| Command | Result |
|---|---|
| `npm run smoke:m4-order-import:true-db` | fail-closed locally with `UZMAX_RLS_DATABASE_URL is required`; the local shell does not have the secret and no secret value was printed |

Local worker-boundary full mode:

| Command | Result |
|---|---|
| `npm run guard:worker-boundary` | blocked by pre-existing root/main untracked duplicate docs outside this spec: `docs/adr/ADR-B02-order-api 2.md`, `docs/adr/README 2.md`, `docs/evidence/M4/README 2.md`, `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`, `docs/specs/SPK-02-order-api 2.md` |

GitHub CI true DB smoke:

| Run | Result |
|---|---|
| PR #96 pull_request run `28010542196`, step `M4 order import true DB runtime smoke` | pass; step completed successfully before the remaining SPK-03/SPK-04 and general CI steps continued |

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| B-01 | `true_db_runtime_smoke_supported_not_closed` | Adds an automated dev DB RLS read/write smoke for M4 order import rows. Full durable SQL/RLS matrix remains future scope. |
| E-01 | `not_current_blocker__no_api_for_m4` | No external order API connector was added or called. |
| E-02 | `worker_api_true_db_smoke_supported_not_closed` | Worker CSV draft -> DB/RLS -> API repository read path is executable against dev main. Admin visible E2E, queue runtime, Storage runtime and real import sample remain open. |
| E-03 | `not_closed` | Stale snapshot warning E2E is not covered here. |
| E-04 | `not_closed` | AI order-read runtime, eval fixtures and redline gate are not covered here. |
| J-02 | `not_closed` | BullMQ/Redis retry/idempotency/backlog/fault-injection evidence is not present. |
| I-01 | `not_closed` | Full desktop order/customer/knowledge/eval workflow E2E is not present. |

## Boundary Notes

- This smoke intentionally strengthens the progress signal after M4-34: it tests a live worker-to-DB-to-API repository path instead of only asserting contract-shaped objects.
- This evidence still cannot close full E-02, because the验收矩阵 requires E2E testing with import samples and owner evidence for the main path.
- Existing root/main untracked duplicate docs are outside this spec and were not edited.
