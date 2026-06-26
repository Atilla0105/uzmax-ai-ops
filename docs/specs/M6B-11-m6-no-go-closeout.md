# M6B-11 M6 No-Go Closeout Boundary Sync

Spec ID: M6B-11
Status: `m6b_11_m6_no_go_closeout_boundary_sync_ready_for_review`
Tracking: Linear LAY-25 follow-up comment; no new Linear mainline issue.
Owner decision input: project owner accepted M6 no-go closeout in the Codex thread by providing the closeout plan that says M6 should close as an evidence/runtime-hardening package while GA-0 remains no-go.
Timebox: 1 narrow PR

## Spec 类型

docs

## Goal

Close the M6/M6B execution loop as a no-go closeout package, without approving GA-0, 1.0, production, paid platform actions, restore execution, outbound Bot send, real customer/order data or any owner-only risk decision.

Required conclusion:

`M6 closed as evidence/runtime-hardening package; GA-0 remains no-go.`

## It Closes Which Old Linear Blocker?

It closes the project-level M6/M6B closeout loop recorded by Linear LAY-25 `M6B-09: GA-0 runtime evidence rollup and go/no-go package`.

It does not close LAY-19, LAY-23, LAY-24 or LAY-30:

- LAY-19 remains the mainline GA-0 Activation / Runtime Owner-Gated blocker for staging API/worker/cron/Redis readiness.
- LAY-30 remains only a LAY-19 child/follow-up blocker for live `/readyz` identity/authz activation.
- LAY-23 remains the mainline GA-0 Activation / Runtime Owner-Gated blocker for deploy/rollback drills.
- LAY-24 remains the mainline GA-0 Activation / Runtime Owner-Gated blocker for backup/restore drills.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-11-m6-no-go-closeout.md`
  - `docs/evidence/M6B/M6B-11-m6-no-go-closeout.md`
  - `docs/evidence/M6B/README.md`
  - `docs/evidence/M6/README.md`
  - `docs/release.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - Docs-only closeout sync. It records M6 no-go closeout, does not approve GA-0 or 1.0 and does not close LAY-19, LAY-23, LAY-24 or LAY-30.

No source, test, generated, lockfile, config, migration, schema, CI, runtime, secret or external platform paths are in scope.

## 变更预算与路径分类

- Source budget: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- Docs: 2 new docs files and 3 existing docs updates.
- Test/generated/lock/config/CI/migration/source changes: none.
- New source `rg` conclusion: none. This is a docs-only closeout sync.
- External API/SDK/provider/connector/adapter basis: none added in this PR.
- Exceptions: none.

## Current Evidence Inputs

- `docs/evidence/M6/M6-09-final-acceptance-rollup.md` records M6 final acceptance as no-go recommended and owner-decision-pending, not GA-0.
- `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md` records M6B runtime evidence as no-go because owner-gated runtime inputs are missing.
- `docs/evidence/M6B/M6B-09a-post-live-staging-evidence-sync.md` records durable staging API `/healthz` 200 and `/readyz` 503 with `authz=not_configured` and `identity=not_configured`.
- `docs/evidence/M6B/M6B-10-api-staging-identity-authz-readiness.md` records implementation-ready authz provider wiring but no live `/readyz` pass without owner-gated Supabase/Auth/RLS env and fact rows.
- `docs/release.md` already keeps GA-0 and 1.0 locked.
- Linear LAY-19, LAY-23 and LAY-24 are still owner-gated and must move forward as GA-0 Activation blockers rather than M6 execution blockers.

## Implementation Steps

1. Add this spec.
2. Add `docs/evidence/M6B/M6B-11-m6-no-go-closeout.md` with the closeout decision note.
3. Update `docs/evidence/M6/README.md` so M6 is no longer described as active/in-progress after the no-go closeout.
4. Update `docs/evidence/M6B/README.md` so M6B has an explicit M6B-11 closeout row and current status.
5. Update `docs/release.md` so the release boundary states that M6 closeout is not GA-0 opening, and remaining runtime blockers belong to GA-0 Activation / Runtime Owner-Gated.
6. Write Linear comments/status updates after PR creation/merge so LAY-19, LAY-23 and LAY-24 remain mainline blockers for the next phase and LAY-25 records the closeout PR.

## Pass Conditions

- Repo docs state exactly that M6 is closed as an evidence/runtime-hardening package while GA-0 remains no-go.
- Remaining LAY-19, LAY-23 and LAY-24 blockers are described as GA-0 Activation / Runtime Owner-Gated blockers, not M6 execution blockers.
- LAY-30 remains a LAY-19 child/follow-up blocker and is not upgraded to mainline.
- No wording says GA-0 passed, 1.0 is ready, production is approved, paid service creation is approved, restore is approved or owner risk decisions are fabricated.
- PR is docs-only and passes doc/shape/format guards.

## Out Of Scope

- No runtime/source/schema/test implementation.
- No worker/cron/admin service creation.
- No Render/Vercel paid upgrade or deploy/rollback action.
- No Telegram setWebhook call, token use, secret-valid live call or outbound Bot send.
- No restore command or database mutation.
- No production, real customer/order data, customer LLM, provider/cost/risk approval, GA-0 opening or 1.0 release.

## Failure Branches

| Failure | Required result |
|---|---|
| Closeout docs imply GA-0 or 1.0 approval | Reword before PR. |
| LAY-19, LAY-23 or LAY-24 appear closed by this PR | Reword before PR. |
| PR touches runtime/source/test/config paths | Split or abandon; this spec is docs-only. |
| New owner-gated decision is required | Record blocker in Linear; do not fabricate the decision. |

## Validation

Run from the assigned docs-only worktree:

```bash
git diff --check
node scripts/guards/doc-trigger-paths.mjs
node scripts/guards/eval-trigger-paths.mjs --base origin/main
node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-11-m6-no-go-closeout.md --include-worktree
node scripts/guards/forbidden-terms.mjs
prettier --check docs/specs/M6B-11-m6-no-go-closeout.md docs/evidence/M6B/M6B-11-m6-no-go-closeout.md docs/evidence/M6B/README.md docs/evidence/M6/README.md docs/release.md
```

## Closeout / Incident Record

No incident is expected. If any write-boundary, secret, production, paid-platform, restore or real-data issue occurs, stop and record an incident before continuing.
