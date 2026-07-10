# M11-00 Value-0 Customer-Service Closure Contract Evidence

> evidence_id: M11-00-value0-customer-service-closure-contract
> spec: `docs/specs/M11-00-value0-customer-service-closure-contract.md`
> branch: `codex/m11-00-value0-closure-contract`
> status: `contract_ready_execution_open`

## Outcome

The owner-approved work is now governed by one binary, end-to-end customer-service outcome instead of PRD/page completion. M11-00 makes no implementation or runtime mutation. It establishes the serial path M11-01 through M11-10, clarifies the current DeepSeek dev/test boundary in ADR-003 and keeps production/real-customer LLM decisions closed.

## Start Audit

| Fact | Evidence |
|---|---|
| base | `1f68c482970a79edce2d10c0ac5a2b16fd248a8a` |
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-00-value0-closure-contract` |
| assigned branch | `codex/m11-00-value0-closure-contract` |
| worktree status | clean at creation |
| root/main | clean and coordination-only |
| open PRs / unmerged branches before start | none |

## Evidence Basis

- Current schema and migrations already provide tenant-scoped message, customer identity, ticket, audit and LLM accounting storage.
- Current worker/API/admin inspection maps every Value-0 blocker to one serial slice.
- Current ingress inspection found no approved-chat allowlist; current worker inspection found no takeover fence before LLM/send. These are explicit pre-live safety gates rather than residual polish.
- Live read-only runtime inspection found admin/API/worker/cron version skew and recurring cron DB authentication failure; the contract therefore makes aligned Value-0 service SHA and explicit cron repair/isolation M11-09 gates.
- M10-08 implementation and workflow request exist, while owner inbox acceptance/browser login remains a live acceptance step.

No customer plaintext, Telegram raw update, account identity or secret is copied into this evidence.

## Reviews

- Spec compliance: pass. Required spec fields, docs-only touch list, worktree boundary, owner gates, failure branches and serial execution rules are present.
- Documentation quality: pass after correcting slice references, separating ticket close from explicit Bot resume, assigning `conversation:reply`, keeping reply text out of queue payloads and defining Telegram `sent` as API acceptance rather than customer read receipt.

## Impeccable Design Layer

Adopted:

- Preserve the owner prototype and existing compact workbench.
- Make data provenance, takeover/send state, delivery state, permission failures and degraded states explicit.
- Use familiar inline controls with keyboard/focus/error recovery in M11-08.

Rejected:

- A new mock, new visual direction or decorative redesign: the owner prototype already fixes the visual source of truth and the current blocker is missing runtime behavior.
- Synthetic content to fill absent API/customer/send state in strict staging: it would hide the exact product gap M11 exists to close.

## Validation

| Command | Result |
|---|---|
| `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M11-00-value0-customer-service-closure-contract.md --include-worktree` | pass; 3 docs, 0 source |
| `prettier --check` on this spec/evidence and ADR-003 | pass |
| `git diff --check` plus `git show --check --oneline HEAD` after commit | pass; tracked diff and committed new docs checked |

## Next Gate

Merge M11-00, then open M11-01 from updated main. No staging deploy is allowed from this docs-only branch. The only successful milestone closeout token is `value0_staging_support_loop_passed_not_production_not_1_0`.
