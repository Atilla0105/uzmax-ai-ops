# M5-08 Integration Smoke Closeout Evidence

## Start Audit

Recorded before test/evidence implementation edits on 2026-06-24.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5-08-integration-closeout` |
| assigned `git status --short --branch` | `## codex/m5-08-integration-closeout` |
| assigned `git branch --show-current` | `codex/m5-08-integration-closeout` |
| worker `HEAD` | `b0af77d2f02e11b72bb1127b54399b76428b8dd5` |
| worker `origin/main` | `b0af77d2f02e11b72bb1127b54399b76428b8dd5` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| open PR audit | `gh pr list --state open --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit | `git branch --no-merged main` returned no branch output |
| node_modules | `npm ci` installed 360 packages, 0 vulnerabilities |

## Scope

M5-08 adds docs/test-only integration smoke and closeout evidence for:

- confirmation queue API and DB contract smoke;
- distill candidate cap, downshift recommendation and manual recovery audit contract;
- AI member emergency stop and recovery local action draft;
- logs analytics readback and export draft governance;
- template copy independent tenant version refs and no auto-overwrite;
- owner closeout readiness without owner acceptance.

## Prior Slice Baseline

| Slice | Evidence |
|---|---|
| M5-00 | `docs/evidence/M5/README.md` readiness pack |
| M5-01 | `docs/evidence/M5/M5-01-db-contract-foundation.md` |
| M5-02 | `docs/evidence/M5/M5-02-distill-guardrails.md` |
| M5-03 | `docs/evidence/M5/M5-03-confirmation-queue-api.md` |
| M5-04 | `docs/evidence/M5/M5-04-confirmation-queue-admin.md` |
| M5-05 | `docs/evidence/M5/M5-05-ai-member-console.md` |
| M5-06 | `docs/evidence/M5/M5-06-logs-analytics.md` |
| M5-07 | `docs/evidence/M5/M5-07-template-center.md` |

All prior M5 slices are merged into `main` before this closeout slice.

## Incident Inventory

| Incident | Closeout status |
|---|---|
| `docs/incidents/INC-2026-06-24-m5-04-root-patch-target.md` | Recorded in M5-04 evidence; root/main cleanup verified there. |
| `docs/incidents/INC-2026-06-24-m5-05-root-patch-target.md` | Recorded in M5-05 evidence; root/main cleanup verified there. |
| `docs/incidents/INC-2026-06-24-m5-07-root-patch-target.md` | Recorded in M5-07 evidence; root/main cleanup verified there and included in this closeout inventory. |

No M5 incident in repo evidence involved secrets, real customer/order data, production deployment or release approval.

## Boundaries

M5-08 does not implement runtime source, DB schema, migrations, generated client, API routes, admin source, worker/cron, distill scheduler, persisted alerting, persisted logs, template persistence, external SaaS onboarding, production Redis/worker deployment, customer LLM, GA-0, M6 or 1.0 release behavior.

## No Sensitive Data Statement

This closeout uses synthetic labels, controlled refs and structured statuses only. It must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.

## Integration Smoke Mapping

| Smoke target | Evidence |
|---|---|
| Confirmation queue | `scripts/tests/m5-integration-smoke-closeout.test.mjs` invokes the existing M5-03 API suite and verifies no formal writes. |
| DB contract | M5-08 invokes the M5-01 DB contract suite and builds M5 distill/confirmation/AI contract rows. |
| Distill downshift | M5-08 executes the M5-02 pure distill cap, low-pass-rate downshift, alert draft and manual recovery contracts. |
| AI emergency stop | M5-08 executes M5-05 local emergency stop and recovery drafts. |
| Logs readback | M5-08 checks M5-06 operation-log readback and export draft governance. |
| Template copy independence | M5-08 executes M5-07 copy draft for two tenant-owned version refs and proves no auto-overwrite. |
| Admin smoke | `apps/admin/tests/m5-integration-smoke-closeout.spec.ts` spans confirmation queue, AI member, logs analytics and template center on desktop and 320px mobile. |

## Acceptance Mapping

| Item | M5 closeout status |
|---|---|
| A-03 | `closeout_ready_not_runtime_closed` |
| H-01 | `closeout_ready_not_full_content_workflow_closed` |
| H-02 | `closeout_ready_admin_api_contract_supported_not_formal_write_closed` |
| H-03 | `closeout_ready_diff_required_not_storage_closed` |
| H-04 | `closeout_ready_frontend_local_contract_supported_not_runtime_closed` |
| H-06 | `closeout_ready_template_kind_supported_not_full_quick_reply_closed` |
| H-07 | `closeout_ready_behavior_contract_supported_not_scheduler_closed` |
| I-02 | `closeout_ready_frontend_fallback_supported_not_runtime_closed` |
| I-06 | `closeout_ready_frontend_local_contract_supported_not_runtime_closed` |
| I-07 | `closeout_ready_frontend_local_contract_supported_not_persisted_closed` |
| J-05 | `m5_closeout_ready_not_owner_accepted` |
| K-03 | `active` |
| K-04 | `active` |

## Validation

Recorded on 2026-06-24 from `/Users/atilla/Documents/uzmax-m5-08-integration-closeout`.

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m5-integration-smoke-closeout.test.mjs` | pass | 4 tests passed. |
| `node --test scripts/tests/m5-*.test.mjs` | pass | 32 M5 tests passed across 8 suites. |
| `npm run test` | pass | 356 tests passed across 71 suites. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style after formatting the new Playwright test. |
| `npm run lint` | pass | ESLint completed across apps, packages and scripts. |
| `npm run typecheck` | pass | TypeScript no-emit check passed. |
| `npm run build` | pass | API, worker, cron and admin build chain passed. |
| `npm run size` | pass | Admin bundle size `67.07 kB` brotlied under `250 kB` limit; first sandboxed attempt hit EPERM clearing `apps/admin/dist`, then passed with approved build-output write. |
| `npm run knip` | pass | No unused export/dependency findings reported. |
| `npm run jscpd` | pass | 0 clones found. |
| `npm run depcruise` | pass | No dependency violations found. |
| `npm run playwright` | pass | 21 desktop/mobile admin smoke tests passed. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok` for linked M5-08 worktree. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-08-integration-closeout --root /Users/atilla/Documents/UZMAX智能运营` | pass | Explicit assigned/root boundary check passed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:eval-triggers` | pass | No eval-triggering paths changed. |
| `npm run guard:forbidden-terms` | pass | Forbidden terms guard passed. |
| `npm run guard:prettier-ignore` | pass | Baseline marker guard passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-08-integration-smoke-closeout.md --include-worktree` | pass | 5 changed files; categories docs=3, test=2; source changed files=0, net source LOC=0, new source files=0. |
| `git diff --check origin/main` | pass | No whitespace errors. |

## Closeout Readiness

M5 is ready for project-owner closeout review as `m5_08_integration_closeout_ready__not_owner_accepted`. This is an AI evidence conclusion, not an owner acceptance decision and not a production/release approval.

## Spec Compliance Review

Completed after validation. Result: no findings.

Reviewed scope, status wording, incident inventory and sensitive-data boundary:
the diff is limited to 5 files in the spec touch list (`docs=3`,
`test=2`, `source=0`), keeps
`m5_08_integration_closeout_ready__not_owner_accepted`, records M5-04,
M5-05 and M5-07 incidents, and contains no owner acceptance, production,
GA-0, 1.0 release, raw payload, secret, real customer data or real order
data claim.

## Code Quality Review

Completed after validation. Result: one P3 evidence wording issue fixed.

The reviewer confirmed the Node smoke covers the focused M5-03 and M5-01
suites, distill cap/downshift/recovery, AI emergency/recovery drafts, export
draft governance, template copy independence and DB vocabulary. The reviewer
also confirmed the Playwright smoke uses stable test ids/role selectors,
covers desktop plus 320px essentials, and does not introduce `.skip`/`.only`,
external network, LLM, real DB, formal writes or real customer/order data.
Evidence wording was narrowed from login/presence/operation tables to the
actual M5-08 operation-log readback plus export draft coverage.
