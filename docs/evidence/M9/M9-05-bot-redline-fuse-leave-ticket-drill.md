# M9-05 Bot Redline Fuse Leave-Ticket Drill Evidence

Spec: `docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md`
Status: `m9_05_bot_redline_fuse_canary_passed_not_ga0`
Recorded: 2026-07-09

## Result

M9-05 adds a deterministic local Bot redline/fuse canary drill. The drill uses existing M8 Bot runtime harness code to execute the same worker decision boundary without real Telegram, DB, customer traffic or provider credentials.

The canary result is:

| Fact | Result |
|---|---|
| reason code | `redline_output_suppressed` |
| runtime branch | `handoff` |
| outbound attempts | `0` |
| persisted outbound messages | `0` |
| handoff ticket reason matched | `true` |
| command | `node packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs` |

This closes the M9-03 gap that the M8 supervisor alone could not prove: redline/fuse suppression, zero outbound for a canary and a reason code.

## Boundary

This evidence is local and deterministic. It combines with earlier M8 internal Bot runtime evidence, but it is not a full live redline DB drill and not a live Telegram drill.

It does not approve:

- GA-0 opening.
- 1.0 release.
- G-04 Uzbek quality review.
- G-06 >=200 eval quota.
- Production traffic.
- Broad real customer traffic.
- Customer LLM or real provider routing.
- Telegram Business automatic reply.
- Formal knowledge write, distill auto-write or confirmation bypass.

## Source Inputs

| Input | Use |
|---|---|
| `docs/evidence/M8/M8-06-internal-live-bot-supervisor.md` | Prior live internal Bot supervisor evidence; did not prove redline/fuse suppression. |
| `docs/evidence/M8/M8-08-staging-runtime-closeout.md` | Prior internal staging Bot closeout boundary. |
| `scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs` | Existing local proof shape for unsafe answer decisions. |
| `scripts/tests/m8-bot-runtime-answer-loop-support.mjs` | Reused deterministic runtime harness. |
| `apps/worker/src/conversation-runtime.ts` | Worker branch that persists handoff and avoids send when answer runtime does not return answered. |

## Validation

Passed:

- `node --test scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs`
- `node packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs --help`
- `node packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs`
- `node node_modules/eslint/bin/eslint.js packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs`
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md package.json packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md --include-worktree`
- `git diff --check`

## Remaining Gate State

GA-0 still requires M9-04 employee admin read evidence and M9-06 owner signoff/open record. M9-05 does not open GA-0 by itself.
