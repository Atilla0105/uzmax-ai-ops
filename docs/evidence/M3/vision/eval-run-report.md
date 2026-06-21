# M3 Vision Screenshot Eval Run Report

> evidence_id: M3-vision-screenshot-eval-run-report
> milestone: M3
> acceptance_items: F-02 / G-06 / J-05
> status: not_run_owner_samples_pending_not_closed
> created_at: 2026-06-22
> current_eval_result: none
> source_manifest: `docs/evidence/M3/vision/screenshot-cases-manifest.md`
> sensitive_data_location: future screenshot files and raw questions must remain in owner-controlled storage
> redaction_status: no raw screenshots, raw OCR text, customer plaintext, raw model output, prompt/completion, order IDs, phone numbers, addresses, payment data, logistics numbers, support personal accounts or secrets included

## Purpose

This report is the future evidence destination for F-02 screenshot diagnostic eval results. It exists now to make the remaining gate explicit and auditable.

This report does not contain a passing eval. The eval has not run because the screenshot manifest currently has 0 usable owner-confirmed samples.

## Gate Source

| Source | Requirement |
|---|---|
| `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` F-02 | Screenshot diagnostics must not strongly answer uncertain screenshots; low confidence must hand off. |
| `UZMAX智能运营系统-技术架构-v1.1.md` 7.1 | Full eval quota includes 20 screenshot diagnostics; low-confidence strong answer is a hard failure. |
| `docs/preflight/01-owner-inputs-checklist.md` | Screenshot cases require at least 20 usable samples with expected diagnosis, acceptable uncertainty answer and must-handoff flag. |
| `docs/evidence/M3/M3-06-vision-screenshot-diagnostics-foundation.md` | M3-06 is foundation-only; real eval evidence remains an active blocker. |

## Current Input Readiness

| Input | Status | Evidence |
|---|---|---|
| screenshot case manifest exists | ready_as_shell | `docs/evidence/M3/vision/screenshot-cases-manifest.md` |
| usable screenshot cases | blocked | current count 0; required >=20 |
| owner confirmation | blocked | no owner-confirmed screenshot rows yet |
| redaction review | blocked | no rows available to review |
| eval execution | not_run | no valid input set yet |
| F-02 closeout | blocked | no sample set and no eval result |

## Eval Run Summary

No eval run is recorded.

| Run id | Run date | Case count | Pass count | Fail count | Blocked count | Result |
|---|---|---:|---:|---:|---:|---|
| none | none | 0 | 0 | 0 | 0 | not_run_owner_samples_pending |

## Future Result Schema

Future eval rows must avoid raw screenshot content and raw customer text. Use controlled refs only.

| Field | Required | Notes |
|---|---|---|
| `run_id` | yes | Stable eval run id. |
| `case_id` | yes | Must match `screenshot-cases-manifest.md`. |
| `screenshot_type` | yes | Same controlled label as manifest. |
| `input_refs` | yes | Storage, manifest and redaction refs only. |
| `expected_diagnosis_ref` | yes | Controlled expected-outcome ref. |
| `acceptable_uncertainty_ref` | yes | Controlled uncertainty ref. |
| `must_handoff` | yes | Copied from manifest. |
| `model_result_ref` | yes | Controlled result ref; no raw completion in repo. |
| `diagnosis_status` | yes | `diagnosis_card`, `uncertain`, `handoff_required` or `blocked`. |
| `evaluation_result` | yes | `pass`, `fail` or `blocked`. |
| `failure_reason` | required on fail | Low-confidence strong answer must be marked as failure. |

## Failure Semantics

F-02 must stay blocked if:

- fewer than 20 usable samples are present;
- any counted sample lacks expected diagnosis, acceptable uncertainty answer or must-handoff flag;
- raw or unredacted screenshot/customer data would enter git;
- low-confidence, unsupported, ambiguous or unsafe screenshot paths produce a strong customer-facing answer;
- failures are averaged away instead of recorded per case.

## Current Decision

Current decision: `no_go__not_run_owner_samples_pending`.

This report is ready for future evidence collection only. It is not proof of screenshot diagnostic quality, M3 closeout or production readiness.
