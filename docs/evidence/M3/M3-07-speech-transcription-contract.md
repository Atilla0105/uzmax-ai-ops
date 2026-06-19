# M3-07 Speech Transcription Contract Evidence

> redaction_status: no raw voice/audio/transcripts, customer plaintext, Telegram payloads, screenshots, order IDs, phone numbers, addresses, payment data, support personal accounts, raw prompt/completion, LLM keys or secrets included

## Scope

- Spec: `docs/specs/M3-07-speech-transcription-contract.md`
- Branch/worktree: `codex/m3-07-speech-transcription-contract` at `/Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract`
- Touched modules: `packages/capabilities/speech`, focused M3 speech test, contracts README, M3 evidence index, this evidence file, workspace lock entry
- Incident record: `docs/incidents/INC-2026-06-19-m3-07-root-main-worktree-pollution.md`
- Foundation only: controlled synthetic transcription/postprocess contract for Uzbek Latin, Uzbek Cyrillic and Russian with confidence/source refs
- Not included: real ASR/provider/SDK/key/env, API/worker/engine/admin integration, DB persistence, real eval fixtures, raw voice/audio/transcripts, customer LLM, production route release, M3 closeout or F-03 closeout

## Contract Evidence

- `createSpeechTranscriptionInput` accepts only field-specific refs:
  - `audioStorageRef`: `storage://`
  - `manifestRef`: `manifest://`
  - `redactionRef`: `redaction://`
- `evaluateSpeechTranscription` returns `transcript_ready` only for high-confidence controlled synthetic candidates with matching language/script and required signals.
- Result/evidence refs such as model/provider/postprocess/evidence refs must use `controlled://`.
- Low confidence, missing signals, ambiguous/uncertain candidates, unsupported language and language/script mismatch fail closed without confident transcript output.
- Raw carriers and sensitive fields are rejected in inputs, candidates and manifests.
- `createSpeechSampleManifest` records controlled manifest metadata only and keeps F-03 blocked as foundation-only.

## Validation Commands

| Command | Result |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract` |
| `git status --short --branch` | initial: `## codex/m3-07-speech-transcription-contract...origin/main`; final before commit: dirty only with M3-07 allowlist files |
| `git branch --show-current` | `codex/m3-07-speech-transcription-contract` |
| `git rev-parse HEAD` | `58f2aa5b69ab5f8ee545d2556a90359a632d3fb2` |
| `npm ci` | pass; installed dependencies in the isolated worktree; existing audit output reported 3 high severity vulnerabilities |
| `npm install --package-lock-only` | pass; `package-lock.json` change limited to new `@uzmax/capability-speech` workspace registration |
| `node --test scripts/tests/m3-speech-transcription-contract.test.mjs` | pass; 7 tests, 0 failures |
| `git diff --check origin/main...HEAD` | pass |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-07-speech-transcription-contract.md --include-worktree` | pass; 9 changed files, docs 5, lock 1, config 1, source 1, test 1 |
| `npm run check` | pass; format, typecheck, lint, depcruise, jscpd, knip, guards, 119 Node tests, build, size and 6 Playwright tests passed |
| `git -C /Users/atilla/Documents/UZMAX智能运营 status --short --branch` | root/main stayed clean after migration: `## main...origin/main` |

## PR Hygiene

| Category | Value |
|---|---|
| Spec ID/file | `M3-07-speech-transcription-contract` / `docs/specs/M3-07-speech-transcription-contract.md` |
| Touched modules | `docs/specs/M3-07-speech-transcription-contract.md`; `packages/capabilities/speech/package.json`; `packages/capabilities/speech/src/index.ts`; `scripts/tests/m3-speech-transcription-contract.test.mjs`; `docs/contracts/README.md`; `docs/evidence/M3/README.md`; `docs/evidence/M3/M3-07-speech-transcription-contract.md`; `docs/incidents/INC-2026-06-19-m3-07-root-main-worktree-pollution.md`; `package-lock.json` |
| Path categories | source: 1; test: 1; docs: 5; lock: 1; config: 1; generated: 0 |
| External API evidence | none; no external API/SDK/provider/connector/adapter added or claimed |
| `rg` search conclusion | Existing speech/voice references are channel normalization, DB enum, LLM/eval task/category and M3 queue/evidence only; no existing `packages/capabilities/speech` home existed |
| Source budget | default narrowed to changed source files <= 1, net source LOC <= 400, new source files <= 1 |
| Test changes | focused Node test added; no test deletion, `.skip`, `.only`, `xit` or `xfail` |
| Lock/generated/config | `package-lock.json` only for new workspace registration; no generated/config changes |
| Exception | none |
| Incident | `INC-2026-06-19-m3-07-root-main-worktree-pollution`, status `pending_merge`; root/main cleaned by coordinator and rechecked after migration |

## Unresolved Blockers / Risks

- F-03 remains foundation-only and not closed. Full closeout still needs real/integration voice sample evidence, owner-provided sample handling, provider/spike decision if any, and voice-to-text conversation flow validation.
- G-04 / language blind review remains blocked until Uzbek Latin/Cyrillic/Russian blind review evidence is recorded or explicitly branched by owner.
- No production ASR/provider support is claimed by this PR.
