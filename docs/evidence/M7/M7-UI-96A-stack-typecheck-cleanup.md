# M7-UI-96A Stack Typecheck Cleanup Evidence

## Status

`cleanup_candidate_pending_pr_review_typecheck_unblock_only`

This branch fixes two inherited Playwright test type errors on top of `codex/m7-ui-95-group-logs-default-visual-parity-refresh` so the #238/#96 visible UI stack can run full-repo typecheck again. It does not add visible UI, does not touch page source, does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- Base: `codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- Base head: `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- Branch/worktree: `codex/m7-ui-96a-stack-typecheck-cleanup` / `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- Test targets:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- `git status --short --branch`: `## codex/m7-ui-96a-stack-typecheck-cleanup`
- `git branch --show-current`: `codex/m7-ui-96a-stack-typecheck-cleanup`
- `git rev-parse codex/m7-ui-95-group-logs-default-visual-parity-refresh`: `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- `git rev-parse HEAD` before edits: `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.
- `gh pr list --state open --limit 50` could not run because this shell has no `gh` binary; PR creation will use the available GitHub connector/API path if needed.

## Source Review

- Read `AGENTS.md`.
- Read the relevant M7 stack specs/evidence:
  - `docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-95-group-logs-default-visual-parity-refresh.md`
  - `docs/specs/M7-UI-66-orders-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
- Reviewed current test blockers:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- Reviewed v1.1/product/admin/design-system boundaries for orders, logs/audit and release non-claims.

## Reproduction

Validation environment note: the default shell did not have bare `node` on PATH. The first literal command attempt after creating the temporary symlink stopped at `zsh:1: command not found: node`. Subsequent reproduction used the existing Codex runtime Node path while keeping the requested TypeScript command shape.

Temporary dependency link:

- `node_modules -> /Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules`

Reproduced blockers:

```text
apps/admin/tests/m7-ui-group-logs.spec.ts(150,66): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string | RegExp | readonly (string | RegExp)[]'.
  Type 'undefined' is not assignable to type 'string | RegExp | readonly (string | RegExp)[]'.
apps/admin/tests/m7-ui-orders-source-parity.spec.ts(301,34): error TS2304: Cannot find name 'RawOrdersMetrics'.
```

## Cleanup Changes

- `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - Added a literal `forcedStates` tuple plus `ForcedState` / `CopyState` narrowing.
  - Kept `degraded` covered through runtime-boundary assertions.
  - Kept non-degraded visible copy assertions intact while making `stateCopy[state]` type-safe.
- `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - Restored `RawOrdersMetrics` as an inferred alias from the raw `page.evaluate` return helper.
  - Kept all existing metric derivation and assertions unchanged.

No assertions were removed, no `.skip` / `.only` / `xit` / `xfail` was added, and no mocks were broadened.

## Validation

Validation status: `PASS`.

Completed validation:

- PASS: `git diff --check`
- PASS: `node scripts/guards/pr-shape.mjs --base codex/m7-ui-95-group-logs-default-visual-parity-refresh --spec docs/specs/M7-UI-96A-stack-typecheck-cleanup.md --include-worktree`

```json
{
  "base": "codex/m7-ui-95-group-logs-default-visual-parity-refresh",
  "specPath": "docs/specs/M7-UI-96A-stack-typecheck-cleanup.md",
  "specType": "cleanup",
  "bootstrapException": false,
  "changedFiles": 5,
  "categories": {
    "test": 2,
    "docs": 3
  },
  "source": {
    "changedFiles": 0,
    "netLoc": 0,
    "newFiles": 0
  }
}
```

- PASS: touched Prettier:
  - `node node_modules/prettier/bin/prettier.cjs --check apps/admin/tests/m7-ui-group-logs.spec.ts apps/admin/tests/m7-ui-orders-source-parity.spec.ts docs/specs/M7-UI-96A-stack-typecheck-cleanup.md docs/evidence/M7/M7-UI-96A-stack-typecheck-cleanup.md docs/evidence/M7/README.md`
- PASS: touched ESLint:
  - `node node_modules/eslint/bin/eslint.js apps/admin/tests/m7-ui-group-logs.spec.ts apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- PASS: full-repo typecheck:
  - `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- PASS: admin build for manual preview:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning only: Vite reported one chunk larger than 500 kB after minification.
- PASS: focused Playwright with manual preview on `127.0.0.1:4173`:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - Result: `6 passed`.

## Cleanup Status

Completed before final status:

- removed temporary `node_modules` symlink
- removed `apps/admin/dist`
- removed `test-results`
- removed `playwright-report`

## Remaining Non-Claims

- This is a stack typecheck unblock cleanup only.
- It does not claim #238/#96 merge closure.
- It does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.
