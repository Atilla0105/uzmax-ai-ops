# INC-2026-06-18 M2 Worktree Contamination

> incident_id: INC-2026-06-18-m2-worktree-contamination
> severity: high
> status: guarded
> detected_at: 2026-06-18
> milestone: M2
> owner_ai_boundary: AI agent records repo evidence, cleanup state, unknowns and permanent controls; project owner decides final acceptance of M2 governance risk and any release or real-data risk.
> sensitive_data_status: none_observed_in_repo_evidence

## Summary

During M2, the project encountered root/worktree miswrite or workspace contamination risk. The direct repo evidence currently available is limited: `docs/evidence/M2/M2-05-realtime-ws-evidence-if-needed.md` records a root write boundary where an initial mistaken root write was removed and the root checkout returned clean before the isolated worktree diff.

This incident record does not claim a complete timeline or a complete root cause. The absence of a prior incident log is itself a governance defect: the repo can prove the boundary record and cleanup statement, but it cannot reconstruct every step that led to the contamination concern.

M2-10 adds the first lightweight machine guard for this incident class: local feature work must run from a linked git worktree, root/main coordination checkout must stay clean and not ahead of upstream, and CI explicitly skips/limits physical local worktree checks instead of pretending to verify a developer machine checkout.

## Impact

- Actual impact: repo evidence shows a process boundary failure was significant enough to require root write cleanup during M2 evidence work.
- Potential impact: if repeated, multiple workers sharing a physical checkout can contaminate git index state, current branch, dependency installs, generated files, build artifacts, caches and validation results across specs.
- Not observed / not claimed: this record does not claim production impact, customer-data exposure, secret exposure, Telegram Business feasibility change, GA-0 approval, owner acceptance or 1.0 release readiness.

## Root Cause And Unknowns

- Confirmed structural failure mode: physical checkout isolation was insufficient for the orchestration pattern. Touch-module rules can constrain tracked file paths, but they do not isolate git index/current branch, `node_modules`, build artifacts, caches, generated output or shell working directory state.
- Confirmed governance gap: before this PR, the repo had no durable incident template or closeout requirement for process incidents, so the full timeline cannot be proven from repository evidence alone.
- Unknown timeline or facts: the exact initiating command sequence, all transient files and every intermediate checkout state are not recoverable from current repo evidence.
- Why the unknown remains: M2 had evidence files and PR hygiene tables, but no dedicated incident log at the time of the incident.

## Detection

- Detected through M2 closeout/governance review and the M2-05 evidence boundary note.
- Direct evidence: `docs/evidence/M2/M2-05-realtime-ws-evidence-if-needed.md` says final edits were limited to the isolated worktree, an initial mistaken root write was precisely removed, and root returned clean before the worktree diff.
- Follow-up evidence: this M2-09 PR adds permanent docs controls and updates M2 closeout to list the incident.

## Cleanup

- Completed cleanup supported by repo evidence: M2-05 records that the mistaken root write was removed and root returned clean before the M2-05 worktree diff.
- M2-09 cleanup/control: the docs-only incident governance PR ran in `/Users/atilla/Documents/uzmax-governance-incident-closure` on `codex/governance-incident-closure`; it did not edit the root checkout.
- M2-10 guard control: the guard PR runs in `/Users/atilla/Documents/uzmax-workspace-guard` on `codex/workspace-guard`; it does not edit the root checkout.
- Remaining unknowns: because no prior incident record existed, this file cannot prove that all transient workspace states across M2 were enumerated at the time. It records the known boundary and institutionalizes the control for future work.

## Permanent Controls

- `AGENTS.md` now states: one worker = one git worktree = one branch = one spec.
- Concurrent workers must not share a physical checkout, git index, current branch, `node_modules`, build/dist/cache state or uncommitted workspace state.
- The root/main checkout is reserved for coordination, audit, `main` sync, post-merge cleanup and read-only verification; it must not carry worker edits.
- Coordinator dispatch must confirm physical worktree path exclusivity, branch exclusivity and spec touch-module exclusivity; schema, lockfile, shared config, CI/guard scripts, global generated artifacts and release/production gate changes are global serial points.
- `docs/specs/README.md` and `SPEC-template.md` now require worktree/branch preconditions, concurrent dispatch evidence when applicable, incident triggers and milestone incident closeout.
- `docs/incidents/` now provides a README and template for future incidents.
- `scripts/guards/workspace-isolation.mjs` implements the M2-10 minimum guard: non-`main` local work must run in a linked git worktree; local `main` must be clean and not ahead of upstream; CI prints an explicit skipped/limited physical worktree message and passes.
- `package.json` exposes `guard:workspace` and runs it from `npm run check`.
- `.github/workflows/ci.yml` runs `npm run guard:workspace`; CI is safe because the guard does not require a linked local worktree when `CI=true` or `GITHUB_ACTIONS=true`.
- `scripts/tests/workspace-isolation.test.mjs` covers clean primary main pass, linked dirty feature worktree pass, primary feature checkout fail, dirty primary main fail, main ahead of upstream fail and CI-mode skipped/limited pass.

## Institutionalized Status

`guarded`: docs controls are institutionalized and the M2-10 workspace guard is now wired into local `check` and CI. This status does not claim complete historical root cause reconstruction, production readiness or owner acceptance.

## Evidence Links

- Spec: `docs/specs/M2-09-workspace-incident-governance.md`.
- Guard spec: `docs/specs/M2-10-workspace-guard.md`.
- Guard script: `scripts/guards/workspace-isolation.mjs`.
- Guard tests: `scripts/tests/workspace-isolation.test.mjs`.
- Guard wiring: `package.json`, `.github/workflows/ci.yml`.
- Incident template: `docs/incidents/INCIDENT-template.md`.
- M2 direct boundary evidence: `docs/evidence/M2/M2-05-realtime-ws-evidence-if-needed.md`.
- M2 closeout update: `docs/evidence/M2/M2-channel-conversation-closeout-signoff.md`.

## Owner / AI Boundary

- AI agent responsibility: record the incident with cognitive restraint, update governance docs, run validation and surface remaining unknowns.
- Project owner decision boundary: accept or reject the governance risk closure and decide any release, real account, real customer data, LLM key, cost or compliance implications.
