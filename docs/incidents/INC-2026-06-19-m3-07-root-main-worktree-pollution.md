# INC-2026-06-19 M3-07 Root Main Worktree Pollution

## Status

pending_merge

## What Happened

During M3-07 implementation, the worker used `apply_patch` with relative paths after confirming the assigned worktree was `/Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract` on branch `codex/m3-07-speech-transcription-contract`.

The patch was applied to the root/main checkout `/Users/atilla/Documents/UZMAX智能运营` instead of the assigned worktree. The mistaken writes created or modified:

- `docs/contracts/README.md`
- `docs/evidence/M3/README.md`
- `docs/evidence/M3/M3-07-speech-transcription-contract.md`
- `docs/specs/M3-07-speech-transcription-contract.md`
- `packages/capabilities/speech/**`
- `scripts/tests/m3-speech-transcription-contract.test.mjs`

No commit, push, PR, merge, secret entry or customer-data processing happened in the polluted root/main checkout.

## Impact

- The assigned worker branch initially stayed clean while root/main carried M3-07 implementation files outside the authorized worktree.
- The incident affected workspace isolation and delivery-governance trust, because root/main is reserved for coordination, audit, sync, merge cleanup and read-only checks.
- No production code was merged and no raw voice/audio/transcripts, customer plaintext, Telegram payloads, order/phone/address/payment data, support personal accounts or secrets were involved.

## Root Cause / Unknowns

- Confirmed root cause: the worker used relative-path `apply_patch` in a multi-worktree session. The edit target resolved to the root/main checkout rather than the assigned worktree.
- Structural failure mode: path verification before editing did not bind the patch target to an absolute path inside the assigned worktree.
- Unknown: the exact tool-level current-directory resolution that caused relative `apply_patch` to target root/main is not proven by repo evidence.

## Detection

The worker detected the issue when `node --test scripts/tests/m3-speech-transcription-contract.test.mjs` in the assigned worktree failed with "Could not find" for the newly added test file. A follow-up `find` located the file under `/Users/atilla/Documents/UZMAX智能运营`, and `git status --short --branch` showed root/main pollution while the assigned worktree remained clean.

## Cleanup

Coordinator completed read-only verification, sealed the mistaken content, and cleaned root/main before this incident record was created.

Sealed artifacts:

- `/tmp/uzmax-m3-07-root-pollution.hMNkNw/tracked.patch`
- `/tmp/uzmax-m3-07-root-pollution.hMNkNw/untracked.tgz`

Coordinator-confirmed cleanup state:

- root/main `/Users/atilla/Documents/UZMAX智能运营`: `## main...origin/main`
- assigned worktree `/Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract`: branch `codex/m3-07-speech-transcription-contract`

Worker follow-up in the assigned worktree:

- Applied `tracked.patch` inside `/Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract`.
- Extracted `untracked.tgz` into `/Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract`.
- Immediately rechecked root/main: `## main...origin/main`.

## Permanent Controls

- M3-07 worker edits must use absolute paths under `/Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract` when using `apply_patch`.
- After migrating or editing files, the worker must run a dual status check:
  - `git -C /Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract status --short --branch`
  - `git -C /Users/atilla/Documents/UZMAX智能运营 status --short --branch`
- This incident file is included in the M3-07 spec touch list and PR Hygiene data so the failure is recorded in repo evidence, not only in chat.
- Future worker handoffs should repeat the assigned physical worktree path and require absolute-path edits when there is any prior multi-worktree path incident in the branch.

## Institutionalized State

pending_merge

The control is documented in this incident and the M3-07 spec/PR Hygiene. It will become institutionalized for this slice when the PR merges. A broader guard or runbook hardening remains optional future governance work if similar path-resolution incidents repeat.

## Evidence Links

- Spec: `docs/specs/M3-07-speech-transcription-contract.md`
- Evidence: `docs/evidence/M3/M3-07-speech-transcription-contract.md`
- Cleanup artifacts: `/tmp/uzmax-m3-07-root-pollution.hMNkNw/tracked.patch`, `/tmp/uzmax-m3-07-root-pollution.hMNkNw/untracked.tgz`
- Detection command evidence recorded in PR final report: focused test missing file, `find`, worker/root status checks

## Owner / AI Boundary

AI agents are responsible for recording the incident, migrating only into the assigned worktree, validating cleanup, adding permanent controls to the spec/PR Hygiene, and keeping this PR within M3-07 scope.

Project owner remains the only decision maker for final risk acceptance, scope changes, production release, real customer data, real voice samples, LLM keys/provider release, cost and compliance decisions.
