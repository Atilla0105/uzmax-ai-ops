# M9-05 Bot Redline Fuse Leave-Ticket Drill

Spec ID: M9-05
Status: `ready_for_review`
Owner confirmation point: project owner selected the minimal Bot-only GA-0 path in M9-03 and deferred G-04/G-06 for that path only. M9-05 proves only the Bot redline/fuse canary semantics required before M9-06; it is not a GA-0 open action, not an AI quality pass and not 1.0 acceptance.
Timebox: one narrow local deterministic drill slice.

## Spec 类型

cleanup

## Goal

Close the M9-03 semantic gap for the Bot redline/fuse leave-ticket path:

1. Add a deterministic local drill command for a redline canary.
2. Prove redline suppression produces `redline_output_suppressed`.
3. Prove the runtime does not attempt outbound delivery for the canary.
4. Prove the update leaves a handoff/ticket reason for operator review.
5. Record evidence without expanding to live Telegram, real customer traffic, real LLM/provider calls, G-04/G-06 or 1.0.

## AI Agent Responsibilities

- Read `AGENTS.md`, M9-03 boundary evidence, M8 live Bot evidence and current Bot runtime tests before editing.
- Keep the drill local and deterministic by default.
- Avoid DB, network, token, real customer text and real provider usage.
- Reuse existing runtime harness where it keeps the proof narrow.
- Do not edit release summary files that overlap with M9-04; M9-06 will aggregate release state.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md`
  - `docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md`
  - `packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs`
  - `scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs`
  - `package.json`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M9-03-ga0-minimal-signoff-boundary.md`
- `docs/evidence/GA-0/GA0-00-minimal-boundary.md`
- `docs/evidence/M8/M8-08-staging-runtime-closeout.md`
- `docs/evidence/M8/M8-06-internal-live-bot-supervisor.md`
- `apps/worker/src/conversation-runtime.ts`
- `apps/worker/src/telegram-bot-answer-runtime.ts`
- `scripts/tests/m8-bot-runtime-answer-loop-v0.test.mjs`
- `scripts/tests/m8-bot-runtime-answer-loop-support.mjs`

## Path Classification And Budget

| Classification | Paths | Budget |
|---|---|---|
| docs | M9-05 spec and evidence | changed docs files <= 2 |
| source | `packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs` | changed source files <= 1, new source files <= 1, net source LOC <= 150 |
| test | `scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs` | new test files <= 1 |
| config | `package.json` script entry | changed config files <= 1 |
| generated | none | none |
| lock | none | no lockfile changes |

No `large_change_exception`, external dependency exception or `test_weakening_exception` is requested.

## Implementation Steps

1. Add `smoke:m9-bot-redline-fuse-leave-ticket` to `package.json`.
2. Add `packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs`.
3. Reuse the existing M8 Bot runtime harness to run a local redline canary.
4. Assert `runtimeBranch === "handoff"`, outbound attempt count is zero and ticket summary includes `redline_output_suppressed`.
5. Add focused Node tests for the command and evidence boundaries.
6. Record evidence in `docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md`.

## Pass Conditions

- The package script exists and points at the M9-05 drill command.
- The drill command prints help that names the local-only boundary.
- The drill command exits 0 and prints JSON with:
  - `status: "pass"`
  - `reasonCode: "redline_output_suppressed"`
  - `runtimeBranch: "handoff"`
  - `outboundAttemptCount: 0`
  - `ticketReasonMatched: true`
- Evidence records status `m9_05_bot_redline_fuse_canary_passed_not_ga0`.
- Evidence states this proof combines with prior M8 live internal Bot evidence but does not itself prove a live redline DB drill.
- Evidence does not claim GA-0 open, G-04/G-06 passed, production, customer LLM, real customer traffic, Telegram Business automatic reply or 1.0 approval.

## Failure Branches

- If the drill attempts outbound delivery, fail the command.
- If the reason code is not `redline_output_suppressed`, fail the command.
- If the drill needs real env, DB, network, Telegram token or provider credentials, stop and split a new spec.
- If validation fails, fix within this file list or report blocked.
- If this slice needs release summary aggregation, leave it for M9-06 to avoid conflicting with M9-04.

## Not Doing

- No GA-0 opening action.
- No M9-06 owner signoff.
- No G-04 Uzbek quality review.
- No G-06 >=200 eval quota.
- No production traffic or customer data.
- No real Telegram network call.
- No real LLM/provider call.
- No DB schema, migration, RLS or live DB readback change.
- No formal knowledge write, distill auto-write or confirmation bypass.
- No `docs/release.md` update in this parallel slice.

## Acceptance Mapping

| Acceptance item | M9-05 posture |
|---|---|
| L-02 | Supports minimal GA-0 by proving redline/fuse canary suppresses outbound and leaves operator reason. |
| G-04/G-06 | Deferred by owner for minimal GA-0 only in M9-03; not passed here. |
| C-01/C-02 Bot path | Adds local safety canary proof on top of existing M8 internal Bot evidence. |
| GA-0 | Still requires M9-04 and M9-06; not opened by this slice. |
| 1.0 | Remains blocked. |

## Validation

Required focused validation:

- `node --test scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs`
- `node packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs --help`
- `node packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs`
- `node node_modules/eslint/bin/eslint.js packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs`
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md package.json packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md --include-worktree`
- `git diff --check`
