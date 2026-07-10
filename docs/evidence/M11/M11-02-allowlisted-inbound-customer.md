# M11-02 Allowlisted Inbound Customer Truth Evidence

Spec: `docs/specs/M11-02-allowlisted-inbound-customer.md`
Status: `local_gates_passed__ci_true_db_pending`
Recorded: 2026-07-10
Branch: `codex/m11-02-allowlisted-inbound-customer`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-02-allowlisted-inbound-customer`

## Current Truth

M11-02 is the first runtime slice of the M11 Value-0 loop. Before this slice:

- a valid Telegram webhook secret could enqueue any supported human chat because no approved-chat allowlist existed;
- the worker had no second admission fence for stale/injected queue items;
- the normalized job did not retain a bounded participant profile;
- the inbound business row retained text length but not readable message text;
- the worker persistence path did not create or link `customer`/`customer_identity`.

The schema and RLS transaction infrastructure already exist. This slice must extend those seams with no schema, migration, config, secret or live deployment change.

## Start Audit

| Fact | Evidence |
|---|---|
| assigned `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-02-allowlisted-inbound-customer` |
| assigned branch | `codex/m11-02-allowlisted-inbound-customer` |
| assigned status before edits | `## codex/m11-02-allowlisted-inbound-customer` |
| base | `main` at `dd73cc6fb196f859b18908332a9eefc1a7ff4133` |
| root/main status | `## main...origin/main` |
| open PR audit | none |
| other unmerged branch audit | none before worktree creation; this assigned branch is the only active unmerged branch after creation |

## Safety Boundary

- Controlled internal/staging Telegram Test Bot data only.
- No raw update, test plaintext, customer identifier, allowlist value, secret or credential is recorded here.
- Real customer messages remain blocked from the third-party LLM by ADR-003.
- `SENT` receipt semantics and operator reply behavior are not claimed by M11-02.

## Existing-Implementation Search Record

- Reuse: `packages/channels/src/index.ts` for normalization.
- Reuse: `apps/api/src/telegram-bot.ts` for ingress admission.
- Reuse: `apps/worker/src/conversation-runtime.ts` and `telegram-bot-worker-service-runtime.ts` for worker defense/business draft shaping.
- Reuse: `apps/worker/src/telegram-bot-conversation-persistence.ts` for RLS-scoped customer/identity/message writes.
- Reuse: `apps/worker/src/worker-service-shell.ts` for fail-closed runtime configuration.
- Update: the existing M6B/M8 webhook, worker and true-DB harnesses must receive a synthetic approved-chat allowlist and assert readable business content/customer identity. Keeping their old no-plaintext assumption would contradict the new product contract, while bypassing allowlist startup would weaken the real runtime gate.
- Extraction: the enforced 400-line limit would be exceeded by adding policy helpers to the already-large channel and conversation runtime files. The approved implementation therefore adds exactly one pure `packages/channels/src/telegram-bot-inbound-contract.ts` module shared by normalization, API admission and worker revalidation/draft shaping. It is an extraction within the existing path, not a parallel ingest/customer implementation.
- Conclusion: no additional source file or parallel ingest/customer path is justified.

## Implementation Evidence

- The BullMQ API path now requires canonical private-chat and participant allowlists, rejects mismatches before queue insertion and returns the same opaque successful acknowledgement shape for admitted and rejected supported updates.
- The real worker composition parses the same two allowlists and every BullMQ processor/worker fails construction when no admission policy is supplied. The processor repeats admission before dedupe, persistence, LLM or outbound work.
- Worker-side payload validation bounds controlled provider/trace refs, validates update kind and dates, and rejects malformed injected jobs before business side effects. Telegram worker failure/completion telemetry no longer records exception text or untrusted BullMQ job ids.
- Normalization retains only bounded participant profile fields. The worker revalidates those fields and writes bounded readable content only to tenant-scoped business message content.
- Customer and identity upserts run inside the existing RLS transaction. A tenant/provider/participant-scoped transaction advisory lock serializes concurrent identity updates; the existing customer link and manual language remain unchanged, `firstSeenAt` tracks the earliest observed event and `lastSeenAt` advances monotonically.
- No schema, migration, generated artifact, lockfile, committed configuration, deployment or secret was added.
- Final guard classification before commit: 10 source files, 8 test/support files and 2 docs; one new source file; net source LOC exactly 600 of the approved 600 maximum.

## Validation Log

| Validation | Result |
|---|---|
| Focused M2/M6B/M8 ingress, worker defense and answer-loop tests | pass; 22/22 after security-review fixes |
| Full `scripts/tests/*.test.mjs` suite | pass; 558/558 |
| TypeScript no-emit typecheck | pass |
| ESLint on every touched source/test file | pass |
| API and worker TypeScript builds | pass |
| dependency-cruiser | pass; 403 modules and 567 dependencies, zero violations |
| jscpd | pass; zero clones |
| knip | pass |
| Prettier on every touched file | pass |
| forbidden-term, doc-trigger, eval-trigger, workspace and worker-boundary guards | pass |
| `git diff --check` | pass |
| Local true-DB/Redis runners | not claimed; this checkout has no RLS DB or Redis connection configuration |
| CI true-DB/Redis runners | pending first PR check; evidence will be updated with the exact run before merge |

## Spec-Compliance Review

PASS after implementation stabilization. The formal read-only review confirmed the 10/8/2 touch classification, then-current budget, double admission fence, bounded profile/content path, tenant-RLS identity semantics, concurrency lock, preserved manual customer fields, strengthened tests and no out-of-scope schema/config/deploy work. The later security fixes only tightened worker admission/metadata validation and remain inside the same approved paths and 600-line hard budget; a final post-commit guard will re-confirm the exact numbers.

## Code-Quality Review

The first manual review failed on two major issues and one minor issue rather than approving optimistically:

- missing policy could fail open in a direct processor path;
- injected job refs/dates were not controlled before persistence/telemetry;
- concurrent identity handling did not explicitly preserve the earliest observation.

All three were addressed with default-deny admission, mandatory BullMQ processor policy, pre-side-effect metadata validation, removal of untrusted job-id telemetry, serialized identity merging and earliest/last-seen handling. Focused and full local gates were rerun successfully. The final manual read-only re-review reported PASS with no remaining blocker, major or minor; it reconfirmed RLS-before-lock ordering, compound tenant identity scope, concurrency time semantics, privacy boundaries and exact net source LOC of 600.

## Closeout Truth

M11-02 remains open until CI true-DB/Redis checks pass. No Value-0, staging, production, GA or 1.0 completion is claimed by this record.
