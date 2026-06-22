# M3-21 Language Safety Lock Review Evidence

> evidence_id: M3-21-language-safety-lock-review
> milestone: M3
> spec: `docs/specs/M3-21-language-safety-lock-review.md`
> status: test_stage_g04_safety_lock_ready_not_production_quality_pass
> created_at: 2026-06-22
> owner_ai_boundary: Project owner allowed test-stage AI use of local FAQ and redacted chat samples. Project owner still decides production blind review, production customer LLM/provider route, costs, compliance, GA-0 and 1.0 release.
> sensitive_data_location: raw selected rows, redacted source text and any future model replies remain outside repository in owner-controlled local storage
> redaction_status: no raw customer plaintext, raw human replies, raw model replies, prompt/completion, route metadata, phone numbers, addresses, order/payment/logistics identifiers, support personal accounts, LLM keys or secrets included

## Scope

Included:

- M3-21 docs-only spec.
- Controlled ID existence/coverage audit over M3-19 selected sample ids.
- Test-stage AI-assisted language safety review summary.
- Strong-model lock / route optimization freeze decision.
- M3 closeout/README rollup sync.

Not included:

- Raw customer text, raw human replies, raw model replies, prompt/completion, provider route metadata, real provider calls, model route release, customer LLM, production owner blind-review pass, GA-0, real customer traffic, M4 start or 1.0 release.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-21-language-safety-lock-review` |
| `git status --short --branch` | `## codex/m3-21-language-safety-lock-review` before edits |
| `git branch --show-current` | `codex/m3-21-language-safety-lock-review` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits |
| open PR audit | `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url,statusCheckRollup,mergeStateStatus` returned `[]` before branch creation |
| no-merged branch audit | `git branch --no-merged main` returned no branch output before branch creation |
| branch creation | linked worktree branch `codex/m3-21-language-safety-lock-review` created from `main` at `75a9ea1` |

## Source Audit

| Source | Current finding | Repository handling |
|---|---|---|
| M3-19 selected sample ids | 80 selected ids, 80 unique, 0 missing in owner-local redacted candidate metadata | IDs are already controlled refs; no raw rows copied. |
| Owner-local candidate metadata | 2443 redacted candidates; residual rescan reported 0 residual phone/url/handle/long-number/identity-doc hits in M3-19 evidence | Repo records aggregate coverage only. |
| Review inputs | Existing redacted questions and human replies remain local; no model replies were generated in this slice | This slice reviews release safety posture, not production model output quality. |

## Coverage Audit

| Test group | Selected ids | Source language/script labels found | Top intent coverage | Redaction metadata summary |
|---|---:|---|---|---|
| Uzbek Latin Proxy | 20 | `uz_latin` 20 | account, inbound, delivery, restricted goods, pricing, timing/customs | 17 rows carried phone/handle placeholders; 5 long-number placeholders; 4 ID placeholders |
| Cyrillic / Russian Proxy | 20 | `ru_or_cyrillic` 20 | other | no placeholder hits in selected metadata |
| Russian Latin Mixed Proxy | 20 | `ru_latin_mixed` 20 | inbound, account, delivery, timing/customs, pricing, billing | 4 tracking/order placeholders; 4 phone placeholders; 4 URL placeholders; 4 long-number placeholders |
| Uzbek / Russian Mixed Proxy | 20 | `uz_ru_mixed` 20 | inbound, account, delivery, restricted goods, billing, pricing | 18 phone/handle placeholders; 6 ID placeholders; 2 long-number placeholders; 2 tracking/order placeholders |

## Test-Stage Review Decision

This is a conservative release-safety review, not a production language-quality pass.

| Decision item | Result | Reason |
|---|---|---|
| selected sample integrity | pass | 80/80 selected ids exist and are unique. |
| repository redaction boundary | pass | Evidence contains no raw input, raw reply or model output. |
| test-stage coverage | pass | Four controlled proxy groups have 20 cases each. |
| production owner blind review | not_passed | Owner scoring has not been performed in this slice. |
| weak/low-quality model release | blocked | No weak model may be used for customer replies until owner blind review permits it. |
| strong-model decision | locked | `strong_model_locked_until_owner_blind_review`. |
| route optimization | frozen | `route_optimization_frozen_until_owner_blind_review`. |

## G-04 Safety Interpretation

G-04 must prevent low-quality Uzbek/Russian output from reaching customers. M3-21 does not prove a model is high quality; instead it prevents unsafe release:

- no low-quality or weak model route is approved;
- production route optimization remains frozen;
- future customer-facing language output must use the strong-model/human-safe path until owner blind review changes the decision;
- any future production blind review failure keeps the strong-model lock in place.

This is acceptable for M3 test-stage closeout because the risk state is fail-closed. It is not a GA-0 or 1.0 release approval.

## Acceptance Mapping

| Item | M3-21 status | Notes |
|---|---|---|
| G-04 | test_stage_safety_lock_ready_not_quality_pass | Low-quality/weak model use is blocked; owner blind review remains future before production route release. |
| G-06 | language_proxy_coverage_ready_not_full_1_0_closed | 80 selected controlled sample ids verified; production labels and full 1.0 >=200 eval set remain future. |
| J-05 | evidence_updated | M3 rollup records the language safety lock. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only; no schema/lock/shared config changes. |

## Remaining Work

- Future production owner blind review with raw rows/model replies kept in controlled storage.
- Future provider/route decision if customer LLM is enabled.
- Future GA-0/1.0 release evidence if language model output becomes customer-facing.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed local worktree dependencies before validation; npm reported existing audit advisories and did not change lockfiles. |
| targeted sensitive-value grep | pass | Checked repository diff/evidence for raw redacted fields, placeholder tokens and long numeric values; matches were limited to controlled sample ids and historical commit/run hashes. No raw question, raw reply, phone/address/order/payment/logistics value, support account, prompt/completion or secret was found. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok` in the linked M3-21 worktree. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m3-21-language-safety-lock-review --root /Users/atilla/Documents/UZMAX智能运营` | pass | Explicit assigned/root boundary check passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-21-language-safety-lock-review.md --include-worktree` | pass | Explicit PR shape reported 6 docs files, source changed files 0, net source LOC 0 and new source files 0. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run check` | pass | Full local gate passed: format, prettier-ignore guard, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/worker-boundary/pr-shape guards, 150/150 Node tests, build, size and Playwright 7/7. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one PR | pass | This branch implements only M3-21 as a docs-only follow-up before PR creation. |
| Touch list | pass | Explicit PR shape validation confirmed the diff is limited to the 6 docs files listed in `docs/specs/M3-21-language-safety-lock-review.md`. |
| Docs + source + test scope | pass | Docs-only language safety-lock evidence updates; source changed files 0, net source LOC 0 and new source files 0. |
| Selected sample integrity | pass | 80 selected ids, 80 unique, 0 missing. |
| Coverage | pass | Four controlled proxy groups have 20 selected cases each. |
| Release honesty | pass | Evidence states test-stage safety lock only; production owner blind review, provider/e2e, model route release, GA-0 and 1.0 remain future-gated. |
| Strong-model lock | pass | `strong_model_locked_until_owner_blind_review` and route optimization freeze are explicit. |
| Test integrity | pass | No test deletion, assertion weakening, `.skip` / `.only` / `xit` / `xfail`, mock expansion or snapshot growth. |
| Sensitive data | pass | Aggregate evidence and controlled refs only; raw rows, raw replies, model replies and personal/secret values remain outside git. |
| External API evidence | pass | none; no new provider/SDK/connector/adapter. |
| Exceptions | pass | none. |
