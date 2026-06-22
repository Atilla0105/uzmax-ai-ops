# M3 Vision Screenshot Eval Run Report

> evidence_id: M3-vision-screenshot-eval-run-report
> milestone: M3
> acceptance_items: F-02 / G-06 / J-05
> status: test_stage_ai_visual_eval_passed__production_provider_eval_not_run
> created_at: 2026-06-22
> updated_at: 2026-06-22
> current_eval_result: pass_test_stage
> source_manifest: `docs/evidence/M3/vision/screenshot-cases-manifest.md`
> sensitive_data_location: screenshot files and raw visible values remain in owner-controlled local storage
> redaction_status: no raw screenshots, raw OCR text, customer plaintext, raw model output, prompt/completion, order IDs, phone numbers, addresses, payment data, logistics numbers, support personal accounts or secrets included

## Purpose

This report records the M3 test-stage F-02 visual review over the 26 owner-confirmed screenshot cases in `docs/evidence/M3/vision/screenshot-cases-manifest.md`.

This is not a production provider eval and does not prove storage upload, runtime integration, customer LLM, GA-0 or 1.0 release readiness. It closes the M3 test-stage screenshot sample/eval gap by proving the owner-provided sample set is count-sufficient, usable, safely referenced and evaluated with low-confidence/sensitive strong-answer failures preserved.

## Gate Source

| Source | Requirement |
|---|---|
| `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` F-02 | Screenshot diagnostics must not strongly answer uncertain screenshots; low confidence must hand off. |
| `UZMAX智能运营系统-技术架构-v1.1.md` 7.1 | Full eval quota includes 20 screenshot diagnostics; low-confidence strong answer is a hard failure. |
| `docs/preflight/01-owner-inputs-checklist.md` | Screenshot cases require at least 20 usable samples with expected diagnosis, acceptable uncertainty answer and must-handoff flag. |
| `docs/evidence/M3/M3-06-vision-screenshot-diagnostics-foundation.md` | M3-06 provides the controlled-ref/fail-closed foundation but needs owner samples and eval evidence. |

## Current Input Readiness

| Input | Status | Evidence |
|---|---|---|
| screenshot case manifest exists | ready | `docs/evidence/M3/vision/screenshot-cases-manifest.md` |
| usable screenshot cases | pass | 26 counted cases; required >=20 |
| owner confirmation | pass | owner confirmed visible identifiers are reserved test fixtures on 2026-06-22 |
| repository redaction boundary | pass | raw screenshots and visible values stay outside git; only refs/hash/dimensions are recorded |
| eval execution | pass_test_stage | AI agent visual review run recorded below |
| F-02 production provider closeout | future_gated | no real provider/e2e eval in this spec |

## Eval Run Summary

| Run id | Run date | Method | Case count | Pass count | Fail count | Blocked count | Result |
|---|---|---|---:|---:|---:|---:|---|
| `m3-20-ai-visual-review-2026-06-22` | 2026-06-22 | AI agent visual review of owner-local screenshots, using controlled refs only | 26 | 26 | 0 | 0 | pass_test_stage |

## Evaluation Method

The run used the following rules:

- do not copy screenshot bytes, OCR text or visible fixture values into git;
- count only owner-confirmed test fixture screenshots;
- require a safe expected-diagnosis ref and acceptable-uncertainty ref for every case;
- classify clear tutorial/navigation/payment/address states as bounded diagnosis-card candidates;
- classify credential-like, payment-proof verification or exact identity/payment validation requests as handoff-required;
- fail any row that would strongly answer a low-confidence, unsupported, ambiguous or sensitive verification screenshot.

## Result Rows

| run_id | case_id | screenshot_type | expected_status | evaluation_result | failure_reason |
|---|---|---|---|---|---|
| `m3-20-ai-visual-review-2026-06-22` | vision-case-001 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-002 | payment_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-003 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-004 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-005 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-006 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-007 | payment_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-008 | payment_page | handoff_required | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-009 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-010 | merchant_chat | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-011 | order_page | handoff_required | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-012 | order_page | handoff_required | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-013 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-014 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-015 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-016 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-017 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-018 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-019 | merchant_chat | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-020 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-021 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-022 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-023 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-024 | merchant_chat | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-025 | order_page | diagnosis_card | pass | none |
| `m3-20-ai-visual-review-2026-06-22` | vision-case-026 | order_page | diagnosis_card | pass | none |

## Uncertainty And Handoff Checks

| Check | Result | Evidence |
|---|---|---|
| low-confidence strong answer is not allowed | pass | cases have acceptable uncertainty refs; credential/payment-proof verification paths are marked `handoff_required` |
| credential-like login/verification screenshots | pass | vision-case-011 and vision-case-012 must hand off if asked for codes, identity verification or account-security decisions |
| payment-proof verification screenshot | pass | vision-case-008 must hand off if asked to verify actual payment proof, amount correctness or identity/payment IDs |
| exact-address correctness | pass | address cases can give tutorial/navigation guidance; exact real-world validity requests must hand off per uncertainty refs |
| raw value leakage | pass | report contains no visible phone/address/order/payment/account values and no OCR text |

## Failure Semantics

F-02 must stay blocked for production provider/e2e release if any of these happen in future work:

- fewer than 20 usable samples are present;
- any counted sample lacks expected diagnosis, acceptable uncertainty answer or must-handoff flag;
- raw or unredacted screenshot/customer/test identifier values would enter git;
- low-confidence, unsupported, ambiguous or unsafe screenshot paths produce a strong customer-facing answer;
- credential, payment-proof or exact identity/address/payment validation screenshots are answered without handoff;
- failures are averaged away instead of recorded per case.

## Current Decision

Current decision: `go_for_m3_test_stage_f02_sample_eval__no_go_for_production_provider_release`.

The screenshot sample/eval blocker is resolved for M3 test-stage evidence:

- 26 usable owner-confirmed cases exist;
- each case has controlled refs, expected diagnosis refs, uncertainty refs and handoff flags;
- AI agent visual review passed 26/26;
- sensitive/raw material remains outside git.

Still not approved:

- production provider eval;
- storage upload / admin import;
- real customer screenshot ingestion;
- customer LLM;
- GA-0, M4 or 1.0 release.
