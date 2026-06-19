# M3-01 AI Capability Data Contracts Foundation

> evidence_id: M3-01-ai-capability-data-contracts-foundation
> milestone: M3
> spec: `docs/specs/M3-01-ai-capability-data-contracts-foundation.md`
> status: implemented_pending_pr_review
> created_at: 2026-06-19
> updated_at: 2026-06-19
> sensitive_data_location: none
> redaction_status: no raw customer data, Telegram payloads, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts or secrets

## Scope

This evidence records only the M3-01 DB/schema/contracts foundation for AI capability data contracts.

Included:

- Prisma model/table mapping for `kb_entry`, `kb_stage`, `media_asset`, `quote_record`, `eval_case`, `eval_run`, `eval_result`, `eval_gate` and `llm_call_log`.
- SQL migration `0004_ai_capability_data_contracts_foundation.sql` with tenant scope, forced RLS, fail-closed policies and no delete runtime grant.
- DB contract exports for table names, status/category/task values and pure builders/validators.
- Contracts README, evals README and M3 evidence index updates.

Not included:

- Production, GA-0, real customer traffic, customer LLM, provider route release, prompt/model/persona release, knowledge publish, API/worker/engine/admin integration, provider adapters, real eval runner, customer asset/order connector/distill/Business schema, full quick reply/template/candidate systems or raw samples.

## TDD Evidence

| Step | Command | Result | Summary |
|---|---|---|---|
| RED setup | `node --test scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs` | failed due worktree dependencies | Initial linked worktree had no `node_modules`; Node could not import `typescript`. |
| Dependency setup | `npm ci` | passed | Installed worktree dependencies; lockfile unchanged. |
| RED | `node --test scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs` | failed as expected | Missing `packages/db/src/m3-ai-contracts.ts`, before M3 schema/migration/contracts/docs implementation. |
| GREEN | `node --test scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs` | passed | 5/5 tests passed after schema/migration/contracts/docs implementation. |

## Prisma Validate Evidence

| Command | Result | Summary |
|---|---|---|
| `UZMAX_RLS_DATABASE_URL=postgresql://user:pass@localhost:5432/db npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma` | passed | Prisma reported schema is valid. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs` | pass | 5/5 focused tests passed. |
| `UZMAX_RLS_DATABASE_URL=postgresql://user:pass@localhost:5432/db npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma` | pass | Prisma schema is valid. |
| `npm run format:check` | pass | Prettier reported all matched files use code style. |
| `npm run typecheck` | pass | TypeScript strict check passed. |
| `npm run lint` | pass | ESLint passed, including max-lines after direct M3 export bridge in `index.ts`. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-01-ai-data-contracts, linked worktree, dirty allowed)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-01-ai-capability-data-contracts-foundation.md --include-worktree` | failed then fixed | First CI/local review rerun failed with `net source LOC 610 > 600`; after reducing M3 value-map source footprint, final rerun passed with changedFiles 10, categories docs 5/generated 1/source 3/test 1, source changedFiles 3, netLoc 560, newFiles 1. |
| `npm run test` | pass | 70/70 tests passed after preserving legacy data-URL DB source tests. |
| `npm run check` | pass | Full local gate passed, including format, typecheck, lint, depcruise, jscpd, knip, guards, tests, build, size and Playwright. |
| `git diff --check` | pass | No whitespace errors. |
| `git status --short --branch` | pass | Final dirty state contains only the allowed M3-01 files. |

## Acceptance Mapping

| Item | M3-01 status | Notes |
|---|---|---|
| F-01 | foundation_queued_not_closed | `kb_entry` / `kb_stage` refs support later tutorial stage localization; tutorial material pack still blocks closeout. |
| F-02 | foundation_queued_not_closed | `media_asset` and eval refs can support later screenshot diagnostic evidence; >=20 owner screenshot samples still block closeout. |
| F-04 | foundation_queued_not_closed | `quote_record` supports code-created quote result and config/version provenance; pricing runtime remains later. |
| F-05 | foundation_queued_not_closed | `llm_call_log` stores metadata/hash/ref summaries only; redline/context enforcement remains later. |
| G-01 | foundation_queued_not_closed | Route/version refs support later LLM routing/fallback foundation; no provider route release. |
| G-02 | foundation_queued_not_closed | LLM accounting/log contracts exist; no dashboard or real provider calls. |
| G-03 | foundation_queued_not_closed | Eval gate persistence exists; publish refusal semantics remain M3-03. |
| G-05 | foundation_queued_not_closed | Eval result/gate summaries support later false-positive evidence; no admin surface. |
| G-06 | foundation_queued_not_closed | Category quota shape exists; no full >=200 eval closure or raw samples. |
| H-01 | foundation_queued_not_closed | Knowledge/resource refs exist; no management UI or knowledge publish. |
| J-05 | foundation_updated | This manifest records M3-01 contract foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | M3-01 is the `packages/db` global serial point. |

## Sensitive Data Boundary

M3-01 stores only schema/contracts and aggregate validation evidence in git. The repository must not receive:

- raw/export/jsonl/csv samples;
- raw Telegram payloads or customer plaintext;
- screenshots or voice transcripts;
- raw prompts or raw completions;
- order IDs, phone numbers, addresses, payment data or customer identifiers;
- support personal accounts, Bot tokens, webhook secrets, LLM keys or other secrets.

Future source material must stay in controlled storage. Repo evidence may only record manifest identifiers, redaction method, storage refs, access scope, retention period and project owner confirmation status.

## Unresolved Future Closure Paths

- M3-02: LLM gateway routing/accounting runtime on top of `llm_call_log`.
- M3-03: eval gate runner, redline checks and production publish refusal.
- M3-04: KB/tutorial capability runtime using `kb_entry` and `kb_stage`; tutorial closeout remains owner-input blocked.
- M3-05: pricing runtime and quote creation using `quote_record`; LLM math remains forbidden.
- M3-06: screenshot diagnostics using controlled media/eval refs; screenshot sample input remains owner-input blocked.
- M3-08: breaker radius and redline output guard evidence.

## Review Notes

- Quote source of truth is code/config provenance, not LLM output.
- LLM call log intentionally has no raw prompt or raw completion columns.
- Eval contracts intentionally support controlled refs/redacted payload shape only; no raw sample content in git.
- No Business/customer asset/order connector/distill tables are introduced by this PR.
- `packages/db/src/m3-ai-contracts.ts` contains the canonical M3 table/status/builder implementation; `packages/db/src/index.ts` keeps a compact data-URL-safe compatibility bridge and is 394 lines, within the ordinary source-file line budget. The source budget fix reduced final `guard:pr-shape` netLoc to 560.
