# M5-02 Distill Guardrails Evidence

## Start Audit

Recorded before source/test/docs implementation edits on 2026-06-24.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5-02-distill-guardrails` |
| assigned `git status --short --branch` | `## codex/m5-02-distill-guardrails` |
| assigned `git branch --show-current` | `codex/m5-02-distill-guardrails` |
| worker `HEAD` | `2895e3a66be6ae54581c1bc580d4cfabf29b2756` |
| worker `origin/main` | `2895e3a66be6ae54581c1bc580d4cfabf29b2756` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root branch | `main` |
| open PR audit | `gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit | `git branch --no-merged main` returned no branch output |
| linked worktree check | git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5-02-distill-guardrails`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git` |
| node_modules | missing at start; `npm ci` required before validation |

## Scope

M5-02 implements pure `packages/distill` behavior-contract helpers for:

- daily candidate cap 10 with confidence sort, deterministic tie-breaker and truncated audit refs/count;
- 7-day pass-rate summary with basis points in the `0..10000` range;
- 3 consecutive low-pass-rate days below 40% as a weekly downshift recommendation;
- owner alert draft/audit contract refs without raw customer, prompt or completion payloads;
- manual recovery audit contract that requires controlled audit ref and actor ref without runtime writes.

Allowed files are exactly the allowlist in `docs/specs/M5-02-distill-guardrails.md`. Root/main checkout is read-only for this worker.

## Boundaries

This slice does not implement API/admin/worker/runtime scheduler/cron, DB client writes, provider calls, formal knowledge/profile/eval writes, UI alert banners, mobile fallback E2E, production Redis/worker deployment, customer LLM, real customer/order data, external SaaS onboarding, GA-0, M6 or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5-02 uses controlled refs, counts, timestamps, ids and structured status only.

## Acceptance Mapping

| Item | M5-02 status | Evidence target |
|---|---|---|
| H-02 | `behavior_contract_supported_not_closed` | Candidate selection creates confirmation-target candidate refs only; no formal write path exists in this slice. |
| H-03 | `queued_not_closed` | Conflict diff UI/API enforcement remains M5-03/M5-04; this slice does not process conflict writes. |
| H-07 | `behavior_contract_supported_not_closed` | Pure contracts cover cap, pass-rate, downshift recommendation, owner alert draft and manual recovery audit requirement; scheduler, UI and persisted audit remain future. |
| I-02 | `queued_not_closed` | Mobile alert/confirmation fallback remains future M5-04/M5-05. |
| I-06 | `queued_not_closed` | Analytics readback/export remains future M5-06, though this slice provides pass-rate summary input. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-02 only; M5 closeout remains future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-02. |
| K-04 | `active` | Worktree/branch and touch list are distinct from root/main and M5-01. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Required because `node_modules` was missing at start; installed 360 packages and found 0 vulnerabilities. |
| `node --test scripts/tests/m5-distill-guardrails.test.mjs` | pass | 4/4 tests passed. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run typecheck` | pass | TypeScript completed with exit 0. |
| `npm run lint` | pass | ESLint completed with exit 0. |
| `npm run depcruise` | pass | dependency-cruiser reported no dependency violations. |
| `npm run jscpd` | pass | Reported 0 clones after local helper/loader rewrite. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok` for linked worktree `codex/m5-02-distill-guardrails`. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-02-distill-guardrails --root /Users/atilla/Documents/UZMAX智能运营` | pass | `worker-write-boundary: ok`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-02-distill-guardrails.md --include-worktree` | pass | Post-commit run reported changedFiles 6, categories docs 4/source 1/test 1, source changedFiles 1, netLoc 250, newFiles 0. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors in post-commit diff. |

## Spec Compliance Review

- Allowlist compliance: only the six M5-02 allowlist files are changed.
- Source budget: `packages/distill/src/index.ts` net source LOC is exactly 250 before commit, within target `<= 250`; changed source files = 1; new source files = 0.
- Scope compliance: implementation is pure `packages/distill` contract code. It has no DB client, runtime scheduler, API/admin/worker/cron integration, provider call or formal write path.
- Sensitive-data boundary: raw carrier keys and unsafe refs are rejected; this evidence and tests use controlled refs only.
- Acceptance status: H-07 is `behavior_contract_supported_not_closed`; M5 is not accepted.

## Code Quality Review

- Candidate selection is deterministic: confidence descending, then controlled candidate ref/tie-breaker ordering.
- 7-day pass-rate math rejects negative counts and reviewed counts greater than candidate count, and returns basis points in the `0..10000` range.
- Downshift logic recommends `weekly` only when current frequency is `daily` and the last 3 daily-count records are low; explicit `weekly` and `paused` inputs are preserved and do not auto-recover.
- Owner alert and manual recovery helpers return structured refs-only contracts; recovery reports `writesRuntimeState: false`.
