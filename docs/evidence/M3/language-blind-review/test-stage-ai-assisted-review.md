# M3 Test-Stage AI-Assisted Language Review

> evidence_id: M3-test-stage-ai-assisted-language-review
> milestone: M3
> acceptance_items: G-04 / G-06 / J-05
> status: test_stage_ai_assisted_review_completed_safety_lock_ready_not_production_scored
> created_at: 2026-06-22
> source_manifest: `/Users/atilla/Documents/聊天记录_脱敏样本/MANIFEST.md`
> sensitive_data_location: source rows and future model replies remain outside repository in owner-local controlled storage
> redaction_status: no raw customer plaintext, raw model replies, prompt/completion, route metadata, phone numbers, addresses, order/payment/logistics identifiers, support personal accounts or secrets included

## Purpose

This file records what AI agent can complete under the owner-approved test-phase branch: sample coverage audit, controlled sample-id selection and conservative AI-assisted release-safety review.

This is not the production G-04 owner blind review. It does not contain raw model replies, production owner scores or a production route release.

## Coverage Audit

| Local source | Rows | Relevant language/script labels | Current limitation |
|---|---:|---|---|
| seed review set | 80 | `uz_ru_mixed` 62, `uz_latin` 16, `ru_latin_mixed` 1, `zh_uz_mixed` 1 | Seed set alone does not isolate 20 Uzbek Latin, 20 Uzbek Cyrillic and 20 Russian rows. |
| all redacted candidates | 2443 | `uz_latin` 524, `ru_latin_mixed` 518, `uz_ru_mixed` 150, `ru_or_cyrillic` 28 | Candidate pool is sufficient for test selection, but labels are proxy labels and need future production relabeling. |

## Test Sample Selections

The rows below are controlled sample ids only. They do not reveal customer text or model replies.

### Uzbek Latin Proxy

| Metric | Value |
|---|---:|
| selected ids | 20 |
| production G-04 count | 0 |

`real-3c5d8d70fa9d6082`, `real-f680bab193a40f3b`, `real-d76a67bd0147c71b`, `real-638396614713905e`, `real-7ae618e35e1b1353`, `real-6d50b952abf23571`, `real-80ac5c3cf45435ce`, `real-19896781692098fe`, `real-20e626d2929d1660`, `real-218a3e91df938d0c`, `real-d5e528fb677917c7`, `real-562383883f0bb18d`, `real-4ba894179d39c2b7`, `real-5369b37d4d509e91`, `real-736a14975486e608`, `real-1ed069551d86d31a`, `real-f01d617d9e534258`, `real-e307ae75ac7e8a17`, `real-9054401d51637cd6`, `real-ce493c916d537336`

### Cyrillic / Russian Proxy

| Metric | Value |
|---|---:|
| selected ids | 20 |
| production G-04 count | 0 |

`real-724ee680e4f86cfd`, `real-4b0c69a8d6d99190`, `real-a8d0d6f5272ce31b`, `real-a9f7d56c6c43e646`, `real-ef21d1f73fb0a9ad`, `real-834324d697df819d`, `real-ba7bbf218b6b0c18`, `real-4ce369c45860ecb3`, `real-361a9478a7242346`, `real-cf353ddb1f804625`, `real-f17d466f9f83f6d1`, `real-94783ef984f0cac9`, `real-9264cba32f64faef`, `real-8c84e1da6a667b7d`, `real-f2dcbead30dae41d`, `real-c3836c4a708af37a`, `real-09237b7cac082286`, `real-db56d3882226125e`, `real-e22a82a7a992cd6f`, `real-8924bdd2735ec8ab`

### Russian Latin Mixed Proxy

| Metric | Value |
|---|---:|
| selected ids | 20 |
| production G-04 count | 0 |

`real-434d51b4af8abd09`, `real-a875dcd86f8b1f51`, `real-40a4ecffdfcc8e40`, `real-593efca6720fc695`, `real-46fd0a68f6aa73f6`, `real-b34b650448a8a47b`, `real-a0682a77d720ab8b`, `real-c1f13070f72e0813`, `real-21b3bad38f8a7fe4`, `real-1173202f13c88bcd`, `real-661073c962e6d7f8`, `real-30f9aa53ee530d97`, `real-b1a244dc7db01d65`, `real-0b336320e913b840`, `real-8759a3ae9c91512a`, `real-b82dad441d3dc14d`, `real-1b6f28583c6e8f50`, `real-8b395780f88db97a`, `real-d75d28fe41cd0b48`, `real-0f1575a525a20084`

### Uzbek / Russian Mixed Proxy

| Metric | Value |
|---|---:|
| selected ids | 20 |
| production G-04 count | 0 |

`real-94ffde9b156846e4`, `real-c317d3a1db002583`, `real-52dcdefe7d11ad73`, `real-06cc9395b9ed91bf`, `real-6ad83069a76fdbda`, `real-fe729c47d6bd472d`, `real-2a271a472e913b1c`, `real-5aa1a59cb19686ce`, `real-e55515e8a3e23a53`, `real-4b6c94edb3213709`, `real-428630d070ea3561`, `real-3fc9a42a9f7b04ea`, `real-9fda1a6b433bba44`, `real-63019bc5052a74e5`, `real-01d21bb75778fb31`, `real-f77931f9493fd965`, `real-4e6fc6f527384eed`, `real-290c002fd937a245`, `real-06ff60db21f65fab`, `real-2808b1b12755415a`

## Strong-Model Safety Default

Current test-stage decision: `strong_model_locked_until_owner_blind_review`.

Because this file does not contain production owner blind-review scores, low-quality model use for customer replies remains locked out. Route optimization remains frozen for production until a future owner blind-review report records explicit pass/fail and strong-model lock decisions.

## M3-21 AI-Assisted Review Run

| Field | Value |
|---|---|
| run_id | `m3-21-language-safety-lock-review-2026-06-22` |
| selected_ids_checked | 80 |
| unique_selected_ids | 80 |
| missing_selected_ids | 0 |
| raw_rows_committed | 0 |
| raw_model_replies_committed | 0 |
| production_owner_scores | 0 |
| weak_model_customer_release | blocked |
| route_optimization | frozen |

## M3-21 Coverage And Safety Summary

| Group | Selected ids | Verified ids | Production owner scored | Test-stage safety result |
|---|---:|---:|---:|---|
| Uzbek Latin Proxy | 20 | 20 | 0 | strong_model_or_human_path_required |
| Cyrillic / Russian Proxy | 20 | 20 | 0 | strong_model_or_human_path_required |
| Russian Latin Mixed Proxy | 20 | 20 | 0 | strong_model_or_human_path_required |
| Uzbek / Russian Mixed Proxy | 20 | 20 | 0 | strong_model_or_human_path_required |

## M3-21 Release Safety Decision

This AI-assisted review closes only the M3 test-stage release-risk question:

- selected IDs are real, unique and traceable to the owner-local redacted candidate set;
- no raw customer text, raw human reply or raw model reply enters git;
- no weak/low-quality model route is approved;
- strong-model lock stays active until owner blind review;
- production route optimization stays frozen until owner blind review.

It does not certify that model replies are production-quality.

## Current Decision

Current decision: `test_stage_ai_assisted_review_completed__strong_model_locked_until_owner_blind_review`.

This evidence resolves the M3 test-stage language safety-lock gap. It is not proof of Uzbek Latin/Cyrillic/Russian production quality and is not production readiness.
