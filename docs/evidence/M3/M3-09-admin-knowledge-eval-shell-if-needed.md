# M3-09 Admin Knowledge Eval Shell If Needed

> evidence_id: M3-09-admin-knowledge-eval-shell-if-needed
> milestone: M3
> spec: `docs/specs/M3-09-admin-knowledge-eval-shell-if-needed.md`
> incident: `docs/incidents/INC-2026-06-19-m3-09-root-main-worktree-pollution.md`
> branch: `codex/m3-09-admin-knowledge-eval-shell-if-needed`
> status: validated_local
> created_at: 2026-06-19
> updated_at: 2026-06-19
> sensitive_data_location: none
> redaction_status: no raw/export/jsonl/csv, customer plaintext, Telegram payloads, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts, raw prompts, raw completions, LLM keys or secrets

## Scope

This evidence records only the M3-09 synthetic/local admin UI shell for knowledge/resource and eval gate evidence.

Included:

- Tenant-layer knowledge/resource shell showing facts, journeys, stages and materials as local manageable rows.
- Eval gate panel showing production gate failed/blocked state, failed items and publish refusal semantics.
- Disabled/blocked local controls for knowledge publish, prompt save, model route release and production action.
- Playwright coverage for desktop visibility, disabled actions, sensitive-text absence and 320px mobile overflow.

Not included:

- Production API, real admin API client, WebSocket/realtime, DB persistence, Prisma schema/migration, worker/engine integration, capability runtime integration, eval runner integration, provider adapter, provider calls, real eval fixtures, real knowledge publish, prompt/model/persona release, storage upload, confirmation queue, distill, outbound send, GA-0, M3 closeout or real customer traffic.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed` |
| `git status --short --branch` | `## codex/m3-09-admin-knowledge-eval-shell-if-needed` |
| `git branch --show-current` | `codex/m3-09-admin-knowledge-eval-shell-if-needed` |
| `git fetch --prune` | pass |
| `git branch --no-merged main` | no branch output |
| `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` | `[]` |
| base | `HEAD` and `origin/main` were `ca4be55906e736d88b4e078eac925e5d2a08e683` before edits |
| dependency setup | `npm ci` passed in this linked worktree; lockfile unchanged; npm reported existing audit advisories |

No open PR conflict or unmerged branch conflict was found at start.

## Incident Record

| Field | Evidence |
|---|---|
| Incident | `docs/incidents/INC-2026-06-19-m3-09-root-main-worktree-pollution.md` |
| What happened | A relative `apply_patch` wrote M3-09 changes into root/main checkout `/Users/atilla/Documents/UZMAX智能运营` instead of the assigned worktree. |
| Stop point | Worker stopped before commit, push or PR and reported the wrong-checkout write. |
| Sealed tracked patch | `/tmp/uzmax-m3-09-root-pollution.t5hQeY/tracked.patch` |
| Sealed untracked archive | `/tmp/uzmax-m3-09-root-pollution.t5hQeY/untracked.tgz` |
| Root cleanup | Coordinator cleaned root/main and rechecked `/Users/atilla/Documents/UZMAX智能运营` as `## main...origin/main`. |
| Restore into assigned worktree | `git -C /Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed apply /tmp/uzmax-m3-09-root-pollution.t5hQeY/tracked.patch` and `tar -C /Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed -xzf /tmp/uzmax-m3-09-root-pollution.t5hQeY/untracked.tgz`. |
| Immediate dual status after restore | assigned worktree showed intended M3-09 dirty files on `codex/m3-09-admin-knowledge-eval-shell-if-needed`; root/main remained clean at `## main...origin/main`. |
| Permanent controls | Remaining M3-09 edits use absolute paths or `git -C`; relative-path `apply_patch` is prohibited; after migration/archive restore/large edit/formatter/generated write, run assigned-worktree and root/main status checks. |
| Follow-up decision | M3 closeout must decide whether broader guard/runbook/spec work is needed after this PR; not implemented here because it is outside M3-09 touch scope. |

## Read-before-work Evidence

Read before editing:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/specs/M3-00-ai-capability-readiness-pack.md`
- `docs/evidence/M3/README.md`
- `docs/specs/M3-03-eval-gate-redline-runner.md`
- `docs/evidence/M3/M3-03-eval-gate-redline-runner.md`
- `docs/specs/M3-04-kb-journey-capability-foundation.md`
- `docs/evidence/M3/M3-04-kb-journey-capability-foundation.md`
- `apps/admin/src/App.tsx`
- `apps/admin/src/M2ConversationTicketShell.tsx`
- `apps/admin/src/m2-conversation-ticket-shell.css`
- `apps/admin/src/styles.css`
- `apps/admin/tests/design.spec.ts`

## Implementation Evidence

- `apps/admin/src/App.tsx` mounts the M3 shell inside the existing admin `page-grid` after the M2 conversation/ticket shell.
- `apps/admin/src/M3KnowledgeEvalShell.tsx` contains synthetic/local UI state only: facts, journeys, stages, materials, failed production gate, failed items and disabled blocked actions.
- `apps/admin/src/m3-knowledge-eval-shell.css` keeps the shell scoped, tokenized and responsive without inline styles.
- `apps/admin/tests/design.spec.ts` covers the four knowledge/resource categories, failed eval gate state, disabled publish/save/model route/production controls, sensitive text absence inside the M3 shell and 320px no-overflow coverage.
- Admin imports remain pure frontend/local: React, `@uzmax/ui-tokens/tokens.css`, local CSS and local components only.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm run format:check` | pass | Final run reported all matched files use Prettier code style. Earlier run found formatting issues in the new M3 component/test/CSS; targeted repo-local Prettier fixed them. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-09-admin-knowledge-eval-shell-if-needed, linked worktree, dirty allowed)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-09-admin-knowledge-eval-shell-if-needed.md --include-worktree` | pass | Post-commit run reports 8 changed files; categories docs 4, source 3, test 1; source changed files 3, netLoc 414, new files 2. |
| `git diff --check origin/main...HEAD` | pass | Post-commit whitespace check returned no errors. |
| `npm run playwright` | pass | 7/7 Playwright tests passed, including M3 knowledge/eval shell and 320px mobile floor. Earlier run failed because the M3 sensitive-text assertion scanned existing M2 `withdrawn`; assertion was scoped to the M3 shell and rerun passed. |
| `npm run check` | pass | Full local gate passed: format, typecheck, lint, depcruise, jscpd, knip, forbidden-terms, eval/doc/workspace/pr-shape guard, 132/132 node tests, build, size and Playwright 7/7. Earlier run failed at jscpd due duplicated CSS badge styling; CSS was refactored and rerun passed. |
| root/main dual status checks | pass | After archive restore, incident edit and formatter write, `/Users/atilla/Documents/UZMAX智能运营` remained `## main...origin/main`. |

## PR Hygiene Summary

| Category | Result |
|---|---|
| Changed files | 8 |
| Path categories | docs 4, source 3, test 1 |
| Source changed files | 3 / budget 3 |
| New source files | 2 / budget 2 |
| Net source LOC | 414 / budget 450 |
| External API/provider/SDK evidence | none; no external provider/SDK/connector/adapter added |
| Exceptions | none |
| Test weakening | none; no `.skip` / `.only` / `xit` / `xfail` added |
| Incident | `INC-2026-06-19-m3-09-root-main-worktree-pollution`; pending_merge with root/main cleanup verified and absolute-path/dual-status controls active |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one PR | pass | This branch implements only M3-09 plus the required incident record. |
| Touch list | pass | Changed paths are limited to the M3-09 spec, incident, M3 evidence files, admin App mount, M3 component/CSS and Playwright spec. |
| Admin boundary | pass | No backend package, DB, capability, engine, evals, llm-gateway, authz or channels import in admin source. |
| Scope honesty | pass | UI is labeled synthetic/local/foundation-only; no production-ready, real API, real eval fixture, real provider/customer LLM, knowledge publish, GA-0 or 1.0 release claim. |
| Required evidence | pass | G-03/H-01/I-01 are mapped as partial/foundation evidence only. |
| Incident handling | pass | Root/main pollution incident is recorded, sealed artifact paths are linked and dual-status permanent controls are active. |
| Sensitive data | pass | UI/test/docs contain no raw samples, customer plaintext, Telegram payloads, screenshots, voice transcripts, order IDs, phone/address/payment data, support personal accounts or secrets. |
| External API evidence | pass | none; no new provider/SDK/connector/adapter. |
| Exceptions | pass | none. |

## Code Quality Review

| Check | Result | Evidence |
|---|---|---|
| Existing shell extension | pass | `App.tsx` only imports and mounts `M3KnowledgeEvalShell`; no parallel admin app architecture. |
| Operations UI density | pass | Uses category buttons, table-like rows, failure lists, policy rows and disabled controls; no landing page or hero. |
| Tokenized styling | pass | Scoped CSS uses existing `--uzmax-*` tokens and no inline styles. |
| Responsive floor | pass | Playwright asserts 320px mobile no-overflow and M3 shell visible. |
| Gate semantics | pass | Production gate is visibly failed; prompt, knowledge, model route and production actions are disabled/blocked. |
| Duplication | pass | Full `npm run check` jscpd rerun found 0 clones after CSS badge refactor. |

## Acceptance Mapping

| Item | M3-09 status | Notes |
|---|---|---|
| G-03 | ui_partial_foundation_only | UI displays production gate failed state and blocked prompt/knowledge/model route release semantics from M3-03 foundation; no production publish API/admin integration. |
| H-01 | ui_partial_foundation_only | Four knowledge/resource types are visible in a local shell; no edit persistence, DB, owner tutorial pack, media upload or knowledge publish. |
| I-01 | local_ui_partial_evidence | Knowledge/resource and eval gate shell joins admin desktop workflow; full desktop core remains broader 1.0 and not closed. |
| J-05 | foundation_updated | M3 evidence records this slice instead of deferring to M6; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; explicit touch list; no DB schema change. |

M3-09 closes no production acceptance item. It only provides local UI evidence and preserves all M3 closeout owner-input blockers.

## Sensitive Data Boundary

M3-09 stores only code, docs, synthetic local UI labels and aggregate validation evidence in git. The repository must not receive:

- raw/export/jsonl/csv samples;
- raw Telegram payloads or customer plaintext;
- screenshots or voice transcripts;
- raw prompts or raw completions;
- order IDs, phone numbers, addresses, payment data or customer identifiers;
- support personal accounts, Bot tokens, webhook secrets, LLM keys or other secrets.

Future source material must stay in controlled storage. Repo evidence may only record manifest identifiers, redaction method, storage refs, access scope, retention period and project owner confirmation status.

## Unresolved Future Closure Paths

- Production publish API/admin integration and persistence remain future specs.
- Real knowledge publish, owner tutorial material pack, journey import reports and media upload remain future specs.
- Full desktop core I-01 remains broader 1.0 scope and is not closed by this shell.
- M3 closeout remains blocked by owner tutorial materials, screenshot samples and language blind review unless provided or explicitly branched.
