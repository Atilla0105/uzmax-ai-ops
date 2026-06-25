# M6-04 RLS Authz Release Matrix Evidence

Spec: `docs/specs/M6-04-rls-authz-release-matrix.md`
Tracking issue: Linear LAY-9
Status: `m6_rls_authz_release_matrix_recorded_b01_b05_supported_not_production`
Recorded: 2026-06-26

## Boundary

This evidence records the release-level RLS and authorization matrix from repo sources. It does not approve production DB/RLS use, GA-0, 1.0 release, real customer/order data, external SaaS onboarding, customer LLM calls, production Redis/worker deployment or secret handling.

No raw tenant/customer/order/Telegram payloads, phone/address/payment data, screenshots, CSV/JSONL exports, prompt/completion transcripts, LLM keys or production database credentials are stored here.

## Source Manifest

| Area | Source |
|---|---|
| Acceptance matrix | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| RLS architecture | `UZMAX智能运营系统-技术架构-v1.1.md`; `docs/adr/ADR-001-rls-prisma-pool.md` |
| Access context architecture | `docs/adr/ADR-002-dual-auth-access-context.md` |
| RLS spike evidence | `docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md` |
| Authz implementation | `packages/authz/src/index.ts` |
| API access guard | `apps/api/src/access-context.ts` |
| Order-import RLS runner | `apps/api/src/order-import.rls-runner.ts` |
| Platform tests | `scripts/tests/m1-platform-foundation.test.mjs` |
| API access-context tests | `scripts/tests/m1-02-api-access-context.test.mjs` |
| M4 RLS gateway tests | `scripts/tests/m4-order-import-rls-batch-runner-contract.test.mjs`; `scripts/tests/m4-order-import-rls-transaction-gateway-contract.test.mjs` |
| M5R true DB closeout | `docs/evidence/M5R/M5R-08-true-integration-closeout.md`; `scripts/tests/m5r-true-integration-closeout.test.mjs` |
| RLS runbook | `docs/runbooks/rls-misconfig.md` |

## Acceptance Matrix Mapping

| Item | Current M6-04 release status | Evidence |
|---|---|---|
| A-02 Tenant/Org data model | `supported_by_prior_foundation_not_production` | M1 platform skeleton evidence and tests cover tenant/org model, memberships and RLS primitives. |
| B-01 RLS zero cross-tenant read | `supported_by_spk03_m1_m4_m5r_not_production` | ADR-001, SPK-03, M1 platform tests, M4 order-import RLS gateway tests and M5R true-DB closeout provide dev/staging evidence. |
| B-02 API guard rejects forged tenant_id | `supported_by_access_context_contract` | `apps/api/src/access-context.ts` derives user through Supabase `auth.getUser(token)` and loads access context server-side; `scripts/tests/m1-02-api-access-context.test.mjs` covers revoked/wrong tenant and no JWT permission trust. |
| B-03 Group role aggregate-only boundary | `supported_at_contract_level_release_review_pending` | M1 evidence records group permission boundaries; M6-04 keeps this as contract-level support until a release review verifies production customer plaintext surfaces. |
| B-04 Backend permission enforcement | `supported_by_guard_and_authz_tests` | `RequirePermission`, `ApiAccessContextGuard`, `assertPermission` and M1 access-context tests verify backend denial; frontend hiding is not counted as authorization. |
| B-05 Permission/audit records | `supported_by_contract_and_true_db_subset` | M1 tests cover `permission_grant.changed`, `config_version.saved` and rollback audit events; M5R true integration closeout records masked true-DB evidence for selected write paths. Full production audit review remains a release gate. |
| J-04 Runbook drill for RLS misconfig | `supported_by_updated_runbook` | `docs/runbooks/rls-misconfig.md` contains SPK-03 commands, M6-04 release-drill commands and failure branches. |
| J-06 ADR-backed infrastructure decisions | `supported_by_adr_and_spk03_links` | ADR-001, ADR-002 and SPK-03 are linked and covered by evidence/test manifests. |
| K-03 Sensitive material boundary | `supported_by_repo_evidence_boundary` | M6 evidence stores links/status only and excludes raw customer/order/Telegram/LLM/secrets material. |
| K-04 Secret management boundary | `supported_by_no_secret_repo_storage` | RLS true-DB URL remains a CI secret (`UZMAX_RLS_DATABASE_URL`); repo evidence only records masked status. |
| L-01 GA-0 checklist | `still_closed` | RLS/authz release matrix support does not open GA-0; owner decision and remaining M6 gates are still required. |

## Release Scenarios

| Scenario | Expected result | Repo evidence |
|---|---|---|
| Missing tenant context | Backend/RLS fail closed before business query. | `packages/authz/src/index.ts`; `scripts/tests/m1-02-api-access-context.test.mjs`; `scripts/tests/m1-platform-foundation.test.mjs` |
| Forged tenant/org context | server-side context loader rejects non-member or revoked tenant. | `apps/api/src/access-context.ts`; `scripts/tests/m1-02-api-access-context.test.mjs` |
| Wrong role or unsafe RLS role | Batch runner rejects malformed role SQL and requires configured role. | `apps/api/src/order-import.rls-runner.ts`; `scripts/tests/m4-order-import-rls-batch-runner-contract.test.mjs` |
| Frontend-only permission hiding | Not accepted as authorization; backend guard must deny. | `apps/api/src/access-context.ts`; `packages/authz/src/index.ts`; `scripts/tests/m1-02-api-access-context.test.mjs` |
| RLS misconfiguration | Block release/GA and run RLS misconfig drill. | `docs/runbooks/rls-misconfig.md`; ADR-001; SPK-03 manifest |
| Audit trail missing actor/time/before/after | Keep B-05 and release gate open until fixed or explicitly no-go. | `scripts/tests/m1-platform-foundation.test.mjs`; `scripts/tests/m1-02-api-access-context.test.mjs`; M5R true integration evidence |

## Evidence Interpretation

- B-01 is evidence-supported for dev/staging release readiness, not production approval.
- B-02 and B-04 are supported by current backend source contracts and tests; admin UI permission hiding is not treated as sufficient.
- B-03 is supported at contract/evidence level but remains release-review-sensitive because real production plaintext surfaces are not exercised here.
- B-05 is supported for known audit/config/permission paths and selected true-DB writes; it still requires final release rollup coverage across all high-risk actions.
- J-04 now has a concrete RLS misconfiguration drill entry.
- L-01 remains closed because M6 has other open runtime and acceptance gaps.

## Validation Commands

The focused validation for this PR is:

```bash
node --test scripts/tests/m6-rls-authz-release-matrix.test.mjs
```

Release-level supporting commands are:

```bash
node --test scripts/tests/m1-02-api-access-context.test.mjs
node --test scripts/tests/m1-platform-foundation.test.mjs
node --test scripts/tests/m4-order-import-rls-batch-runner-contract.test.mjs
node --test scripts/tests/m4-order-import-rls-transaction-gateway-contract.test.mjs
node --test scripts/tests/m5r-true-integration-closeout.test.mjs
```

True DB RLS drill commands remain gated by CI/dev-staging secret availability:

```bash
npm run -w @uzmax/db prisma:generate
UZMAX_RLS_SET_ROLE=uzmax_spk03_ci \
UZMAX_RLS_SPIKE_CONCURRENCY=16 \
npm run -w @uzmax/db spike:rls-prisma-pool
```

## Remaining Gaps

- Production DB/RLS approval is not granted.
- GA-0 is not open.
- B-03 production customer-plaintext review remains a final-release concern.
- B-05 must remain in final rollup until every release high-risk action has audit evidence.
- Remaining M6 runtime slices still need to close AI safety/eval gates, Bot-only GA-0 main path, synthetic E2E, backup/restore and final acceptance closure.
