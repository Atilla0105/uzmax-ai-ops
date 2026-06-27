# M6B-17 GA-0 External Blocker Rollup

> spec_id: M6B-17
> type: evidence-rollup
> status: ready_for_review
> owner: project owner owns GA-0 opening, production release, real customer/order data, customer LLM, provider/cost/risk and 1.0 decisions; AI agents own evidence honesty and docs synchronization
> created_at: 2026-06-27
> touch_modules: `docs/specs/M6B-17-ga0-external-blocker-rollup.md`, `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md`, `docs/evidence/M6B/README.md`, `docs/release.md`
> sensitive_data: none; no secret values, raw customer data, Bot tokens, webhook secrets or DB URLs may be written

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-17-ga0-external-blocker-rollup.md`
  - `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md`
  - `docs/evidence/M6B/README.md`
  - `docs/release.md`
- 说明/备注：
  - Evidence rollup only.
  - No source, test, DB schema, migration, generated client, package lock, public API, platform mutation or production release change.

## Goal

Synchronize repo release evidence after the live external-input blockers were cleared in Linear and platform evidence:

- LAY-30 live `/readyz` identity/authz activation is Done.
- LAY-19 staging API/worker/cron/Redis plus alert fire proof is Done.
- LAY-23 API/worker/cron/admin deploy rollback drill is Done.
- LAY-24 safe backup/restore drill is Done.

The output must separate two decisions:

- whether external input blockers are cleared;
- whether GA-0 is open.

## Non-Goals

- No GA-0 opening.
- No production deploy, production promotion, customer/order data, customer LLM, real provider calls, outbound customer traffic or 1.0 release approval.
- No new runtime behavior, public API, DTO, DB schema, migration, RLS policy or admin UI change.
- No secret value written to git or evidence.

## Implementation

1. Add M6B-17 evidence summarizing the live closure references and residual boundary.
2. Update the M6B index so M6B-04, M6B-07, M6B-08, M6B-12a and M6B-12b no longer claim unresolved live blockers.
3. Update `docs/release.md` so it records that external-input blockers are closed while GA-0 remains locked pending owner release decision and remaining non-external release conditions.

## Acceptance

- M6B README has a current M6B-17 row and no longer says LAY-19, LAY-23, LAY-24 or LAY-30 are open.
- Release boundary says external-input blockers are closed but GA-0 is still not approved.
- The change is docs-only and contains no secrets.

## Failure Branch

If any Linear closure tracker or platform resource cannot be verified as Done/Live, keep the relevant blocker open in docs and do not claim external-input clearance.
