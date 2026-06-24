# M5-04 Confirmation Queue Admin Evidence

## Start Audit

Recorded before source/test implementation edits on 2026-06-24.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5-04-confirmation-queue-admin` |
| assigned `git status --short --branch` | `## codex/m5-04-confirmation-queue-admin...origin/main` |
| assigned `git branch --show-current` | `codex/m5-04-confirmation-queue-admin` |
| worker `HEAD` | `7f25d852dbdf56e039a68bf42070b8f06a06ff2f` |
| worker `origin/main` | `7f25d852dbdf56e039a68bf42070b8f06a06ff2f` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root branch | `main` |
| open PR audit | `gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit | Initial worker audit recorded no branch output; post-review refresh found stale local squash branches from merged PRs and cleaned them, see Branch Hygiene Refresh. |
| linked worktree check | git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5-04-confirmation-queue-admin`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git` |

## Branch Hygiene Refresh

Read-only spec review found three stale local squash-merge branches with prunable worktree metadata: `codex/m4-48-owner-signoff-test-alignment`, `codex/m5-00-operations-loop-readiness-pack` and `codex/m5-01-db-contract-foundation`. GitHub checks confirmed PR #111, #109 and #110 were `MERGED` on 2026-06-24. Coordinator ran `git worktree prune --verbose` and deleted those local branches. Current root/main status is `## main...origin/main`; current `git branch --no-merged main` shows only the active `codex/m5-04-confirmation-queue-admin` branch pending PR.

## Process Incident

`docs/incidents/INC-2026-06-24-m5-04-root-patch-target.md` records an initial patch-target boundary error: this worker's first patch landed in root/main, was detected before validation/commit, transferred into the assigned worktree, and removed from root. Post-cleanup root status returned to `## main...origin/main`; assigned worktree holds the M5-04 diff.

## Scope

M5-04 implements a frontend-only admin shell and pure admin API client contract for:

- listing confirmation queue items with M5-03 route/path shape;
- reading confirmation item detail, including conflict `diffPayload`;
- submitting approve/edit/discard decisions through a testable client contract;
- rejecting malformed/raw-ish client-facing payloads and uncontrolled refs;
- proving decision responses keep `formalWrite: false`;
- showing a synthetic local confirmation queue with keyboard `J/K/A/E/D`;
- showing distill health cap/pass-rate/frequency/downshift risk and recovery as disabled/local draft only;
- showing mobile approve/discard fallback while keeping edit desktop-only.

Allowed files are exactly the allowlist in `docs/specs/M5-04-confirmation-queue-admin.md`. Root/main checkout is read-only for this worker.

## Boundaries

This slice does not implement API changes, Prisma/DB runtime, schema/migrations/generated client, distill scheduler/runtime, worker/cron integration, formal knowledge/profile/eval writes, alert delivery, production Redis/worker deployment, customer LLM, real customer/order data, external SaaS onboarding, GA-0, M6 or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5-04 uses controlled refs, synthetic counts, generic summary text, local UI state and structured status only.

## Acceptance Mapping

| Item | M5-04 status | Evidence target |
|---|---|---|
| H-02 | `admin_ui_supported_not_closed` | Admin client and shell require human approve/edit/discard and prove `formalWrite: false`; formal write pipeline remains future. |
| H-03 | `admin_ui_supported_not_closed` | Conflict candidate must show side-by-side diff in admin E2E; formal storage prevention remains future integration. |
| H-07 | `admin_ui_supported_not_closed` | Admin shows cap/pass-rate/frequency/downshift risk; recovery is disabled/local draft only. |
| I-02 | `admin_ui_supported_not_closed` | Mobile fallback allows approve/discard and does not promise full edit. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-04 only; M5 closeout remains future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-04. |
| K-04 | `active` | Worktree/branch and touch list are distinct from root/main; DB schema and global serial points are untouched. |

## Validation

Recorded on 2026-06-24 from `/Users/atilla/Documents/uzmax-m5-04-confirmation-queue-admin`.

| Command | Result | Notes |
|---|---|---|
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run lint` | pass | ESLint passed including file length after moving M5 Playwright coverage to `apps/admin/tests/m5-confirmation-queue.spec.ts`. |
| `npm run typecheck` | pass | TypeScript no-emit check passed. |
| `node --test scripts/tests/m5-confirmation-queue-admin.test.mjs` | pass | 3/3 focused tests passed for client path shape, fail-closed validation and scope/source boundaries. |
| `npm run test` | pass | 341/341 repo tests passed, including M5-04 focused tests. |
| `npm run playwright` | pass | 13/13 browser tests passed, including M5-04 desktop and mobile fallback coverage. |
| `npm run depcruise` | pass | No dependency violations. |
| `npm run jscpd` | pass | No duplicates found. |
| `npm run knip` | pass | No unused dependency/export findings. |
| `npm run guard:prettier-ignore` | pass | Baseline unchanged. |
| `npm run guard:forbidden-terms` | pass | No forbidden engine business terms. |
| `npm run guard:eval-triggers` | pass | No eval-triggering paths changed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | Linked worker worktree dirty allowed. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-04-confirmation-queue-admin --root /Users/atilla/Documents/UZMAX智能运营` | pass | Assigned/root boundary passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-04-confirmation-queue-admin.md --include-worktree` | pass | Reported 10 changed files, categories source 4 / test 2 / docs 4. Manual source `git diff --numstat` is 598 net source LOC: App 3, shell 249, client 277, CSS 69. |
| `npm run build` | pass | API/worker/cron type builds and admin Vite build passed. |
| `npm run size` | pass | Size limit 250 kB; measured 63.13 kB brotlied. |
| `git diff --check origin/main` | pass | No whitespace errors. |

## Spec Compliance Review

Coordinator pre-review: pass.

- Scope stays inside the M5-04 allowlist and does not touch API, DB, distill, worker, cron, engine, capabilities, llm-gateway, evals, lockfile, config, generated artifacts or release gates.
- Admin client uses explicit fetcher injection, relative API paths and no backend imports, global fetch, runtime network call from the visible shell or formal write path.
- Admin client fails closed for conflict diffs without controlled side refs, inline candidate/diff payload strings, uncontrolled refs and decision responses that are not explicitly `formalWrite: false`.
- Visible shell uses synthetic local state, controlled refs, generic summaries and counts only; no raw customer/order data, secrets, prompts/completions or external calls.
- Desktop and mobile Playwright coverage proves keyboard review, approve/edit/discard local states, conflict diff, amber health reason/recovery draft and mobile approve/discard fallback with edit disabled.
- M5 status remains `not_accepted`; H-02/H-03/H-07/I-02 are supported by admin UI/client evidence only and still require later runtime/closeout work.

## Code Quality Review

Coordinator pre-review: pass.

- Existing admin patterns are extended in place through `apps/admin/src/App.tsx`; new source files are confined to the M5 confirmation queue client, shell and CSS because no existing admin confirmation queue implementation existed.
- Source budget is within target: changed source files 4, new source files 3, net source LOC 598/600.
- Tests do not remove, skip, weaken or compress existing M1-M4 Playwright coverage; M5 browser coverage lives in a dedicated test file to keep `design.spec.ts` under lint limits.
- The incident record is retained because the worker patch-target boundary event crossed the process threshold and was cleaned with root/main verified clean.
