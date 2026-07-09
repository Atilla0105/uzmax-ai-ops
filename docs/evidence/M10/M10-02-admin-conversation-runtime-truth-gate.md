# M10-02 Admin Conversation Runtime Truth Gate Evidence

Spec: `docs/specs/M10-02-admin-conversation-runtime-truth-gate.md`
Branch: `codex/m10-02-admin-conversation-runtime-truth-gate`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-02-admin-conversation-runtime-truth-gate`

## Preflight

| Check | Result |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-02-admin-conversation-runtime-truth-gate` |
| `git status --short --branch` | `## codex/m10-02-admin-conversation-runtime-truth-gate` |
| `git branch --show-current` | `codex/m10-02-admin-conversation-runtime-truth-gate` |
| worktree isolation | `git rev-parse --git-dir` returned `/Users/atilla/Applications/UZMAX智能运营/.git/worktrees/codex-m10-02-admin-conversation-runtime-truth-gate`; common dir is `/Users/atilla/Applications/UZMAX智能运营/.git` |
| root/main checkout edit boundary | Root checkout `/Users/atilla/Applications/UZMAX智能运营` is forbidden for edits; all commands and edits for this slice use the assigned worktree. |
| boundary correction | An initial relative patch created these two untracked docs files in the root checkout; both untracked files were removed immediately before any source/test edits, then recreated by absolute path in this worktree. |
| incident record | `docs/incidents/INC-2026-07-09-m10-02-root-preflight-docs.md` records the write-boundary incident required by `docs/incidents/README.md`. |

## Required Reading

| File | Result |
|---|---|
| `AGENTS.md` | Read before edits; confirms spec-first, allowed module scope, workspace isolation and no synthetic/runtime truth claims. |
| `docs/specs/M9-01-admin-staging-runtime-closeout.md` | Read before edits; confirms M9 staging fetcher/session wiring and no mock surface may be claimed as real runtime closeout. |
| `apps/admin/src/adminRuntimeConfig.ts` | Read before edits; identified first-tenant header fallback. |
| `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts` | Read before edits; identified module-level fetcher and fallback conditions. |
| `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts` | Read before edits; identified one client per hook rather than selected-tenant runtime client. |
| M7/M9 tests | Read/located `scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`, `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts`, and related conversation tests. |
| v1.1/docs anchors | Searched/read relevant PRD, architecture, backend design, acceptance matrix and `docs/admin-design-system.md` anchors for admin API-only runtime, tenant switching, degraded states and evidence-over-impression. |

## Implementation Evidence

| Area | Evidence |
|---|---|
| strict runtime config | `apps/admin/src/adminRuntimeConfig.ts` now exposes `strictRuntime`, set when `VITE_UZMAX_API_BASE_URL` is configured or `VITE_UZMAX_RUNTIME_STRICT=true`. |
| tenant-aware fetcher | `createAdminRuntimeFetcher(config, { selectedTenantId })` derives `x-tenant-id` from the selected tenant passed by the workbench. It no longer silently uses `config.tenants[0]` as the tenant header. |
| strict tenant fail-closed | In strict runtime, missing selected tenant, missing runtime tenant config, or selected tenant not present in configured tenants throws a clear error inside the fetch path so the workbench catch path can render an error/degraded state. |
| no module-level browser fetcher | `conversationWorkbenchClient.ts` no longer creates `browserFetcher` at module load. `createConversationClient` requires an injected fetcher. |
| current-tenant client | `conversationWorkbenchRuntime.ts` reads runtime config and memoizes a conversation client from `createAdminRuntimeFetcher(config, { selectedTenantId })`, so tenant switches rebuild the client. |
| fallback gate | `canUseSyntheticFallback(error, config)` returns false in strict runtime; local no-API preview can still use synthetic fallback for preview unavailable/network cases. |
| M9 assertion alignment | `scripts/tests/m9-admin-staging-runtime-closeout.test.mjs` now asserts the fetcher wiring in the runtime hook instead of the removed module-level fetcher. |
| M10 focused coverage | `scripts/tests/m10-admin-conversation-runtime-truth-gate.test.mjs` covers strict config derivation, selected tenant header source, strict fail-closed errors, module-level fetcher removal, strict no-synthetic fallback and current-tenant client creation. It also transpiles the runtime modules and executes `createAdminRuntimeFetcher` plus `canUseSyntheticFallback` with mocked browser globals. |
| incident closure | `docs/incidents/INC-2026-07-09-m10-02-root-preflight-docs.md` records the root/main transient preflight docs write, cleanup, verification and remaining controls. |

## Validation Results

| Command | Result |
|---|---|
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m10-admin-conversation-runtime-truth-gate.test.mjs scripts/tests/m9-admin-staging-runtime-closeout.test.mjs` | Pass: 14 tests, 0 failures. |
| `node node_modules/eslint/bin/eslint.js eslint.config.mjs apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts scripts/tests/m10-admin-conversation-runtime-truth-gate.test.mjs` | Pass after import cleanup; `conversationWorkbenchRuntime.ts` remains under the `max-lines` guard. |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M10-02-admin-conversation-runtime-truth-gate.md --include-worktree` | Pass. Reported 8 changed files after incident record: docs 3, source 3, test 2; source changed files 3, net source LOC 42, new source files 0. |
| `git diff --check main...HEAD` | Pass after incident record. |
| `PATH="..." node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` | Blocked: this isolated worktree has no local `node_modules/typescript/lib/tsc.js`. A second attempt using root checkout TypeScript and `@types` also failed before useful M10-02 signal because TypeScript module resolution in the isolated worktree could not resolve existing repo dependencies such as `lucide-react`, `@playwright/test`, Nest, Prisma, CSS module declarations and Vite `ImportMetaEnv`. No install/package/lock changes were allowed for this slice. |
| focused Playwright/M7 fallback | Not run: dependency-blocked because this isolated worktree has no `node_modules/@playwright/test`. No install/package/lock changes were allowed for this slice. |

## Commit Evidence

| Commit | Evidence |
|---|---|
| `b262504` | Spec/evidence preflight committed before source/test edits. |
| second implementation/test/evidence commit | Runtime, tests, incident record and validation evidence committed after the preflight commit. Final commit hash is reported by `git log`/final response. |
