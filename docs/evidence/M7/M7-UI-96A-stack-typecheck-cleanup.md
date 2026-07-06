# M7-UI-96A Stack CI Cleanup Evidence

## Status

`cleanup_candidate_pending_pr_review_stack_ci_unblock_only`

This branch fixes the inherited stack CI blockers on top of `codex/m7-ui-95-group-logs-default-visual-parity-refresh`: the existing #239 test-only TypeScript fixes in two focused Playwright specs plus the full-repo Prettier blocker in `apps/admin/src/pages/knowledge/knowledgeFallback.ts`. It does not add visible UI, does not change knowledge runtime semantics/data/visible copy, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
- PR: <https://github.com/Atilla0105/uzmax-ai-ops/pull/239>
- Base: `codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- Base head: `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- Branch/worktree: `codex/m7-ui-96a-stack-typecheck-cleanup` / `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- Current head before stack-format work: `ae7181b40d17b77010e8c21f5fdf739beedb734f`
- Cleanup targets:
  - `apps/admin/src/pages/knowledge/knowledgeFallback.ts` format-only
  - `apps/admin/tests/m7-ui-group-logs.spec.ts` existing #239 typecheck fix
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts` existing #239 typecheck fix

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`
- `git status --short --branch`: `## codex/m7-ui-96a-stack-typecheck-cleanup...origin/codex/m7-ui-96a-stack-typecheck-cleanup`
- `git branch --show-current`: `codex/m7-ui-96a-stack-typecheck-cleanup`
- `git rev-parse HEAD` before this worker's edits: `ae7181b40d17b77010e8c21f5fdf739beedb734f`
- `git rev-parse codex/m7-ui-95-group-logs-default-visual-parity-refresh`: `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

Temporary dependency link:

- `node_modules -> /Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules`

Environment note:

- The default shell did not have bare `node` on PATH. The first literal command attempt stopped at `zsh:1: command not found: node`.
- Subsequent reproduction and validation used the existing Codex runtime Node path by prefixing PATH with `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin`, while keeping the requested repo-local command entrypoints.

## Source Review

- Read `AGENTS.md`.
- Read this cleanup spec and current evidence:
  - `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/README.md`
- Reviewed current cleanup targets:
  - `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- Reviewed the M7-UI-95 / M7-UI-66 / knowledge-resource boundaries only as needed for no-runtime/no-visible-copy claims.

## Reproduction

Full-repo Prettier check before the format-only edit:

```text
Checking formatting...
[warn] apps/admin/src/pages/knowledge/knowledgeFallback.ts
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
```

The two inherited typecheck blockers were already fixed in the existing #239 head before this worker started; this worker kept those test files in scope for verification and did not make non-required test changes.

## Cleanup Changes

- `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
  - Applied Prettier-compatible formatting only.
  - The observed diff only expands the `KnowledgeTab` and `KnowledgeViewState` union type formatting.
  - Knowledge fallback data, runtime branch behavior and visible copy are unchanged.
- `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - Existing #239 fix keeps `degraded` covered through runtime-boundary assertions.
  - Existing #239 fix keeps non-degraded visible copy assertions type-safe.
- `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - Existing #239 fix restores `RawOrdersMetrics` as an inferred alias from the raw `page.evaluate` return helper.
  - Existing metric derivation and assertions remain unchanged.
- `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`, `docs/evidence/M7/M7-UI-96A-stack-typecheck-cleanup.md` and `docs/evidence/M7/README.md`
  - Updated #239 from stack typecheck cleanup to stack CI cleanup: format + typecheck.
  - Kept the filename and #96A entry; no #96B evidence entry was added.

No assertions were removed, no `.skip` / `.only` / `xit` / `xfail` was added, and no mocks were broadened.

## Validation

Validation status: `PASS`.

Completed validation:

- PASS: worktree whitespace check:
  - `git diff --check`
- PASS: scope guard:
  - `node scripts/guards/pr-shape.mjs --base codex/m7-ui-95-group-logs-default-visual-parity-refresh --spec docs/specs/M7-UI-96A-stack-typecheck-cleanup.md --include-worktree`

```json
{
  "base": "codex/m7-ui-95-group-logs-default-visual-parity-refresh",
  "specPath": "docs/specs/M7-UI-96A-stack-typecheck-cleanup.md",
  "specType": "cleanup",
  "bootstrapException": false,
  "changedFiles": 6,
  "categories": {
    "test": 2,
    "docs": 3,
    "source": 1
  },
  "source": {
    "changedFiles": 1,
    "netLoc": 10,
    "newFiles": 0
  }
}
```

- PASS: full-repo Prettier:
  - `node node_modules/prettier/bin/prettier.cjs --check .`
  - Output: `All matched files use Prettier code style!`
- PASS: touched ESLint:
  - `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/knowledge/knowledgeFallback.ts apps/admin/tests/m7-ui-group-logs.spec.ts apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- PASS: full-repo typecheck:
  - `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- PASS: admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning only: Vite reported one chunk larger than 500 kB after minification.
- PASS: focused Playwright with manual preview on `127.0.0.1:4173`:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
  - Result: `9 passed (2.2s)`.

## Cleanup Status

Completed before final status:

- removed temporary `node_modules` symlink
- removed `apps/admin/dist`
- removed `test-results`
- removed `playwright-report`

## Remaining Non-Claims

- This is a stack CI unblock cleanup only.
- It does not create a #96B PR or evidence entry.
- It does not claim #238/#96 merge closure.
- It does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.
