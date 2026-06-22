# M3 Vision Screenshot Cases Manifest

> evidence_id: M3-vision-screenshot-cases-manifest
> milestone: M3
> acceptance_items: F-02 / G-06 / J-05
> status: intake_ready_owner_samples_pending_not_closed
> created_at: 2026-06-22
> required_minimum_usable_cases: 20
> current_usable_case_count: 0
> source_material_location: owner-controlled storage only; no screenshot files in repository
> redaction_status: no raw screenshots, OCR text, customer plaintext, Telegram payloads, order IDs, phone numbers, addresses, payment data, logistics numbers, support personal accounts or secrets included

## Purpose

This manifest is the controlled intake format for the F-02 screenshot diagnostic sample blocker. It exists so screenshot samples can be reviewed without committing raw images or customer identifiers to git.

This manifest does not prove F-02. F-02 remains blocked until at least 20 usable owner-confirmed samples exist, the samples pass redaction/usability review, and a future eval run is recorded in `docs/evidence/M3/vision/eval-run-report.md`.

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

- redact avatar, nickname, phone, address, order number, payment code and logistics number;
- keep enough UI context for diagnosis;
- pure mock screenshots cannot satisfy the gate;
- low-clarity examples must state whether the low clarity is intentional.

## Current Manifest State

| Metric | Current value | Required for F-02 closeout |
|---|---:|---:|
| usable cases | 0 | >=20 |
| owner-confirmed cases | 0 | >=20 |
| redaction-reviewed cases | 0 | >=20 |
| cases with expected diagnosis | 0 | >=20 |
| cases with acceptable uncertainty answer | 0 | >=20 |
| cases with must-handoff flag | 0 | >=20 |

Current status: `blocked_until_owner_screenshot_samples`.

## Case Record Schema

Future rows must use this schema. Do not paste raw image content, OCR output, customer message text or public image URLs into this file.

| Field | Required | Allowed value / format | Notes |
|---|---|---|---|
| `case_id` | yes | stable id, for example `vision-case-001` | Must match any future eval result row. |
| `screenshot_type` | yes | controlled label | Example labels may include account screen, order/prealert screen, payment screen, delivery screen, error screen or route/pricing screen. |
| `storage_ref` | yes | controlled storage ref | Do not use local file paths, public URLs, data URLs, base64 or pasted image data. |
| `redaction_ref` | yes | controlled redaction/audit ref | Must show sensitive identifiers were masked before review. |
| `user_question_ref` | yes | controlled text ref | Store raw question outside git; repo may record only a safe ref. |
| `expected_diagnosis_ref` | yes | controlled expected-outcome ref | Future eval compares against this ref, not raw private text. |
| `acceptable_uncertainty_ref` | yes | controlled expected-uncertainty ref | Required because F-02 fails when low-confidence screenshots are strongly answered. |
| `must_handoff` | yes | `true` or `false` | Required for uncertainty-to-handoff evaluation. |
| `owner_confirmation_status` | yes | `pending`, `confirmed`, `rejected` | Only owner-confirmed samples count. |
| `agent_redaction_review_status` | yes | `pending`, `passed`, `failed` | Failed rows do not count. |
| `agent_usability_review_status` | yes | `pending`, `passed`, `failed` | Unreadable or contextless rows do not count. |
| `quality_notes_ref` | no | controlled note ref | Required for intentional low-clarity cases. |

## Case Records

No screenshot case records are present in the repository as of 2026-06-22.

| case_id | screenshot_type | storage_ref | redaction_ref | owner_confirmation_status | agent_redaction_review_status | agent_usability_review_status | count_for_f02 |
|---|---|---|---|---|---|---|---|
| none | none | none | none | pending_owner_input | pending_owner_input | pending_owner_input | false |

## Acceptance Gate

This manifest can support F-02 only when all of the following are true:

- at least 20 rows count for F-02;
- each counted row has `case_id`, `screenshot_type`, `storage_ref`, `redaction_ref`, user question ref, expected diagnosis ref, acceptable uncertainty ref and `must_handoff`;
- owner confirmation is `confirmed` for every counted row;
- AI agent redaction and usability review are `passed` for every counted row;
- no raw screenshot, raw OCR text, raw customer content, public URL, local file path, data URL or base64 content is committed;
- the future eval run report records actual results and keeps low-confidence strong answers as failures.

## Rejection Rules

A case must not count if any of these are true:

- unredacted avatar, nickname, phone, address, order number, payment code, logistics number, support personal account or secret remains visible;
- screenshot is pure mock rather than real or real-flow recreation;
- UI context is too narrow for diagnosis and the limitation is not intentionally marked;
- expected diagnosis, acceptable uncertainty answer or must-handoff flag is missing;
- raw image or raw customer text would need to be committed to git to review it.

## Owner Handoff Checklist

Before future eval work starts, owner needs to provide controlled refs for:

- at least 20 redacted `png`/`jpg` samples;
- one metadata row per sample using the schema above;
- reviewer/owner confirmation date;
- storage access scope and retention period;
- any intentionally low-quality or low-clarity examples.

Current owner-input status: `pending`.
