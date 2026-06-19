# M3 Evidence

M3 evidence covers AI capabilities, LLM gateway, eval gate and the minimum knowledge/eval admin evidence needed for the AI capability milestone.

Current readiness pack: `M3-ai-capability-readiness-pack.md`.

Current DB/contracts foundation: `M3-01-ai-capability-data-contracts-foundation.md`.

Current LLM gateway routing/accounting foundation: `M3-02-llm-gateway-routing-accounting-foundation.md`.

Current eval gate/redline runner foundation: `M3-03-eval-gate-redline-runner.md`.

Current KB journey capability foundation: `M3-04-kb-journey-capability-foundation.md`.

Current pricing capability and quote record contract foundation: `M3-05-pricing-capability-and-quote-record-contract.md`.

Current vision screenshot diagnostics foundation: `M3-06-vision-screenshot-diagnostics-foundation.md`.

M3 current status: `ready_to_start_specs__owner_inputs_block_closeout`. This means future M3 specs may start in queue order under one spec / one PR and touch-module governance. It does not mean production, GA-0, real customer traffic, customer LLM, prompt/model route release, knowledge publish, AI persona release, Business release or 1.0 release approval.

M2 prior state: `owner_accepted_m2_milestone_evidence` only. Project owner accepted M2 milestone evidence, but M2 evidence explicitly did not approve production, GA-0, real customer traffic, customer LLM, Telegram Business feasibility, Business auto-reply or 1.0 release.

M3 owner-input blockers from the v1.1 root docs:

- phase-one tutorial material pack is required before M3/tutorial closeout; expected evidence destinations are `docs/evidence/M3/tutorial/tutorial-materials-manifest.md` and `docs/evidence/M3/tutorial/journey-import-report.md`;
- screenshot diagnostic samples >=20 are required before F-02 closeout; expected evidence destinations are `docs/evidence/M3/vision/screenshot-cases-manifest.md` and `docs/evidence/M3/vision/eval-run-report.md`;
- Uzbek Latin/Cyrillic/Russian blind review is required inside M3 for G-04; expected evidence destination is `docs/evidence/M3/language-blind-review/blind-review-report.md`.

No current repo evidence in this M3 readiness pack provides those owner inputs. M3 closeout remains blocked until they are provided in controlled form or explicitly branched by the project owner.

M3-01 records the first `packages/db` global serial point for M3. It adds minimal schema/contracts/eval persistence/LLM accounting foundation only; F-01/F-02/F-04/F-05/G-01/G-02/G-03/G-05/G-06/H-01 remain foundation/queued and not closed. The owner-input blockers above remain in force.

M3-02 records a pure `packages/llm-gateway` foundation for task route validation, deterministic mock provider fallback, timeout/cost/token budgets and accounting drafts. It uses no real provider, SDK, key, customer LLM, persistence, API/worker/engine/admin integration or production route release. G-01/G-02 are foundation-only and not closed for production.

M3-03 records a pure `packages/evals` foundation for eval gate category/status parity, redline leakage checks, category quota fail-closed behavior and prompt/knowledge/model route/persona publish refusal decision semantics. It uses no real fixtures, raw samples, provider calls, persistence, API/worker/engine/admin integration or production publish path. F-05/G-03 are foundation-only and not closed for production.

M3-04 records a pure `packages/capabilities/kb` foundation for tutorial stage localization, stage-card-only answers, controlled refs and unknown/ambiguous fail-closed behavior. It uses no DB persistence, LLM provider, other capability import, engine integration, admin UI, knowledge publish, raw owner tutorial pack or real customer traffic. F-01/H-01 are foundation-only and not closed; the tutorial material pack owner blocker remains active.

M3-05 records a pure `packages/capabilities/pricing` foundation for deterministic code-created quotes, LLM parameter candidate boundaries and M3-01 compatible `quote_record` drafts. It uses no DB persistence, LLM/provider call, other capability import, engine/API/admin/worker integration, pricing API, order connector, customer asset integration, raw samples or real customer traffic. F-04 is foundation-only and not closed for production; DB persistence, E2E quote flow and customer asset quote history remain future work.

M3-06 records a pure `packages/capabilities/vision` foundation for controlled screenshot refs, bounded synthetic diagnosis cards, uncertainty-to-handoff/fail-closed behavior and safe sample manifests. It uses no raw screenshots, raw OCR/customer text, DB persistence, LLM/provider call, other capability import, engine/API/admin/worker integration, real eval runner or real customer traffic. F-02 is foundation-only and not closed; >=20 owner screenshot samples and future real eval evidence remain active blockers.

M3 evidence must not include raw sample content in git. Do not commit raw/export/jsonl/csv, customer plaintext, Telegram payloads, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts or secrets. Future sensitive source material must stay in controlled storage; repo evidence may only record manifests, redaction method, storage refs, access scope, retention period and project owner confirmation status.
