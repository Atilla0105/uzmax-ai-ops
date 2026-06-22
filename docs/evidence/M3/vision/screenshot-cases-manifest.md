# M3 Vision Screenshot Cases Manifest

> evidence_id: M3-vision-screenshot-cases-manifest
> milestone: M3
> acceptance_items: F-02 / G-06 / J-05
> status: test_stage_owner_confirmed_26_cases_ready_for_eval_not_production_closed
> created_at: 2026-06-22
> updated_at: 2026-06-22
> required_minimum_usable_cases: 20
> current_usable_case_count: 26
> current_owner_confirmed_case_count: 26
> source_material_location: owner-controlled local screenshot folder only; no screenshot files in repository
> owner_fixture_decision: On 2026-06-22 the project owner confirmed visible names, phone-like values and address/order-like values in this screenshot set are reserved test identifiers and may be handled as test fixtures for M3 test-stage evidence.
> redaction_status: no raw screenshots, OCR text, customer plaintext, Telegram payloads, order IDs, phone numbers, addresses, payment data, logistics numbers, support personal accounts or secrets included in repository evidence

## Purpose

This manifest records the F-02 screenshot diagnostic sample set in controlled-ref form. It replaces the M3-17 intake shell with actual owner-confirmed test-stage screenshot cases.

The 26 source images remain outside git. Repository evidence records only controlled refs, file hashes, dimensions, safe screenshot kinds, expected-outcome refs, acceptable uncertainty refs and review statuses. This manifest does not approve production provider evaluation, storage upload, customer LLM, GA-0, M4 or 1.0 release.

## Source Requirements

Evidence source: `docs/preflight/01-owner-inputs-checklist.md` requires at least 20 real or real-flow recreation screenshots. Each screenshot must include:

- `case-id`;
- screenshot type;
- user question;
- expected diagnosis;
- acceptable uncertainty answer;
- must-handoff flag;
- `png` or `jpg` file format.

Quality boundary:

- repository evidence must not expose avatar, nickname, phone, address, order number, payment code or logistics number values;
- enough UI context must remain for diagnosis;
- pure mock screenshots cannot satisfy the gate;
- low-clarity examples must state whether the low clarity is intentional.

## Current Manifest State

| Metric | Current value | Required for F-02 test-stage closeout |
|---|---:|---:|
| usable cases | 26 | >=20 |
| owner-confirmed cases | 26 | >=20 |
| test-fixture identifier confirmed cases | 26 | >=20 |
| cases with expected diagnosis refs | 26 | >=20 |
| cases with acceptable uncertainty refs | 26 | >=20 |
| cases with must-handoff flag | 26 | >=20 |

Current status: `sample_manifest_ready_for_test_stage_eval`.

## Controlled Source Set

| Field | Value |
|---|---|
| source batch | `controlled://owner-local/m3-20/screenshots/2026-06-22-batch` |
| image count | 26 |
| image format | `jpg` |
| capture timestamp observed from file metadata | `2026-06-22T19:57:59+05:00` |
| retention | owner-controlled local storage until production screenshot pack is rebuilt |
| repository handling | no image bytes, thumbnail, OCR text, visible fixture values or local file paths are committed |
| review method | AI agent visual inspection of the local owner-provided images plus hash/dimension inventory |

## Case Record Schema

Do not paste raw image content, OCR output, customer message text, public image URLs or local file paths into this file.

| Field | Required | Allowed value / format | Notes |
|---|---|---|---|
| `case_id` | yes | stable id, for example `vision-case-001` | Must match eval result rows. |
| `screenshot_type` | yes | `order_page`, `payment_page`, `merchant_chat` | Mirrors M3-06 `visionScreenshotKinds`. |
| `storage_ref` | yes | controlled storage ref | Do not use local file paths, public URLs, data URLs, base64 or pasted image data. |
| `redaction_ref` | yes | controlled redaction/audit ref | For this batch, refs record owner-confirmed test fixture identifiers plus no raw values in git. |
| `user_question_ref` | yes | controlled text ref | Store raw question outside git; repo records only a safe ref. |
| `expected_diagnosis_ref` | yes | controlled expected-outcome ref | Eval compares against this ref, not raw private text. |
| `acceptable_uncertainty_ref` | yes | controlled expected-uncertainty ref | Required because F-02 fails when low-confidence screenshots are strongly answered. |
| `must_handoff` | yes | `true` or `false` | Required for uncertainty-to-handoff evaluation. |
| `owner_confirmation_status` | yes | `confirmed` | Only owner-confirmed samples count. |
| `agent_redaction_review_status` | yes | `passed_test_fixture_boundary` | Confirms no raw values are committed and owner marked visible identifiers as test fixtures. |
| `agent_usability_review_status` | yes | `passed` | Unreadable or contextless rows do not count. |

## Case Records

| case_id | screenshot_type | storage_ref | redaction_ref | sha256 | dimensions | expected_diagnosis_ref | acceptable_uncertainty_ref | must_handoff | count_for_f02 |
|---|---|---|---|---|---|---|---|---|---|
| vision-case-001 | order_page | `storage://owner-local/m3-20/vision/photo-001` | `redaction://m3-20/test-fixture/photo-001` | `63c906a726a2ded42035567f614818e92202ac62a8de1a39c780f62702b70bcf` | 720x1280 | `controlled://vision/expected/m3-20/payment-entry` | `controlled://vision/uncertainty/m3-20/clarify-if-button-not-visible` | false | true |
| vision-case-002 | payment_page | `storage://owner-local/m3-20/vision/photo-002` | `redaction://m3-20/test-fixture/photo-002` | `da03c5941f781f33669a1419415545edc99077ca4a6c570341543cb74de7c330` | 720x1280 | `controlled://vision/expected/m3-20/payment-action` | `controlled://vision/uncertainty/m3-20/handoff-if-payment-state-unclear` | false | true |
| vision-case-003 | order_page | `storage://owner-local/m3-20/vision/photo-003` | `redaction://m3-20/test-fixture/photo-003` | `0a6d27543cb3d38a2fc68d8e5ebcb0cfaeb5049f327a23d8169067b4acaa7048` | 720x1280 | `controlled://vision/expected/m3-20/receiving-address-required` | `controlled://vision/uncertainty/m3-20/handoff-if-address-ownership-unclear` | false | true |
| vision-case-004 | order_page | `storage://owner-local/m3-20/vision/photo-004` | `redaction://m3-20/test-fixture/photo-004` | `15ca1c0cdba4286b7be1bf89fd3a11b808db731444ef78c90e79f5029e619d8b` | 720x1280 | `controlled://vision/expected/m3-20/address-or-pickup-point-add` | `controlled://vision/uncertainty/m3-20/clarify-address-mode` | false | true |
| vision-case-005 | order_page | `storage://owner-local/m3-20/vision/photo-005` | `redaction://m3-20/test-fixture/photo-005` | `115d009c8c593891559b5bedc37b0fc8559271189d5e057505b988fd8b153c8f` | 720x1280 | `controlled://vision/expected/m3-20/select-saved-address-or-point` | `controlled://vision/uncertainty/m3-20/clarify-if-no-saved-option` | false | true |
| vision-case-006 | order_page | `storage://owner-local/m3-20/vision/photo-006` | `redaction://m3-20/test-fixture/photo-006` | `3c8b83602329f8678e1986586d4b7d58bb3efaeda191ff66ba665114e066e8fe` | 720x1280 | `controlled://vision/expected/m3-20/delivery-method-select` | `controlled://vision/uncertainty/m3-20/handoff-if-delivery-method-eligibility-unclear` | false | true |
| vision-case-007 | payment_page | `storage://owner-local/m3-20/vision/photo-007` | `redaction://m3-20/test-fixture/photo-007` | `3966220b14947dc3fa281d7b646a4aaeb524402fb962163c093ce0a24e8a2362` | 720x1280 | `controlled://vision/expected/m3-20/payment-method-select` | `controlled://vision/uncertainty/m3-20/handoff-if-currency-or-balance-unclear` | false | true |
| vision-case-008 | payment_page | `storage://owner-local/m3-20/vision/photo-008` | `redaction://m3-20/test-fixture/photo-008` | `a551b213a2b2c9110bf457b294fd5ffbf573f04f2c6d4c2f0cbeccee559d4dca` | 720x1280 | `controlled://vision/expected/m3-20/receipt-upload-submit` | `controlled://vision/uncertainty/m3-20/handoff-if-payment-proof-or-id-verification-requested` | true | true |
| vision-case-009 | order_page | `storage://owner-local/m3-20/vision/photo-009` | `redaction://m3-20/test-fixture/photo-009` | `88021637e4c1793f2daa7b740dfa2de4a9526f1ecd0ebd0c84ce008ea3f67036` | 720x1280 | `controlled://vision/expected/m3-20/payment-complete-waiting-state` | `controlled://vision/uncertainty/m3-20/handoff-if-actual-payment-confirmation-requested` | false | true |
| vision-case-010 | merchant_chat | `storage://owner-local/m3-20/vision/photo-010` | `redaction://m3-20/test-fixture/photo-010` | `0edcdb404ae13b89e4da65bf288ad2c9e614bae65e802f0ba4149efa505ba032` | 720x1280 | `controlled://vision/expected/m3-20/bot-goods-entry` | `controlled://vision/uncertainty/m3-20/clarify-if-entry-button-missing` | false | true |
| vision-case-011 | order_page | `storage://owner-local/m3-20/vision/photo-011` | `redaction://m3-20/test-fixture/photo-011` | `32da56fa92d72ac1ac885e18af499e3311e7a5f08d454d989e1a5806a6c2da32` | 720x1280 | `controlled://vision/expected/m3-20/phone-login-entry` | `controlled://vision/uncertainty/m3-20/handoff-if-credential-code-or-identity-verification` | true | true |
| vision-case-012 | order_page | `storage://owner-local/m3-20/vision/photo-012` | `redaction://m3-20/test-fixture/photo-012` | `989b2323dc611afcfddbf0ff7ca56746025c7793ef4a8fa9562b1a8dab1a8df4` | 720x1280 | `controlled://vision/expected/m3-20/verification-code-entry` | `controlled://vision/uncertainty/m3-20/handoff-if-otp-or-account-security-requested` | true | true |
| vision-case-013 | order_page | `storage://owner-local/m3-20/vision/photo-013` | `redaction://m3-20/test-fixture/photo-013` | `343631408ba962f5959e385ec143279f6f903da5a48e79abf1ca62fe9343f315` | 720x1280 | `controlled://vision/expected/m3-20/home-ready-state` | `controlled://vision/uncertainty/m3-20/clarify-if-no-user-problem` | false | true |
| vision-case-014 | order_page | `storage://owner-local/m3-20/vision/photo-014` | `redaction://m3-20/test-fixture/photo-014` | `14fea883272834625f07545df6abfd335fe143833fb74bd09f8cf38476be5bf9` | 750x1624 | `controlled://vision/expected/m3-20/external-profile-address-entry` | `controlled://vision/uncertainty/m3-20/clarify-if-platform-context-missing` | false | true |
| vision-case-015 | order_page | `storage://owner-local/m3-20/vision/photo-015` | `redaction://m3-20/test-fixture/photo-015` | `7f83dd2a1cf71d37ec9dddec7f82c112df9312d2d58eb54c6dd67a3ad31d1590` | 750x1624 | `controlled://vision/expected/m3-20/external-address-list-add` | `controlled://vision/uncertainty/m3-20/handoff-if-address-validity-is-asked` | false | true |
| vision-case-016 | order_page | `storage://owner-local/m3-20/vision/photo-016` | `redaction://m3-20/test-fixture/photo-016` | `fb1569abdd11d54592675c80cd40b0e7aafe5e33b11f592e65a4543b39c45e0e` | 640x1280 | `controlled://vision/expected/m3-20/external-profile-settings-entry` | `controlled://vision/uncertainty/m3-20/clarify-if-platform-context-missing` | false | true |
| vision-case-017 | order_page | `storage://owner-local/m3-20/vision/photo-017` | `redaction://m3-20/test-fixture/photo-017` | `fade5e9febbef518fc92278fa96b0b24f765abace88cda998043fb7bde4f3ed4` | 640x1280 | `controlled://vision/expected/m3-20/external-settings-address-entry` | `controlled://vision/uncertainty/m3-20/clarify-if-settings-page-differs` | false | true |
| vision-case-018 | order_page | `storage://owner-local/m3-20/vision/photo-018` | `redaction://m3-20/test-fixture/photo-018` | `59ac73c7f21200169a930b00bd890ed942fc53811ae8e8c7f1ee6253b8090ec2` | 640x1280 | `controlled://vision/expected/m3-20/external-address-form-fields` | `controlled://vision/uncertainty/m3-20/handoff-if-exact-address-translation-requested` | false | true |
| vision-case-019 | merchant_chat | `storage://owner-local/m3-20/vision/photo-019` | `redaction://m3-20/test-fixture/photo-019` | `5228341fb47c8f230670aa4effd736c4e8aab92ac0a804b6c44b35c98573ef15` | 640x1280 | `controlled://vision/expected/m3-20/bot-address-copy-template` | `controlled://vision/uncertainty/m3-20/handoff-if-address-id-correctness-requested` | false | true |
| vision-case-020 | order_page | `storage://owner-local/m3-20/vision/photo-020` | `redaction://m3-20/test-fixture/photo-020` | `ae74f03939d69c9a53e89d1fc35f78384304b183fb413da1cc3c8cfdd76ed274` | 640x1280 | `controlled://vision/expected/m3-20/paste-permission-dialog` | `controlled://vision/uncertainty/m3-20/clarify-if-permission-denied` | false | true |
| vision-case-021 | order_page | `storage://owner-local/m3-20/vision/photo-021` | `redaction://m3-20/test-fixture/photo-021` | `cdde6a9e4e8ec13e7f2acd4c1a5a3f85ef9479570a8c36395d0f2d6d17edb064` | 640x1280 | `controlled://vision/expected/m3-20/address-form-filled` | `controlled://vision/uncertainty/m3-20/handoff-if-exact-address-validity-requested` | false | true |
| vision-case-022 | order_page | `storage://owner-local/m3-20/vision/photo-022` | `redaction://m3-20/test-fixture/photo-022` | `b02576a1bd3bfbf55cabdd16788f9dd2d1ab1f5e54c9f0fddb781efd2bffe6e0` | 640x1280 | `controlled://vision/expected/m3-20/standard-address-format` | `controlled://vision/uncertainty/m3-20/handoff-if-post-code-or-id-accuracy-requested` | false | true |
| vision-case-023 | order_page | `storage://owner-local/m3-20/vision/photo-023` | `redaction://m3-20/test-fixture/photo-023` | `665948951b6d9cb36b7a9cca2aafc7182845b7fd3a61a4e52bfacf9bb77e6378` | 640x1280 | `controlled://vision/expected/m3-20/address-list-format-confirmation` | `controlled://vision/uncertainty/m3-20/handoff-if-actual-delivery-risk-requested` | false | true |
| vision-case-024 | merchant_chat | `storage://owner-local/m3-20/vision/photo-024` | `redaction://m3-20/test-fixture/photo-024` | `1999063d049e500b931f9f98ede754a0eac3f23e531e75d82c6ed39ff409c8b3` | 720x1600 | `controlled://vision/expected/m3-20/android-bot-goods-entry` | `controlled://vision/uncertainty/m3-20/clarify-if-keyboard-differs` | false | true |
| vision-case-025 | order_page | `storage://owner-local/m3-20/vision/photo-025` | `redaction://m3-20/test-fixture/photo-025` | `6833ff24e1cb8457316dd8af4fe817703d2c676260c9267d0699a9548d767e76` | 720x1600 | `controlled://vision/expected/m3-20/android-profile-entry` | `controlled://vision/uncertainty/m3-20/clarify-if-tab-not-visible` | false | true |
| vision-case-026 | order_page | `storage://owner-local/m3-20/vision/photo-026` | `redaction://m3-20/test-fixture/photo-026` | `f945ac7612159397d72e886c9750d47b97a20c833044a425f0dac168f2016ef7` | 720x1600 | `controlled://vision/expected/m3-20/android-phone-login-empty` | `controlled://vision/uncertainty/m3-20/handoff-if-account-security-requested` | false | true |

## Review Summary

| Review item | Result |
|---|---|
| file count | pass: 26 JPG files |
| usable count | pass: 26 counted cases |
| owner confirmation | pass: owner confirmed visible identifier values are test fixtures |
| repository redaction boundary | pass: raw image bytes, OCR text and visible values are not committed |
| UI context | pass: every counted case includes enough surrounding UI to classify the task |
| category mapping | pass: mapped to M3-06 screenshot kinds `order_page`, `payment_page`, `merchant_chat` |
| uncertainty/handoff flags | pass: all 26 rows have an uncertainty ref and must-handoff flag; sensitive/credential/payment-proof verification paths require handoff |

## Acceptance Gate

This manifest supports the M3 test-stage F-02 screenshot blocker because all of the following are true:

- at least 20 rows count for F-02;
- each counted row has `case_id`, `screenshot_type`, `storage_ref`, `redaction_ref`, user question ref, expected diagnosis ref, acceptable uncertainty ref and `must_handoff`;
- owner confirmation is recorded for the full batch;
- AI agent redaction/test-fixture and usability review passed for every counted row;
- no raw screenshot, raw OCR text, raw customer/test identifier value, public URL, local file path, data URL or base64 content is committed;
- `docs/evidence/M3/vision/eval-run-report.md` records the test-stage visual eval result and treats sensitive or low-confidence strong answers as failures.

Production provider/e2e remains future-gated.

## Rejection Rules

A future case must not count if any of these are true:

- it is not owner-confirmed as either redacted or test-fixture material;
- raw image, OCR text or visible identifier values would need to be committed to git;
- screenshot is pure mock rather than real or real-flow recreation;
- UI context is too narrow for diagnosis and the limitation is not intentionally marked;
- expected diagnosis, acceptable uncertainty answer or must-handoff flag is missing;
- the eval would strongly answer a low-confidence, credential-like, payment-proof verification or exact-address-validation request.

## Owner Handoff Checklist

Before production screenshot materials are released, owner still needs to provide or approve:

- production-ready redacted screenshot pack or equivalent controlled storage policy;
- final official tutorial screenshots if these test fixtures are replaced before launch;
- storage access scope and retention period;
- any intentionally low-quality or low-clarity examples;
- provider/e2e eval execution if production screenshot diagnostics are enabled.
