# M6B-12b Render Prisma Generate Evidence

> evidence_id: M6B-12b-render-prisma-generate
> spec_id: M6B-12b
> status: config_fix_ready_for_review_live_render_redeploy_pending_not_ga0
> created_at: 2026-06-27
> source_files: `AGENTS.md`, `docs/specs/M6B-12b-render-prisma-generate.md`, `render.yaml`, `docs/evidence/M6B/README.md`, `docs/release.md`
> sensitive_data_location: none
> redaction_status: no secret values, DB URLs, Bot tokens, webhook secrets, raw customer/order/message data or provider keys

## Trigger

During M6B-12 live `/readyz` activation, Render API deploy `dep-d8voptlaeets73daij5g` for commit `19e7ce3` failed after a successful build.

Observed startup failure:

```text
Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
```

This is a real deploy/runtime blocker, not a readiness smoke failure.

## Change

`render.yaml` now runs Prisma generation before building each Node service:

```text
npm ci --include=dev && npm run -w @uzmax/db prisma:generate && npm run build:api
npm ci --include=dev && npm run -w @uzmax/db prisma:generate && npm run build:worker
npm ci --include=dev && npm run -w @uzmax/db prisma:generate && npm run build:cron
```

Worker and cron are included because later live RLS/Prisma runtime modes need the same generated client boundary.

## Validation

| Check | Result |
|---|---|
| Root/main preflight | clean; no unmerged local branch after removing the already-merged M6B-12a worktree branch |
| Assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-12b-render-prisma-generate` |
| Assigned branch | `codex/m6b-12b-render-prisma-generate` |
| Live failure captured | Render deploy `dep-d8voptlaeets73daij5g`, commit `19e7ce3`, startup exited with ungenerated Prisma client |
| `git diff --check` | pass |
| `render.yaml` static command check | pass; 3 Render Node service build commands include `npm run -w @uzmax/db prisma:generate` |
| Sensitive-value scan on changed files | pass; no DB URL, publishable key, Bot token, webhook secret value or generated staging password is recorded |
| Secret boundary | No secret value is recorded in this file |

Full local `npm ci`/`npm run build:*` was not run in this worktree because the local bundled shell does not expose `npm`, and workspace isolation prevents borrowing root `node_modules`. The next hard verifier is GitHub CI plus the actual Render redeploy.

## Boundary

This slice does not close LAY-30 or LAY-19. It only removes the immediate Render build/start blocker that appeared while trying to activate staging `/readyz`.

Live acceptance still requires:

- Render staging API redeploy succeeds;
- `/healthz` returns 200;
- `/readyz` returns 200;
- synthetic authz smoke passes under RLS;
- missing-secret webhook remains 401.
