# M3 Tutorial Materials Manifest

> evidence_id: M3-tutorial-materials-manifest
> milestone: M3
> status: candidate_owner_review_completed_not_published
> created_at: 2026-06-21
> spec: `docs/specs/M3-16-kb-material-candidates.md`
> sensitive_data_location: source material remains outside repository in owner-local controlled storage
> redaction_status: generated repo artifacts contain derived candidate knowledge only; no raw Telegram payloads, customer plaintext, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts, raw prompts, raw completions, LLM keys or secrets

## Source Materials

| Source | Role | Hash / count | Repository handling |
|---|---|---|---|
| `/Users/atilla/Documents/agent_startup_60_high_frequency_QA.md` | owner-provided high-frequency QA reference | sha256 `c90821e219a22a5c646b2aa47759927aca4e1885468ab96e15f711b334e27db1`; 823 lines; 60 QA items | not committed; used only to derive candidate knowledge |
| `/Users/atilla/Documents/聊天记录_脱敏样本/MANIFEST.md` | redacted Telegram sample manifest | sha256 `ac36185db7766d8aaee9d87d9405f2a691c58d87757ee23f3034f5779d89da4b`; 124 lines | not committed; metadata summarized here |
| `/Users/atilla/Documents/聊天记录_脱敏样本/telegram_real_seed80_redacted_review.jsonl` | 80-row redacted seed review set | sha256 `c1c6ae797c9dc3a20f9325c0448b38f684d81c03f88a3ec7267bfc5080d97a05`; review status `needs_human_review` | not committed; sample ids only |
| `/Users/atilla/Documents/聊天记录_脱敏样本/telegram_real_candidates_redacted.jsonl` | 2443-row redacted candidate pool | sha256 `034bc7a2526dfc4bc3995d5685659a332cc655d4b10268c8e1e6f66bb392f468`; review status `needs_human_review` | not committed; aggregate counts only |

## Generated Artifacts

| Artifact | Purpose | Status |
|---|---|---|
| `docs/evidence/M3/tutorial/kb-candidate-pack.md` | owner-reviewed candidate knowledge pack derived from FAQ plus redacted Telegram evidence refs | `candidate_owner_review_completed_not_published` |
| `docs/evidence/M3/tutorial/journey-import-report.md` | draft journey/stage import mapping for M3 KB foundation contract | `draft_not_imported_not_published` |

## Owner Review Record

| Fact | Evidence |
|---|---|
| Review status | `owner_review_completed_no_corrections_provided` |
| Review source | Project owner wrote `审核完了` in the Codex thread on 2026-06-21. |
| Publication boundary | Review completion does not mean official KB, import, eval closure, publish, M3 closeout, M4 start or production release. |

## Coverage Summary

| Area | Source coverage | Candidate status |
|---|---|---|
| Service scope and language policy | QA-01 through QA-05 | owner review completed; no corrections provided |
| Registration, Telegram binding, customer ID and address | QA-06 through QA-12 plus Telegram account/status templates | owner review completed; no corrections provided |
| Ordering, pre-alert, inbound and warehouse handling | QA-13 through QA-20 plus inbound/delivery seed refs | owner review completed; no corrections provided |
| Route choice, pricing and timing | QA-21 through QA-32 plus pricing/timing seed refs | owner review completed; exact pricing remains calculator/system-config controlled |
| Restricted and sensitive goods | QA-33 through QA-40 plus restricted_goods seed refs | owner review completed; specific product questions require image/link/quantity and human review when uncertain |
| Customs and tax | QA-41 through QA-45 plus timing_customs seed refs | owner review completed; no corrections provided |
| Billing, payment and storage | QA-46 through QA-50 plus billing seed refs | owner review completed; no corrections provided |
| Pickup and delivery | QA-51 through QA-56 plus delivery seed refs | owner review completed; no corrections provided |
| After-sales and claims | QA-57 through QA-60 plus claim_after_sales seed refs | owner review completed; compensation decisions require human review |

## Boundary

- This manifest does not mean knowledge publish.
- This manifest does not mean M3 closeout, F-01/H-01 full closure, production readiness, GA-0, real customer traffic or customer LLM approval.
- Future import/eval/publish gates are still required before any candidate becomes official knowledge.
- Screenshot diagnostic samples and Uzbek Latin/Cyrillic/Russian blind review remain separate M3 blockers.
