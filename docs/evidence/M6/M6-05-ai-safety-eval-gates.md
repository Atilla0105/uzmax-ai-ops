# M6-05 AI Safety Eval Gates Evidence

Spec: `docs/specs/M6-05-ai-safety-eval-gates.md`
Tracking issue: Linear LAY-10
Status: `m6_ai_safety_eval_gates_recorded_f_g_l02_supported_not_ga0`
Recorded: 2026-06-26

## Boundary

This evidence records repo-level release support for AI safety, eval gates, model-all-down and AI fuse drills. It does not approve GA-0, production deployment, real customer/order data, customer LLM, real provider calls, production prompt/knowledge/model/persona release, external SaaS onboarding or 1.0 release.

ADR-003 remains `accepted_dev_only__customer_llm_blocked`: real customer messages, screenshots, voice transcripts and customer profiles must not enter third-party LLM providers.

No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets are stored here.

## Source Manifest

| Area | Source |
|---|---|
| Acceptance matrix | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| Technical architecture | `UZMAX智能运营系统-技术架构-v1.1.md` |
| LLM data boundary | `docs/adr/ADR-003-llm-data-processing.md`; `docs/evidence/M0/llm-data-processing/README.md` |
| LLM route/model-all-down support | `packages/llm-gateway/src/index.ts`; `scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs` |
| Eval-gate support | `packages/evals/src/index.ts`; `scripts/tests/m3-eval-gate-redline-runner.test.mjs` |
| Order no-fabrication eval | `packages/evals/src/m4-order-read-no-fabrication.ts`; `scripts/tests/m4-order-read-no-fabrication-eval-contract.test.mjs`; `scripts/tests/m4-order-read-runtime-eval-gate.test.mjs` |
| Redline/fuse support | `packages/engine/src/index.ts`; `scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs` |
| AI member emergency/recovery support | `apps/api/src/ai-member-runtime.ts`; `scripts/tests/m5r-ai-member-runtime-control.test.mjs`; `docs/evidence/M5R/M5R-04-ai-member-runtime-control.md` |
| M3 evidence | `docs/evidence/M3/M3-03-eval-gate-redline-runner.md`; `docs/evidence/M3/M3-08-breaker-radius-and-redline-output-guard.md`; `docs/evidence/M3/README.md` |
| M6 runbook | `docs/runbooks/ai-safety-fuse.md` |

## Acceptance Matrix Mapping

| Item | Current M6-05 release status | Evidence |
|---|---|---|
| F-01 Tutorial behavior | `prior_m3_support_final_rollup_pending` | M3 KB/tutorial evidence exists; M6-05 only records inclusion in release AI safety rollup. |
| F-02 Screenshot uncertainty | `prior_m3_support_final_rollup_pending` | M3-20 screenshot test-fixture evidence exists; production provider/e2e remains future-gated. |
| F-03 Speech flow | `prior_m3_support_final_rollup_pending` | M3-07 speech foundation exists; real/integration voice evidence remains future-gated. |
| F-04 Pricing safety | `prior_m3_support_final_rollup_pending` | M3-05 pricing foundation keeps code-owned quote calculation; end-to-end quote release evidence remains final-rollup scope. |
| F-05 Redline/context safety | `supported_by_adr003_eval_redline_output_guard_not_customer_llm` | ADR-003 blocks real customer LLM; M3-03 detects internal config/economics leakage; M3-08 suppresses unsafe output without echoing it; LLM gateway rejects customer-visible calls without redaction metadata. |
| F-06 Fuse radius | `supported_by_engine_radius_and_ai_member_control_not_ga_fault_injection_closed` | M3-08 proves user/capability/global radius; M5R-04 proves emergency stop/recovery/toggle contracts. Real GA Bot leave-ticket drill remains M6-06/M6-09 scope. |
| G-01 Routing/fallback | `supported_by_mock_model_all_down_drill_not_real_provider` | M3-02 LLM gateway tests cover primary fallback, timeout and all-provider-failed accounting. No real provider is added. |
| G-02 Accounting | `supported_by_accounting_draft_not_production_log_closed` | M3-02 records model, route, status, tokens, cost, latency and trace in accounting drafts; production `llm_call_log` rollup remains final release scope. |
| G-03 Eval gate non-bypass | `supported_by_eval_gate_publish_refusal_and_ai_member_gate_checks` | M3-03 refuses prompt/knowledge/model_route/persona publish unless matching eval gate passes; M5R-04 requires passed eval gates for capability enabling. No production publish API is added. |
| G-04 Language blind review | `risk_item_owner_blind_review_pending_strong_model_lock_active` | M3-21 records strong-model lock / route freeze; production Uzbek Latin/Cyrillic/Russian blind review remains owner input. |
| G-05 Redline false-positive governance | `supported_by_eval_false_positive_contract_not_dashboard_closed` | M3-03/M3-08 allow ordinary synthetic numbers while blocking internal leakage; false-positive dashboard/release visibility remains final-rollup scope. |
| G-06 Eval quota | `seed_quota_supported_full_200_pending_owner_release_rollup` | M1 seed quota checks pass; full 1.0 >=200 candidate set remains release-tracked and not closed here. |
| J-04 Runbook | `supported_for_model_all_down_redline_bad_send_ai_fuse` | `docs/runbooks/ai-safety-fuse.md` covers model-all-down, redline bad send and AI fuse/recovery drills. |
| L-02 GA redline incident path | `synthetic_fuse_and_ticket_contract_supported_bot_leave_ticket_pending` | M3-08 requires suppress outbound and ticket/draft hold; M5R-04 supports AI member runtime emergency/recovery. Real Bot leave-ticket behavior remains M6-06/M6-09. |

## Release Drill Matrix

| Drill | Expected result | Repo evidence |
|---|---|---|
| Model all down | All providers fail without raw prompt/completion exposure; route returns failed accounting, zero cost/tokens and traceable attempted providers; operator opens handoff/ticket path. | `scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs`; `docs/runbooks/ai-safety-fuse.md` |
| Redline bad send | Unsafe output is suppressed, not echoed, and outbound answer is blocked with controlled audit refs only. | `packages/engine/src/index.ts`; `scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs` |
| Eval-gate bypass attempt | Prompt, knowledge, model route and persona publish decisions refuse failed, blocked, pending, stale or mismatched gates. | `packages/evals/src/index.ts`; `scripts/tests/m3-eval-gate-redline-runner.test.mjs` |
| Order answer fabrication attempt | Missing/stale/degraded order data requires handoff; fabricated status refs fail eval. | `packages/evals/src/m4-order-read-no-fabrication.ts`; M4-22/M4-44 tests |
| AI fuse and recovery | Single-user attack stays user-scoped; systemic risk escalates; emergency/recovery/toggle actions require controlled evidence and passed eval gates. | M3-08 engine tests; M5R-04 runtime tests |

## Remaining Risk Items

- G-04 production language blind review remains owner-controlled and not closed by this PR.
- G-06 full 1.0 eval candidate set >= 200 remains pending final release rollup.
- L-02 real Bot leave-ticket path remains pending M6-06/M6-09.
- Production `llm_call_log`, real provider policy branch update and customer LLM remain not approved.
- This evidence does not add a production output filter integration or real fault injection against a deployed service.

## Validation Commands

Focused validation for this PR:

```bash
node --test scripts/tests/m6-ai-safety-eval-gates.test.mjs
```

Supporting release evidence commands:

```bash
node --test scripts/tests/eval-gate.test.mjs
node --test scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs
node --test scripts/tests/m3-eval-gate-redline-runner.test.mjs
node --test scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs
node --test scripts/tests/m4-order-read-no-fabrication-eval-contract.test.mjs
node --test scripts/tests/m4-order-read-runtime-eval-gate.test.mjs
node --test scripts/tests/m5r-ai-member-runtime-control.test.mjs
```
