# M11-02 Allowlisted Inbound Customer Truth Evidence

Spec: `docs/specs/M11-02-allowlisted-inbound-customer.md`
Status: `implementation_in_progress`
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
- Conclusion: no new source file or parallel ingest/customer path is justified.

## Implementation Evidence

Pending implementation.

## Validation Log

Pending implementation and review.

## Spec-Compliance Review

Pending.

## Code-Quality Review

Pending.

## Closeout Truth

M11-02 remains open. No Value-0, staging, production, GA or 1.0 completion is claimed by this in-progress record.
