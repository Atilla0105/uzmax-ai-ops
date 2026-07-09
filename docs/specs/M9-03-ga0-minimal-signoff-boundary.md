# M9-03 GA-0 Minimal Signoff Boundary

Spec ID: M9-03
Status: `ready_for_review`
Owner confirmation point: project owner explicitly selected a minimal GA-0 signoff path for Bot-only controlled internal/staging use and explicitly deferred G-04/G-06 for that minimal path only. This is an owner-approved deferral/exception, not a pass, and it does not approve 1.0, production, Business automatic reply, formal knowledge write, broad real customer traffic or customer LLM.
Timebox: one small source-of-truth boundary alignment slice.

## Spec 类型

cleanup

## Goal

Record the current minimal GA-0 boundary without opening GA-0:

1. Create the M9-03 source-of-truth spec for the minimal Bot-only internal/staging signoff path.
2. Create GA-0 evidence that records G-04/G-06 as owner-deferred for this minimal path only, not passed.
3. Keep `docs/release.md` explicit that GA-0 remains locked and 1.0 remains blocked.
4. Keep the admin release console action disabled while reflecting the selected minimal path.
5. Add a focused test that prevents future wording from converting the deferral into a pass or enabling GA-0.
6. Correct the stale M9-02 evidence line from pending PR/CI/merge to PR #283 merged with CI success.

## Owner Confirmation Point

- Owner selected minimal GA-0 scope: Bot-only controlled internal/staging signoff.
- Owner approved deferring G-04 and G-06 for this minimal GA-0 path only.
- Owner did not approve G-04 or G-06 as passed.
- Owner did not approve 1.0, production, Business automatic reply, formal knowledge write, broad real customer traffic or customer LLM.
- Owner still must explicitly open GA-0 in M9-06 after M9-04 and M9-05 evidence exists.

## AI Agent Responsibilities

- Read `AGENTS.md`, the v1.1 technical architecture, the v1.1 acceptance matrix, current release docs, M6/M6B/M8/M9 evidence and the admin release gate contract before edits.
- Record the selected minimal path in docs/evidence without changing runtime behavior.
- Preserve the release gate boundary: `ga0Action.disabled` remains `true`.
- Use exact deferral language for G-04/G-06 and avoid pass/green/approved wording.
- Add focused file-reading validation.
- Do not inspect or print secret values.

## Preconditions

- Current branch is `codex/m9-03-ga0-minimal-boundary`.
- Current worktree is `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-03-ga0-minimal-boundary`.
- `docs/release.md` currently keeps GA-0 locked.
- `apps/admin/src/releaseGateContracts.ts` currently keeps `ga0Action.disabled: true`.
- M8-08 records internal staging Bot closeout evidence without approving production, broad customer traffic, customer LLM, Business automatic reply or 1.0.
- M9-02 records Vercel admin staging closeout and needs only stale PR/CI/merge wording correction.
- M9-04 is not closable from local environment alone: current local env does not provide Supabase employee email/password/access token evidence or `UZMAX_RLS_DATABASE_URL` evidence. M9-04 must use real employee session evidence through Vercel admin/Supabase, or explicitly record an owner-input blocker if that access is not provided.
- M9-05 cannot be honestly closed by the existing M8 supervisor alone. `run-m8-internal-live-bot-supervisor` proves inbound plus outbound sent or open ticket, but it does not prove redline/fuse suppression, zero outbound for a canary, or a reason code.

## Worktree And Branch Preconditions

| Check | Required result |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-03-ga0-minimal-boundary` |
| `git branch --show-current` | `codex/m9-03-ga0-minimal-boundary` |
| `git status --short --branch` | branch matches assigned branch; no unrelated work is modified by this spec |
| `git branch --no-merged main` | recorded before/after this slice |
| `gh pr list --state open --json number,title,headRefName,state,url` | recorded before/after this slice |

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M9-03-ga0-minimal-signoff-boundary.md`
  - `docs/evidence/GA-0/GA0-00-minimal-boundary.md`
  - `docs/release.md`
  - `apps/admin/src/releaseGateContracts.ts`
  - `scripts/tests/m6-release-gate-console.test.mjs`
  - `scripts/tests/m9-ga0-minimal-boundary.test.mjs`
  - `docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md`

Read-only anchors:

- `AGENTS.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/evidence/M6/M6-09-final-acceptance-rollup.md`
- `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md`
- `docs/evidence/M8/M8-08-staging-runtime-closeout.md`
- `docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md`
- `apps/admin/src/releaseGateContracts.ts`

## Path Classification And Budget

| Classification | Paths | Budget |
|---|---|---|
| docs | M9-03 spec, GA0-00 evidence, `docs/release.md`, M9-02 evidence wording | changed docs files <= 4 |
| source | `apps/admin/src/releaseGateContracts.ts` | changed source files <= 1, new source files = 0, net source LOC <= 40 |
| test | `scripts/tests/m6-release-gate-console.test.mjs`, `scripts/tests/m9-ga0-minimal-boundary.test.mjs` | changed test files <= 2, new test files <= 1 |
| generated | none | none |
| lock | none | no lockfile changes |
| config | none | no config changes |

No `large_change_exception`, external dependency exception or `test_weakening_exception` is requested.

## Docs Trigger Check

This slice changes release boundary docs and admin release gate contract language, so docs/evidence updates are required. It does not change runtime behavior, API contracts, DB schema, migrations, prompt/model routing, knowledge publishing, UI page bodies, package manager files or environment files.

## Implementation Steps

1. Create this M9-03 spec with owner deferral and minimal-scope boundaries.
2. Create `docs/evidence/GA-0/GA0-00-minimal-boundary.md` with status token `ga0_minimal_bot_only_boundary_recorded_ai_quality_deferred_not_open`.
3. Add an M9-03 boundary note to `docs/release.md`.
4. Update `apps/admin/src/releaseGateContracts.ts` summary and GA-0 row while keeping `ga0Action.disabled: true`.
5. Replace stale M9-02 evidence wording with PR #283 merged/main CI success truth.
6. Add `scripts/tests/m9-ga0-minimal-boundary.test.mjs`.
7. Record that M9-05 needs a tiny follow-up drill script/test unless an existing runtime-evidence path proves redline/fuse suppression, zero outbound for a canary and a reason code.
8. Run focused validation and do not commit unless all required checks pass.

## Pass Conditions

- M9-03 spec exists and includes the required AGENTS/spec fields.
- GA0-00 evidence exists and includes `ga0_minimal_bot_only_boundary_recorded_ai_quality_deferred_not_open`.
- G-04/G-06 are recorded as owner-deferred for minimal GA-0 only, not passed.
- M9-04, M9-05 and M9-06 are required before GA-0 can be marked opened.
- M9-04 explicitly requires real employee session evidence through Vercel admin/Supabase or an owner-input blocker record.
- M9-05 explicitly requires a follow-up drill script/test unless current runtime evidence can prove redline/fuse suppression, zero outbound for a canary and a reason code.
- `docs/release.md` says GA-0 remains locked, minimal Bot-only path selected, G-04/G-06 deferred not passed and M9-04/M9-05/M9-06 required.
- `apps/admin/src/releaseGateContracts.ts` keeps `disabled: true` and does not imply 1.0 approval.
- M9-02 stale wording no longer says pending PR/CI/merge and records PR #283 merged with CI success.
- Focused validation commands pass.

## Failure Branches

- If the branch or worktree does not match the assigned M9-03 path, stop and report blocked.
- If G-04/G-06 wording cannot be made unambiguous as deferred-not-passed, stop and report blocked.
- If a validation command fails, fix within the allowed scope or report blocked with exact output.
- If unrelated modified files are present, do not revert them; report and avoid touching them.
- If any edit would require runtime/API/DB/env/lockfile changes, stop and request a new spec.
- If M9-04 lacks real employee credentials/session/token evidence, record owner-input blocker instead of claiming employee admin read closure.
- If M9-05 lacks a path that proves redline/fuse suppression, zero outbound for a canary and a reason code, add the tiny follow-up drill script/test in M9-05 instead of reusing M8 evidence as closure.

## Not Doing

- No GA-0 opening action.
- No 1.0 approval.
- No production deployment or production traffic approval.
- No broad real customer traffic approval.
- No real customer/order data expansion.
- No customer LLM/provider approval.
- No Telegram Business automatic reply or Business expansion.
- No formal knowledge write or confirmation bypass.
- No API, worker, DB schema, migration, UI page body, package-lock or env-file change.
- No secret value inspection or printing.

## Acceptance Mapping

| Acceptance item | M9-03 posture |
|---|---|
| G-04 | owner-deferred for minimal Bot-only GA-0 path only; not passed; still blocks 1.0/full release |
| G-06 | owner-deferred for minimal Bot-only GA-0 path only; not passed; still blocks 1.0/full release |
| L-01 | GA-0 remains locked until M9-04, M9-05 and M9-06 complete and owner explicitly opens it |
| L-02 | M9-05 Bot redline/fuse leave-ticket drill remains required before GA-0 can open; current M8 supervisor is insufficient by itself |
| C-01/C-02 Bot path | minimal internal/staging Bot-only path selected; no broad real traffic approval |
| C-03/C-04/C-05 Business path | not approved; Business automatic reply remains out of scope |
| H-02/H-03/H-07 formal knowledge/distill | no formal knowledge write or confirmation bypass approved |
| J-05 release gate evidence | source-of-truth boundary is recorded for owner review |
| 1.0 release | remains blocked; G-04/G-06 deferral does not count as acceptance-matrix pass |

## Future M9-04 / M9-05 Closure Notes

M9-04 must not be closed from local env alone. It requires real employee admin read evidence through Vercel admin/Supabase, or an explicit owner-input blocker if no Supabase employee email/password/access token/session is provided.

M9-05 must not reuse the M8 supervisor as sufficient closure by itself. The follow-up evidence must prove redline/fuse suppression, zero outbound for a canary and a reason code. If no existing runtime-evidence path can prove those exact facts, the minimal M9-05 touch list should be:

- `docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md`
- `docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md`
- `packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs`
- `scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs`
- `package.json`

## Validation

Required focused validation:

- `node --test scripts/tests/m6-release-gate-console.test.mjs scripts/tests/m9-ga0-minimal-boundary.test.mjs`
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M9-03-ga0-minimal-signoff-boundary.md docs/evidence/GA-0/GA0-00-minimal-boundary.md docs/release.md apps/admin/src/releaseGateContracts.ts scripts/tests/m6-release-gate-console.test.mjs scripts/tests/m9-ga0-minimal-boundary.test.mjs docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md`
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/eslint/bin/eslint.js apps/admin/src/releaseGateContracts.ts scripts/tests/m6-release-gate-console.test.mjs scripts/tests/m9-ga0-minimal-boundary.test.mjs`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-03-ga0-minimal-signoff-boundary.md --include-worktree`
- `git diff --check`
