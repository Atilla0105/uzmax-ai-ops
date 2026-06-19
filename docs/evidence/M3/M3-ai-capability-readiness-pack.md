# M3 AI Capability Readiness Pack

> evidence_id: M3-ai-capability-readiness-pack
> milestone: M3
> acceptance_items: F-01 / F-02 / F-03 / F-04 / F-05 / F-06 / G-01 / G-02 / G-03 / G-04 / G-05 / G-06 / H-01 / I-01 / J-05 / K-03 / K-04
> status: foundation_queue_complete__owner_inputs_block_closeout
> created_at: 2026-06-19
> updated_at: 2026-06-19
> owner_ai_boundary: Project owner decides tutorial materials, screenshot samples, language blind review, real customer data, customer LLM, provider keys/routes, knowledge publish, AI persona release, GA-0, cost, compliance and 1.0 release. AI agent records current repo evidence, queue, blockers, validation and sensitive-data boundary only.
> source_files: `AGENTS.md`, four v1.1 root docs, `docs/specs/README.md`, `docs/doc-gates.md`, `docs/preflight/01-owner-inputs-checklist.md`, `docs/evidence/M2/README.md`, `docs/evidence/M2/M2-channel-conversation-closeout-signoff.md`, `docs/specs/M2-00-channel-conversation-readiness-pack.md`, `docs/evidence/M2/M2-channel-conversation-readiness-pack.md`, local `git`/`gh` verification on 2026-06-19.
> sensitive_data_location: none in repository
> redaction_status: no raw Telegram payloads, customer plaintext, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts, secrets or token values included
> review_notes: M3-01 through M3-09 foundation queue is now complete and merged. Owner tutorial pack, screenshot samples and Uzbek/Russian blind review still block M3 closeout. Production, GA-0, real traffic, customer LLM, prompt/model route release, knowledge publish, AI persona release and 1.0 release remain blocked or future-gated.
> signoff: no_go__foundation_queue_complete__owner_inputs_block_closeout; not M3 owner accepted; not production readiness

## Current Decision

M2 channel/conversation milestone evidence was owner accepted before M3 opened, and M3-00 used that baseline to open the M3 readiness/spec-queue PR. After M3-10, M3 foundation queue evidence is complete, but closeout remains no-go.

M3 current status after the M3-10 no-go rollup is `foundation_queue_complete__owner_inputs_block_closeout`: M3-01 through M3-09 foundation PRs are complete and merged, but M3 closeout remains blocked until the owner-input blockers are provided, repo-evidenced or explicitly branched by the project owner.

This is not a production, GA-0, real-traffic, customer-LLM, prompt/model route release, knowledge publish, AI persona release or 1.0 release approval.

## Current Main Audit

| Fact | Status | Evidence |
|---|---|---|
| worktree | pass | `/Users/atilla/Documents/uzmax-m3-00-ai-readiness-pack` |
| branch | pass | `codex/m3-00-ai-readiness-pack` |
| pre-edit status | pass | `## codex/m3-00-ai-readiness-pack...origin/main` with no file changes |
| branch baseline | clean main-equivalent | `HEAD` = `origin/main` = `44c95bdbb237609eefbe1969b8f69f82e0dcbe6a` before this docs diff |
| open PR audit | none | `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` returned `[]` |
| unmerged branch audit | none | `git branch --no-merged main` produced no branch output |
| M2 state | owner accepted milestone evidence only | `docs/evidence/M2/M2-channel-conversation-closeout-signoff.md` status `owner_accepted_m2_milestone_evidence` |
| current M3 state | foundation_queue_complete__owner_inputs_block_closeout | M3-10 records foundation queue complete and closeout no-go; owner-input blockers remain unresolved |
| production readiness | blocked | production/GA-0/real traffic/customer LLM/prompt or model route release/knowledge publish/AI persona release/1.0 release remain future-gated |

## M3 Allowed Scope

- Future spec-governed foundation work for AI capability contracts, LLM gateway routing/accounting, eval gate/redline runner, knowledge/tutorial journey behavior, pricing contract, screenshot diagnostic contract, speech transcription contract and optional admin knowledge/eval shell.
- Milestone evidence and closeout records tied to F/G/H/I/J/K acceptance items.
- Controlled manifests/storage references for owner-provided samples, never raw content in git.

## Not Opened

- Production deployment readiness, GA-0, real customer traffic or 1.0 release.
- Customer messages, screenshots, voice transcripts or customer profiles entering third-party LLMs.
- Real LLM provider route release, prompt release, model route release, AI persona release or knowledge publish.
- Runtime/source implementation, DB schema, eval fixtures, generated contracts, providers, adapters, admin UI or worker/API/engine integration.
- Business release, Business auto-reply, order/customer asset M4 work, distill auto-write or production knowledge auto-write.

## Owner-input Blockers

The v1.1 docs make the following inputs M3 critical path. This readiness pack found no current repo evidence that they are already provided.

| Blocker | Source requirement | Blocking effect | Expected repo evidence destination | Current M3-00 status |
|---|---|---|---|---|
| Phase-one tutorial material pack | Technical architecture owner critical path: phase-one tutorial complete material pack before M3 | Tutorial ability has no content to run; F-01/tutorial closeout cannot complete | `docs/evidence/M3/tutorial/tutorial-materials-manifest.md`; `docs/evidence/M3/tutorial/journey-import-report.md` | `blocked_until_owner_pack_or_explicit_branch` |
| Screenshot diagnostic samples >=20 | Technical architecture owner critical path and eval quota: screenshot diagnostics need >=20 samples | F-02 cannot close; screenshot diagnostic eval cannot prove low-confidence handoff | `docs/evidence/M3/vision/screenshot-cases-manifest.md`; `docs/evidence/M3/vision/eval-run-report.md` | `blocked_until_owner_samples_or_explicit_branch` |
| Uzbek Latin/Cyrillic/Russian blind review | Technical architecture owner critical path and G-04 matrix item | G-04 cannot close; strong-model routing/optimization stays locked/frozen | `docs/evidence/M3/language-blind-review/blind-review-report.md` | `blocked_until_owner_blind_review_or_explicit_branch` |

These blockers do not prevent opening foundational specs. They do block M3 closeout and any claim that F-01/F-02/G-04 are closed.

## M3 Queue

| Order | Future spec / PR | Purpose | Exit condition |
|---:|---|---|---|
| 1 | `M3-01-ai-capability-data-contracts-foundation` | Minimal DB/schema/contracts for knowledge/tutorial/material refs, quote records, eval gate/run/result and LLM call accounting/log contracts | schema/contracts evidence passes; no runtime release |
| 2 | `M3-02-llm-gateway-routing-accounting-foundation` | Task routing, fallback, timeout/cost/token budgets, mock provider/ports and accounting | G-01/G-02 foundation with no real provider/customer LLM |
| 3 | `M3-03-eval-gate-redline-runner` | Eval gate runner, redline checks and publish refusal semantics | G-03/F-05 foundation; prompt/knowledge/model route/persona publish cannot bypass gate |
| 4 | `M3-04-kb-journey-capability-foundation` | Knowledge/tutorial stage localization, stage-card-only answer contract, unknown-to-handoff | F-01/H-01 foundation; full tutorial closeout remains owner-pack blocked |
| 5 | `M3-05-pricing-capability-and-quote-record-contract` | Code-only pricing calculation contract, LLM parameter extraction boundary and quote record evidence | F-04 evidence; no LLM math |
| 6 | `M3-06-vision-screenshot-diagnostics-foundation` | Screenshot diagnosis contract, uncertainty-to-handoff and sample manifest | F-02 foundation; closeout remains blocked until >=20 owner screenshot samples exist |
| 7 | `M3-07-speech-transcription-contract` | Speech transcription/postprocess contract for Uzbek Latin/Cyrillic/Russian with confidence/source refs | F-03 evidence without unsupported provider claims |
| 8 | `M3-08-breaker-radius-and-redline-output-guard` | User-level, capability-level and global breaker radius evidence plus redline output guard behavior | F-06 evidence; safe degradation/output-policy behavior without production release |
| 9 | `M3-09-admin-knowledge-eval-shell-if-needed` | Admin shell for knowledge/resource and eval gate evidence, pure API/client boundary and tokens | H-01/I-01/G-03 partial core-screen evidence if needed |
| 10 | `M3-10-ai-capability-closeout-signoff` | M3 closeout after queue completion and owner inputs/blind review/evidence are resolved | Owner-input blockers resolved or explicitly branched; release boundaries preserved |

## Parallelism Rules

- M3-01 DB/schema/contracts foundation is first and serial. Any schema/migration/Prisma model/generated DTO/contracts change is a global serial point.
- Eval gate and LLM route changes are shared/global. They should be serial unless future touch lists prove disjoint and no route/gate/publish semantics overlap.
- Capability packages must not import each other; `kb`, `vision`, `speech`, `pricing` and later capabilities can only be composed by `engine` or explicit ports.
- Admin cannot import backend packages. Admin evidence must use API/WS/contracts and UI tokens/primitives/patterns.
- Owner inputs block closeout. Foundational specs may proceed, but M3-10 cannot close until tutorial pack, screenshot samples and blind review are provided, repo-evidenced or explicitly branched.
- Sensitive materials must stay outside git; manifests and controlled storage refs only.

## Acceptance Mapping

| Item | M3-00 status | Future closure path |
|---|---|---|
| F-01 | queued_not_closed | M3-04; closeout blocked until owner phase-one tutorial material pack is recorded at `docs/evidence/M3/tutorial/tutorial-materials-manifest.md` and `docs/evidence/M3/tutorial/journey-import-report.md` |
| F-02 | queued_owner_input_blocked | M3-06; closeout blocked until >=20 owner screenshot samples and eval result are recorded at `docs/evidence/M3/vision/screenshot-cases-manifest.md` and `docs/evidence/M3/vision/eval-run-report.md` |
| F-03 | queued_not_closed | M3-07 speech transcription/postprocess |
| F-04 | queued_not_closed | M3-05 pricing and quote record contract; no LLM math |
| F-05 | queued_not_closed | M3-02/M3-03 redline/context boundary |
| F-06 | queued_not_closed | M3-08 breaker radius and redline output guard evidence before closeout |
| G-01 | queued_not_closed | M3-02 task route/fallback foundation |
| G-02 | queued_not_closed | M3-01/M3-02 LLM accounting/log contracts |
| G-03 | queued_not_closed | M3-03 publish refusal semantics |
| G-04 | queued_owner_input_blocked | Uzbek Latin/Cyrillic/Russian blind review required inside M3 and recorded at `docs/evidence/M3/language-blind-review/blind-review-report.md` |
| G-05 | queued_not_closed | M3-03 redline false-positive evidence, M3-08 output guard behavior and optional admin shell |
| G-06 | partial_seed_foundation_future_full_set | M1 seed runner/manifest exists; full 1.0 target >=200 and category quotas remain future |
| H-01 | queued_not_closed | M3-01/M3-04 and optional M3-09 knowledge/resource foundation |
| I-01 | partial_future_scope_only | M3-09 may provide knowledge/resource/eval core-screen evidence; full desktop core remains broader 1.0 |
| J-05 | opened_for_m3 | M3 evidence directory/readiness pack created; no release signoff |
| K-03 | active | M3-00 is one spec / one PR |
| K-04 | active | M3 queue and parallelism rules recorded |

## Sensitive Data Boundary

This readiness pack contains aggregate repo/GitHub evidence only. The repository must not receive:

- raw/export/jsonl/csv samples;
- raw Telegram payloads or customer plaintext;
- screenshots or voice transcripts;
- order IDs, phone numbers, addresses, payment data or customer identifiers;
- support personal accounts, Bot tokens, webhook secrets, LLM keys or other secrets.

Future sensitive source material, if any, must stay in controlled storage. Repo evidence may only record manifest identifiers, redaction method, storage refs, access scope, retention period and project owner confirmation status.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed local worktree dependencies before validation; npm reported existing audit advisories but did not change lockfiles. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-00-ai-readiness-pack, linked worktree, dirty allowed)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-00-ai-capability-readiness-pack.md --include-worktree` | pass | 3 changed files; categories docs 3; source changed files 0, net LOC 0, new source files 0. |
| `git diff --check` | pass | No whitespace errors. |
| `git status --short --branch` | pass | Only intended M3 docs files present before commit. |
| `npm run check` | pass | Full check passed: format, typecheck, lint, depcruise, jscpd, knip, guards, 65/65 tests, build, size and Playwright 6/6. |
| PR #38 body metadata update | pass | PR body now includes parseable `Spec ID`, `Spec file`, `Exception` and `External API evidence` fields required by `guard:pr-shape`. |
| review-fix validation rerun | pass | After adding F-06 breaker queue coverage and owner-input evidence destinations, reran required checks and full `npm run check`; all passed. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one PR | pass | This branch implements only M3-00. |
| Touch list | pass | Diff is limited to this spec, M3 evidence README and this evidence file. |
| Docs-only scope | pass | No source/test/generated/lock/config/runtime changes. |
| M3 scope honesty | pass | Scope limited to knowledge, tutorial/journey, pricing, screenshot diagnostics, speech transcription, LLM gateway and eval gate from live v1.1 docs. |
| Owner-input blockers | pass | Tutorial pack, >=20 screenshots and Uzbek/Russian blind review recorded as closeout blockers. |
| Release honesty | pass | Status is not production, GA-0, real traffic, customer LLM, prompt/model route release, knowledge publish, AI persona release or 1.0 release. |
| Sensitive data | pass | Aggregate evidence only; no raw/sample/customer/secret material. |
| External API evidence | pass | None added; no new provider/connector/adapter. |
| Exceptions | pass | none. |

## Docs Quality Review

| Check | Result | Evidence |
|---|---|---|
| Boundary wording | pass | Readiness opens only future specs and keeps M3 closeout owner-input blocked. |
| Queue order | pass | DB/contracts first; LLM gateway/eval gate before capabilities; F-06 breaker/output guard queued before optional admin shell and closeout; closeout last. |
| Parallelism wording | pass | Schema serial, shared LLM/eval serial by default, capability no cross-import, admin API-only. |
| Acceptance wording | pass | F/G/H/I/J/K items are queued/partial/opened only; no closure overclaim. |
| Sensitive data wording | pass | Raw samples/screenshots/voice/customer data/secrets barred from git. |

## Signoff Boundary

Project owner merge/signoff of M3-00 means:

- accepted: M3 may start future spec-governed AI capability PRs in queue order.
- still blocked: M3 closeout until owner tutorial pack, screenshot samples and blind review are provided, repo-evidenced or explicitly branched.
- not accepted: production readiness, real customer traffic, customer LLM, GA-0, prompt/model route release, knowledge publish, AI persona release, Business release, unsupported provider claims or 1.0 release.
