# M3 Language Blind Review Report

> evidence_id: M3-language-blind-review-report
> milestone: M3
> acceptance_items: G-04 / G-06 / J-05
> status: not_run_blind_review_pending_not_closed
> created_at: 2026-06-22
> required_uzbek_latin_cases: 20
> required_uzbek_cyrillic_cases: 20
> required_russian_cases: 20
> current_uzbek_latin_reviewed_cases: 0
> current_uzbek_cyrillic_reviewed_cases: 0
> current_russian_reviewed_cases: 0
> source_material_location: owner-controlled blind-review table/export only; no raw customer rows or raw model replies in repository
> redaction_status: no raw customer plaintext, raw model replies, prompt/completion, route metadata, phone numbers, addresses, order/payment/logistics identifiers, support personal accounts or secrets included

## Purpose

This report is the controlled evidence destination for G-04 language quality blind review. It exists so owner review can later be summarized without committing raw customer text or raw model replies to git.

This report does not prove G-04. G-04 remains blocked until Uzbek Latin, Uzbek Cyrillic and Russian blind-review evidence exists, low-quality and non-customer-safe samples have reasons, and the strong-model lock decision is recorded.

## Gate Source

| Source | Requirement |
|---|---|
| `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` G-04 | If Uzbek quality blind review fails, low-quality models must not be used for customer replies. |
| `UZMAX智能运营系统-技术架构-v1.1.md` 7.1 | Full eval quotas include 20 Uzbek Latin QA, 20 Uzbek Cyrillic QA and 20 Russian QA. |
| `docs/preflight/01-owner-inputs-checklist.md` | Blind review rows require case-id, input, model reply, score, issue type, customer-safe flag, revision suggestions, reviewer and review date; reviewer must not see inducing model route/prompt details. |

## Current Review Coverage

| Language / script | Reviewed cases | Required cases | Status |
|---|---:|---:|---|
| Uzbek Latin | 0 | 20 | blocked_owner_review_pending |
| Uzbek Cyrillic | 0 | 20 | blocked_owner_review_pending |
| Russian | 0 | 20 | blocked_owner_review_pending |

Current status: `blocked_until_owner_blind_review`.

## Blind Review Isolation

The future blind-review table/export must keep the reviewer blind to model route and prompt-version details except non-inducing administrative ids needed for audit. The repository report may record only controlled refs, aggregate counts, pass/fail conclusion and decision status.

Do not commit:

- raw customer input;
- raw model reply;
- prompt text or raw completion;
- model/provider route that can bias scoring;
- phone, address, order, payment or logistics identifiers;
- support personal accounts or secrets.

## Review Row Schema

Future rows must use this schema in a controlled table/export. The repo report may summarize row ids and aggregate status only.

| Field | Required | Notes |
|---|---|---|
| `case_id` | yes | Stable id; must not reveal customer identity. |
| `language_script` | yes | `uzbek_latin`, `uzbek_cyrillic` or `russian`. |
| `input_ref` | yes | Controlled ref to redacted input; no raw text in repo. |
| `model_reply_ref` | yes | Controlled ref to reply; no raw reply in repo. |
| `score` | yes | Fixed owner rubric; rubric version must be recorded. |
| `issue_type` | required when issue exists | Examples: inaccurate, unsafe, unnatural, incomplete, wrong language/script, redline, hallucination, unclear. |
| `customer_safe` | yes | `true` or `false`. |
| `revision_suggestion_ref` | required when not customer safe | Controlled ref; no raw sensitive content in repo. |
| `reviewer_ref` | yes | Reviewer identity/ref controlled outside git. |
| `review_date` | yes | Date of review. |
| `blind_context_status` | yes | Must confirm route/prompt details were not visible in a scoring-inducing way. |

## Summary Rows

No blind-review rows are present in the repository as of 2026-06-22.

| language_script | reviewed_cases | customer_safe_cases | not_customer_safe_cases | low_quality_reason_rows | strong_model_decision |
|---|---:|---:|---:|---:|---|
| uzbek_latin | 0 | 0 | 0 | 0 | pending_owner_review |
| uzbek_cyrillic | 0 | 0 | 0 | 0 | pending_owner_review |
| russian | 0 | 0 | 0 | 0 | pending_owner_review |

## Strong-Model Decision

Current decision: `pending_owner_blind_review`.

G-04 remains blocked. If future blind review finds low-quality or non-customer-safe Uzbek output, low-quality model use for customer replies must stay locked out and route optimization must remain frozen until a later owner-approved decision changes that state.

## Acceptance Gate

This report can support G-04 only when all of the following are true:

- Uzbek Latin reviewed cases >=20;
- Uzbek Cyrillic reviewed cases >=20;
- Russian reviewed cases >=20;
- every low-quality or non-customer-safe row has issue type and reason;
- reviewer/date and blind-context status are recorded;
- strong-model lock decision is explicit;
- raw customer input and raw model reply remain outside git.

## Current Decision

Current decision: `no_go__blind_review_pending`.

This report is ready for future blind-review evidence collection only. It is not proof of language quality, route safety, M3 closeout or production readiness.
