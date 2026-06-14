# OpenAI Policy Review For ADR-003

> evidence_id: M0-04-openai-policy-review
> date: 2026-06-14
> spec: `docs/specs/M0-04-llm-data-processing-adr.md`
> adr: `docs/adr/ADR-003-llm-data-processing.md`
> status: policy_evidence_collected__blocked_pending_owner_signoff
> secret_policy: no secret, real customer data, or production payload included

## Scope

This report records official OpenAI policy evidence for the current UZMAX primary provider candidate. It does not approve real customer traffic and does not replace project owner signoff.

## Sources Checked

| Source | Checked on | Finding used by ADR-003 |
|---|---|---|
| OpenAI API data controls: https://developers.openai.com/api/docs/guides/your-data | 2026-06-14 | API data may be stored as abuse monitoring logs or application state; standard abuse monitoring may contain prompts/responses and is retained up to 30 days; MAM/ZDR require OpenAI approval; data residency is project-level and non-US regions require additional controls. |
| OpenAI API storage requirements table: https://developers.openai.com/api/docs/guides/your-data#storage-requirements-and-retention-controls-per-endpoint | 2026-06-14 | Intended endpoints show `Data used for training` = `No`; `/v1/chat/completions` and `/v1/responses` are ZDR eligible with limitations; `/v1/responses` default/store=true has 30-day application state. |
| OpenAI API data residency controls: https://developers.openai.com/api/docs/guides/your-data#data-residency-controls | 2026-06-14 | Data residency must be configured per project; regional storage does not always imply regional processing; non-US regions require MAM/ZDR and ZDR amendment. |
| OpenAI data sharing help article: https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai | 2026-06-14 | API inputs/outputs sharing and eval/fine-tuning sharing are disabled by default and require organization owner opt-in. |
| OpenAI API Platform admin/audit logs: https://help.openai.com/en/articles/9687866-admin-and-audit-logs-api-for-the-api-platform | 2026-06-14 | Audit logs are admin/configuration metadata, separate from API request/response customer content; ZDR does not change audit log behavior. |

## Provider Decision Status

| Item | Status | Evidence / reason |
|---|---|---|
| OpenAI key storage | accepted_key_storage | Existing manifest records key `Uzmax` saved to ignored `.env.local`; no secret is committed. |
| OpenAI API for dev/test | allowed_for_dev_only | Key exists and `/v1/models` was previously validated; policy evidence is sufficient for synthetic and redacted development samples. |
| Real customer text | blocked_pending_owner_signoff_and_redaction | Standard abuse monitoring may retain prompts/responses up to 30 days; no MAM/ZDR approval evidence exists. |
| Real screenshots | blocked_pending_owner_signoff_and_image_redaction | Image/file inputs may be retained for manual review if CSAM classifiers flag them, even under MAM/ZDR. |
| Real voice/transcripts | blocked_pending_owner_signoff_and_redaction | Speech pipeline must avoid raw voice/transcript persistence in LLM traces and must redact before LLM post-processing. |
| Regional processing | blocked_if_owner_requires_region | Current Personal / Default project has no recorded data residency configuration. |
| Fallback provider | disabled | No fallback provider has equal-or-stronger retention, region, logging, redaction, or cost evidence. |

## Redaction And Trace Fixtures

Synthetic fixture only, not real customer data:

```text
input.customer_message:
  Salam, men +000 00 000 00 00 raqamiman. Order DEMO-ORDER-0000 qayerda?

redacted.prompt_segment:
  Salam, men [PHONE_HASH:tenant_hmac:9f2a] raqamiman.
  Order [ORDER_REF_HASH:tenant_hmac:7b1c] qayerda?

trace.allowed_metadata:
  traceId=synthetic-trace-001
  task=intent_classify
  redactionPolicy=llm-redaction-v0
  redactionEvents=phone:1, order_ref:1
  segmentHash=sha256:synthetic-prefix
  rawPromptStored=false
  rawCompletionStored=false
```

Required implementation behavior:

- PII and internal-sensitive redaction must run before provider calls.
- Raw prompt, raw completion, screenshots, and original transcripts must not be stored in `llm_call_log`.
- Trace may store type counts, hash prefixes, token counts, model, cost, latency, route version, fallback decision, redline/eval gate result, and truncation events.
- A provider failure must fall back to handoff/leave-ticket unless the configured fallback provider has equal-or-stronger policy evidence.

## Signoff Status

| Role | Status | Notes |
|---|---|---|
| Project owner | pending_data_policy_signoff | Must choose ZDR/MAM pursuit, standard retention acceptance with strong redaction, or no third-party customer LLM. |
| AI agent | evidence_collected | Official OpenAI evidence and UZMAX ADR policy were recorded without secrets or customer data. |
| Implementation | pending | `packages/llm-gateway` redaction, trace, provider status check, fallback policy and tests are not implemented in this docs PR. |

## Commands / Validation Results

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed workspace dependencies; audit reported 0 vulnerabilities. |
| `npm run format:check` | pass | Prettier check passed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M0-04-llm-data-processing-adr.md --include-worktree` | pass | 5 changed docs files, 0 source files. |
| `git diff --check` | pass | No whitespace errors after header cleanup. |
| `npm run check` | pass | Full repo validation passed. The `guard:pr-shape` step inside `npm run check` skipped PR-only checks because no PR existed yet; the targeted spec/base shape check above covered this docs diff. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M0-04-llm-data-processing-adr.md` | pass | Post-commit committed-diff shape check passed with 5 docs files, 0 source files. |
| `git diff --check origin/main...HEAD` | pass | Post-commit committed-diff whitespace check passed after the evidence header cleanup. |
