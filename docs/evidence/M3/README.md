# M3 Evidence

M3 evidence covers AI capabilities, LLM gateway, eval gate and the minimum knowledge/eval admin evidence needed for the AI capability milestone.

Current readiness pack: `M3-ai-capability-readiness-pack.md`.

Current closeout/no-go record: `M3-ai-capability-closeout-signoff.md`.

Current DB/contracts foundation: `M3-01-ai-capability-data-contracts-foundation.md`.

Current LLM gateway routing/accounting foundation: `M3-02-llm-gateway-routing-accounting-foundation.md`.

Current eval gate/redline runner foundation: `M3-03-eval-gate-redline-runner.md`.

Current KB journey capability foundation: `M3-04-kb-journey-capability-foundation.md`.

Current pricing capability and quote record contract foundation: `M3-05-pricing-capability-and-quote-record-contract.md`.

Current vision screenshot diagnostics foundation: `M3-06-vision-screenshot-diagnostics-foundation.md`.

Current speech transcription contract foundation: `M3-07-speech-transcription-contract.md`.

Current breaker radius and redline output guard foundation: `M3-08-breaker-radius-and-redline-output-guard.md`.

Current admin knowledge/eval shell foundation: `M3-09-admin-knowledge-eval-shell-if-needed.md`.

Current pre-M4 worker write-boundary governance follow-up: `M3-11-pre-m4-worker-write-boundary-governance.md`.

Current pre-M4 safety-critical ignore cleanup: `M3-12-pre-m4-safety-critical-ignore-cleanup.md`.

Current pre-M4 prettier-ignore guard: `M3-13-pre-m4-prettier-ignore-guard.md`.

Current M3 closeout and prettier guard follow-up: `M3-14-m3-closeout-and-prettier-guard-followup.md`.

Current M3 non-ASCII prettier guard entrypoint follow-up: `M3-15-nonascii-prettier-guard-entrypoint.md`.

Current KB material candidate pack: `M3-16-kb-material-candidates.md`.

Current owner-input intake pack: `M3-17-owner-input-intake-packs.md`.

Current CI cost stopgap: `M3-18-ci-cost-stopgap.md`.

Current test-phase AI materials branch: `M3-19-test-phase-ai-materials.md`.

Current vision screenshot sample/eval evidence: `M3-20-vision-screenshot-samples.md`.

Current language safety-lock evidence: `M3-21-language-safety-lock-review.md`.

M3 current status: `foundation_queue_complete__test_stage_f02_g04_ready__owner_signoff_pending`. This means M3-01 through M3-09 foundation PRs are complete and merged, M3-11 through M3-15 have added signoff-before governance follow-ups, M3-16 has generated an owner-reviewed candidate tutorial/KB material pack from owner-local controlled sources, M3-17 has prepared controlled intake evidence shells, M3-18 has reduced CI cost exposure, M3-19 has recorded the owner-approved test-phase source branch with KB structure and language sample-selection evidence, M3-20 has recorded 26 owner-confirmed test-fixture screenshot cases with AI visual eval pass evidence, and M3-21 has recorded the language strong-model lock / route-freeze safety decision. M3 test-stage closeout is ready for project-owner signoff. It does not mean production, GA-0, real customer traffic, customer LLM, prompt/model route release, knowledge publish, AI persona release, Business release, M4 start or 1.0 release approval.

M2 prior state: `owner_accepted_m2_milestone_evidence` only. Project owner accepted M2 milestone evidence, but M2 evidence explicitly did not approve production, GA-0, real customer traffic, customer LLM, Telegram Business feasibility, Business auto-reply or 1.0 release.

M3 owner-input blockers from the v1.1 root docs:

- phase-one tutorial material pack is required before M3/tutorial closeout; M3-16 now provides owner-reviewed candidate materials in `docs/evidence/M3/tutorial/tutorial-materials-manifest.md`, `docs/evidence/M3/tutorial/journey-import-report.md` and `docs/evidence/M3/tutorial/kb-candidate-pack.md`, but future import/eval evidence and publish gates are still pending;
- screenshot diagnostic samples >=20 are required before F-02 closeout; M3-20 updates `docs/evidence/M3/vision/screenshot-cases-manifest.md` and `docs/evidence/M3/vision/eval-run-report.md` with 26 owner-confirmed test-fixture cases and AI visual eval pass evidence; production provider/e2e remains future-gated;
- Uzbek Latin/Cyrillic/Russian blind review is required inside M3 for G-04; M3-21 records a test-stage safety-lock decision after verifying 80 selected controlled ids. Production reviewed counts remain 0/0/0, but weak/low-quality model release is blocked by `strong_model_locked_until_owner_blind_review` and route optimization remains frozen.

Current repo evidence includes an owner-reviewed candidate tutorial/KB material pack, a test-stage KB structure, M3-20 screenshot sample/eval evidence and M3-21 language safety-lock evidence. M3 test-stage closeout is ready for project-owner signoff while production import/eval/publish, production blind-review quality pass, production provider/e2e, customer LLM, GA-0 and 1.0 release remain future-gated.

M3-01 records the first `packages/db` global serial point for M3. It adds minimal schema/contracts/eval persistence/LLM accounting foundation only; F-01/F-02/F-04/F-05/G-01/G-02/G-03/G-05/G-06/H-01 remain foundation/queued and not closed. The owner-input blockers above remain in force.

M3-02 records a pure `packages/llm-gateway` foundation for task route validation, deterministic mock provider fallback, timeout/cost/token budgets and accounting drafts. It uses no real provider, SDK, key, customer LLM, persistence, API/worker/engine/admin integration or production route release. G-01/G-02 are foundation-only and not closed for production.

M3-03 records a pure `packages/evals` foundation for eval gate category/status parity, redline leakage checks, category quota fail-closed behavior and prompt/knowledge/model route/persona publish refusal decision semantics. It uses no real fixtures, raw samples, provider calls, persistence, API/worker/engine/admin integration or production publish path. F-05/G-03 are foundation-only and not closed for production.

M3-04 records a pure `packages/capabilities/kb` foundation for tutorial stage localization, stage-card-only answers, controlled refs and unknown/ambiguous fail-closed behavior. It uses no DB persistence, LLM provider, other capability import, engine integration, admin UI, knowledge publish, raw owner tutorial pack or real customer traffic. F-01/H-01 are foundation-only and not closed; M3-16 later adds owner-reviewed candidate tutorial materials, but future import/eval/publish gates remain active.

M3-05 records a pure `packages/capabilities/pricing` foundation for deterministic code-created quotes, LLM parameter candidate boundaries and M3-01 compatible `quote_record` drafts. It uses no DB persistence, LLM/provider call, other capability import, engine/API/admin/worker integration, pricing API, order connector, customer asset integration, raw samples or real customer traffic. F-04 is foundation-only and not closed for production; DB persistence, E2E quote flow and customer asset quote history remain future work.

M3-06 records a pure `packages/capabilities/vision` foundation for field-specific controlled screenshot refs, strict allowlisted candidate/manifest shapes, bounded synthetic diagnosis cards, uncertainty-to-handoff/fail-closed behavior and safe sample manifests. It uses no raw screenshots, raw OCR/customer text, DB persistence, LLM/provider call, other capability import, engine/API/admin/worker integration, real eval runner or real customer traffic. M3-20 later adds 26 owner-confirmed test-fixture screenshot samples and AI visual eval evidence, resolving the >=20 owner screenshot samples test-stage gap; production provider/e2e remains future-gated.

M3-07 records a pure `packages/capabilities/speech` foundation for field-specific controlled speech refs, strict allowlisted candidate/manifest shapes, bounded synthetic transcription results for Uzbek Latin, Uzbek Cyrillic and Russian, confidence/source refs and fail-closed postprocess behavior. It uses no raw voice/audio/transcripts, DB persistence, LLM/provider call, provider SDK/key/env, other capability import, engine/API/admin/worker integration, real eval runner or real customer traffic. F-03 is foundation-only and not closed; real/integration voice sample evidence, owner sample handling, provider/spike decision if any, future voice-to-text flow validation and Uzbek Latin/Cyrillic/Russian blind review remain active blockers.

M3-08 records a pure `packages/engine` foundation for user-level, user+capability, capability-level and global breaker radius decisions plus redline output guard behavior and safe degradation/handoff contract semantics. It uses no DB persistence, evals import, LLM/provider call, capability import, API/admin/worker integration, real redline samples, production output filter or real customer traffic. F-05/F-06/G-05/L-02 are foundation-only and not closed; production output filtering, runtime breaker events, real fault injection, leave-ticket drill and false-positive dashboard remain future work.

M3-09 records a pure `apps/admin` synthetic/local shell for facts, journeys, stages, materials and eval gate failed/blocked semantics. It uses no backend import, DB persistence, real API client, eval runner integration, provider call, real fixture, knowledge publish, production gate runtime or real customer traffic. G-03/H-01/I-01 are partial/foundation evidence only and not closed; production publish integration, full desktop core, owner tutorial material pack, screenshot sample evidence, language blind review and M3 closeout remain active blockers.

M3-11 records a pre-M4 worker write-boundary governance follow-up after M3-07/M3-09 root/main pollution incidents. It adds in-repo detection/forensics and runbook evidence for assigned worktree/root-main state, but it is not a runtime jail and does not start M4.

M3-12 records a pre-M4 safety-critical formatter cleanup. It removes logic-shaped formatter bypasses from M3 eval/engine/LLM gateway safety logic while preserving behavior and leaving owner-input blockers unchanged.

M3-13 records a pre-M4 prettier-ignore boundary guard. It freezes the monitored source/test baseline, blocks spread in code/test paths, and does not clean business source or alter M3 owner signoff status.

M3-14 records a follow-up that hardens the prettier-ignore boundary focused test fixture and backfills M3 closeout evidence with M3-11/M3-12/M3-13/M3-14 status. It does not mark M3 accepted and does not start M4.

M3-15 records a follow-up that fixes the prettier-ignore guard CLI entrypoint under non-ASCII script paths and adds a focused regression so the guard no longer silently skips `main()` on the local Chinese root path. It does not mark M3 accepted and does not start M4.

M3-16 records a docs-only owner-reviewed candidate tutorial/KB material pack derived from the owner-local FAQ file and redacted Telegram sample manifests. It stores source hashes, aggregate counts, QA ids, sample ids, draft journey stages and candidate fact boundaries only; it does not copy raw source files, publish knowledge, close M3 or start M4.

M3-17 records docs-only intake shells for the remaining owner-input blockers. It creates screenshot sample manifest, screenshot eval report and language blind-review report destinations with required fields, current counts and no-go boundaries; it does not add samples, run evals, complete blind review, close M3 or start M4.

M3-18 records a CI cost stopgap. It keeps the required `checks` job while making docs-only PRs run lightweight governance gates and leaving heavy gates conditional on relevant paths or manual full CI. It does not close M3 or start M4.

M3-19 records the project owner test-phase material branch decision. It allows AI agent to use local FAQ, redacted chat samples and future citable public references for test-stage KB structure and AI-assisted review preparation, while keeping production knowledge publish, screenshot closure, owner blind review, M3 closeout, GA-0 and 1.0 release blocked.

M3-20 records the project owner screenshot test-fixture branch decision and F-02 test-stage sample/eval evidence. It manifests 26 owner-confirmed screenshot cases using controlled refs only and records AI visual review pass 26/26; raw images and visible values stay outside git, and production provider/e2e remains future-gated.

M3-21 records the project owner test-stage language safety-lock decision. It verifies 80 selected controlled sample ids from the owner-local redacted candidate set and keeps weak/low-quality model release blocked by strong-model lock until owner blind review; raw rows and model replies stay outside git, and production language quality pass remains future-gated.

M3-07 records incident `docs/incidents/INC-2026-06-19-m3-07-root-main-worktree-pollution.md`: a relative edit operation wrote M3-07 files into root/main before commit. The polluted diff was sealed, root/main was cleaned and rechecked, changes were restored only into the assigned worktree, and M3-07 required absolute-path edits plus root/worktree dual status checks for the rest of that slice. After PR #45 merged, this incident is `institutionalized_in_docs`.

M3-09 also records incident `docs/incidents/INC-2026-06-19-m3-09-root-main-worktree-pollution.md`: a relative edit operation wrote M3-09 files into root/main before commit. The polluted diff was sealed, root/main was cleaned and rechecked, changes were restored only into the assigned worktree, and M3-09 required absolute-path or `git -C` edits plus root/worktree dual status checks after migrations, large edits and formatter/generated writes. After PR #47 merged, this incident is `institutionalized_in_docs`. M3-11 implemented the follow-up in-repo worker write-boundary detection/runbook; runtime/harness sandboxing still owns prevention for future parallel work.

M3 evidence must not include raw sample content in git. Do not commit raw/export/jsonl/csv, customer plaintext, Telegram payloads, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts or secrets. Future sensitive source material must stay in controlled storage; repo evidence may only record manifests, redaction method, storage refs, access scope, retention period and project owner confirmation status.
