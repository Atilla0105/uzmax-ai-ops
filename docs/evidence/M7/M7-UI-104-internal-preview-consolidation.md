# M7-UI-104 Internal Preview Consolidation Evidence

## PR Metadata

- Spec ID: M7-UI-104-internal-preview-consolidation
- Spec file: docs/specs/M7-UI-104-internal-preview-consolidation.md
- Documentation triggers: updated

## PR Hygiene

| Field                              | Value                                                                                                                                                                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Touched modules/files              | apps/admin/src/App.tsx; apps/admin/src/shell/**; apps/admin/src/pages/**; apps/admin/tests/**; docs/specs/M7-UI-*.md; docs/evidence/M7/M7-UI-*.md; docs/evidence/M7/README.md; docs/admin-ui-page-migration-ledger.md; docs/incidents/** |
| Path categories                    | source / test / docs                                                                                                                                                                                                                     |
| Source files changed               | large consolidation; see guard report                                                                                                                                                                                                     |
| Net source LOC                     | large consolidation; see guard report                                                                                                                                                                                                     |
| New source files                   | large consolidation; see guard report                                                                                                                                                                                                     |
| Test changes                       | M7 admin Playwright coverage surface consolidated; no intentional weakening                                                                                                                                                               |
| Test weakening source map          | none                                                                                                                                                                                                                                     |
| Generated/lock/config/docs changes | docs/specs and docs/evidence only; no generated/lock/config changes intended                                                                                                                                                              |
| Gross churn                        | large consolidation; see git diff stats                                                                                                                                                                                                   |
| External API evidence              | none                                                                                                                                                                                                                                     |
| Exception                          | large_change_exception                                                                                                                                                                                                                    |

## Status

Prepared as a closeout/consolidation record for the stacked M7 visible UI work on `codex/m7-ui-31-orders-visible-ui`.

This evidence is intentionally about integration hygiene and preview readiness. It does not claim runtime/API/DB closure, staff pilot launch, owner final visual acceptance, GA, production or 1.0 release approval.

## Initial Facts

| Fact | Evidence |
| --- | --- |
| Root checkout | `/Users/atilla/Applications/UZMAX智能运营` on `main` at `c39ba3be6bbb993300338ae557ff458b4078b7aa` |
| Consolidation branch | `codex/m7-ui-31-orders-visible-ui` |
| Consolidation branch head | `819c154315f51a851b107eca626821006184ae5a` before this evidence/spec commit |
| Preview URL already running | `http://127.0.0.1:4173/` from `/Users/atilla/.codex/worktrees/m7-ui-31-orders-visible-ui` |
| Existing PR issue | PR #198 was still titled/scoped as `M7-UI-31-orders-page`, but the branch had absorbed later M7 UI work through PR #272 |

## Branch Absorption

The consolidation branch includes the later visible UI and parity commits such as:

- M7-UI-40 eval center
- M7-UI-41 AI members
- M7-UI-42 model/cost/risk
- M7-UI-50 template center
- M7-UI-51 connection center
- M7-UI-52 tenant management
- M7-UI-53 team
- M7-UI-54 config
- M7-UI-55 analytics
- M7-UI-56 logs
- M7-UI-57 group logs
- M7-UI-58 through M7-UI-67 parity/evidence refresh
- M7-UI-97 through M7-UI-103 conversation and shell parity refinements

## Verification Log

Fresh closeout commands run on 2026-07-07:

- PASS `git diff --check origin/main...HEAD`
- PASS `git diff --check`
- PASS `node scripts/guards/doc-trigger-paths.mjs`
- PASS `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-104-internal-preview-consolidation.md --include-worktree --pr-body-file docs/evidence/M7/M7-UI-104-internal-preview-consolidation.md`
  - changed files: 179
  - source changed files: 63
  - source net LOC: 10850
  - new source files: 54
  - Exception: `large_change_exception`
- PASS `prettier --check .` with lockfile-aligned Prettier 3.8.4.
- PASS `node scripts/guards/prettier-ignore-boundary.mjs --base origin/main`
- PASS ESLint equivalent of repo `lint` script.
- PASS `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- PASS `node node_modules/knip/bin/knip.js -c package.json#knip --no-progress --duration --no-config-hints --no-tag-hints`
- PASS `node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips`
- PASS `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Vite emitted the existing chunk-size warning for the admin JS bundle.
- PASS browser smoke against `http://127.0.0.1:4173/`
  - title: `UZMAX Admin`
  - screenshot: `/tmp/uzmax-m7-closeout-preview.png`
  - page errors: none observed
- PASS `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-*.spec.ts`
  - 120 passed

Environment caveat:

- The local shell does not expose `npm`; commands were run with the bundled Codex Node executable and project-local CLI entrypoints.
- The worktree-local `node_modules` had Prettier 3.9.4, while `package-lock.json` pins Prettier 3.8.4 for CI. The final format pass used the lockfile-aligned 3.8.4 binary from the root checkout.

## Non-Closure

- Mock/degraded/read-only UI data remains intentional.
- Real API/authz/RLS/runtime/eval gates remain a follow-up closed-loop lane.
- This consolidation prepares a clean internal preview baseline; it does not authorize real staff use by itself.
