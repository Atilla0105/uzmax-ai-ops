# M6B-12b Render Prisma Generate

> spec_id: M6B-12b
> type: runtime-config
> status: ready_for_review
> owner: project owner owns staging platform operation, cost, GA-0 and release decisions; AI agents own narrow config fix, validation and evidence honesty
> created_at: 2026-06-27
> touch_modules: `render.yaml`, `docs/specs/M6B-12b-render-prisma-generate.md`, `docs/evidence/M6B/M6B-12b-render-prisma-generate.md`, `docs/evidence/M6B/README.md`, `docs/release.md`
> sensitive_data: none; no secret values, raw customer data, Bot tokens, webhook secrets or DB URLs may be written

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `render.yaml`
  - `docs/specs/M6B-12b-render-prisma-generate.md`
  - `docs/evidence/M6B/M6B-12b-render-prisma-generate.md`
  - `docs/evidence/M6B/README.md`
  - `docs/release.md`
- 说明/备注：
  - Narrow Render staging build-command fix for API, worker and cron service definitions.
  - No source, test, DB schema, migration, generated client, package lock, public API, production release or customer-data path change.

## Goal

Unblock the failed Render API staging deploy observed during M6B-12 live `/readyz` activation.

Render deploy `dep-d8voptlaeets73daij5g` built commit `19e7ce3` successfully but exited on startup because `@prisma/client` had not been generated. This slice only wires Prisma client generation into Render build commands for the API, worker and cron service definitions.

## Non-Goals

- No public API, DTO, DB schema, migration, RLS policy or generated client commit.
- No production deploy, customer/order data, outbound Bot send or GA-0 opening.
- No claim that `/readyz`, worker, cron, alert, rollback or restore are closed.
- No secret value written to git or logs.

## Implementation

1. Update `render.yaml` build commands for API, worker and cron to run:
   - `npm ci --include=dev`
   - `npm run -w @uzmax/db prisma:generate`
   - the existing app build command.
2. Keep start commands unchanged.
3. Record the Render failure and follow-up validation in M6B evidence.

## Acceptance

- `render.yaml` includes Prisma generation before each Node service build.
- The change is config-only plus docs/evidence.
- Local static validation confirms the expected build command strings.
- Live closure remains blocked until the actual Render service command is updated/redeployed and `/readyz` is rechecked.

## Failure Branch

If Render still fails after Prisma generation is wired, record the new failure log and split another narrow slice only if source/config changes are required.
