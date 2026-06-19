# M3-05 Pricing Capability And Quote Record Contract Evidence

Status: `foundation-only`.

This evidence records the M3-05 pricing capability and quote record contract foundation. It does not approve production, GA-0, real customer traffic, customer LLM, provider route release, engine/API/admin/worker integration, DB persistence, M3 closeout, F-04 full closure or 1.0 release approval.

## Scope

- Implemented a pure `packages/capabilities/pricing` contract for deterministic code-created quote calculation.
- Allowed LLM parameter candidates only as structured parameters; any LLM-supplied price math or `source: "llm"` fails closed.
- Produced an M3-01 compatible `quote_record` draft shape with `source: "code"`, `status: "created"`, `inputRef`, `result`, `currency`, `totalMinorUnits`, `validUntil` and config provenance.
- Preserved integer minor unit money handling and fail-closed validation for unsafe money, missing currency, missing config provenance, unknown lane and unknown service.
- Rejected internal cost/profit/margin/threshold fields from pricing config/result surfaces.

## Not Included

- No DB schema, migration, generated DTO or persistence change.
- No engine, API, admin, worker, outbound send, customer asset center, order connector, real pricing API or E2E quote flow.
- No LLM/provider call, provider SDK, key, env var, route release, prompt/model/persona release or customer LLM.
- No raw samples, customer plaintext, Telegram payloads, screenshots, voice transcripts, order IDs, phone/address/payment data, raw prompt/completion or secrets.
- No production, GA-0, real customer traffic, M3 closeout, F-04 full closure or 1.0 release approval.

## Validation Evidence

| Command | Result |
|---|---|
| `node --test scripts/tests/m3-pricing-capability-and-quote-record-contract.test.mjs` before docs/evidence completion | RED: 5/6 passed; failed because contracts/evidence docs did not yet record M3-05 |
| `node --test scripts/tests/m3-pricing-capability-and-quote-record-contract.test.mjs` | PASS: 8/8 tests passed |
| `npm run format:check` | PASS: all matched files use Prettier style |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run depcruise` | PASS: no dependency violations found |
| `npm run jscpd` | PASS: no duplicates found |
| `npm run knip` | PASS |
| `npm run guard:forbidden-terms` | PASS: forbidden-terms ok |
| `npm run guard:doc-triggers` | PASS: doc-trigger-paths ok |
| `npm run guard:workspace` | PASS: linked worktree, dirty allowed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-05-pricing-capability-and-quote-record-contract.md --include-worktree` | PASS: 6 changed files; docs 4, source 1, test 1 |
| `git diff --check` | PASS |
| `npm run check` | PASS: format, typecheck, lint, depcruise, jscpd, knip, guards, 103 node tests, build, size-limit and 6 Playwright tests passed |

## Acceptance Mapping

| Item | M3-05 status | Notes |
|---|---|---|
| F-04 | foundation_implemented_not_closed | Code-only deterministic quote calculation and M3-01 compatible quote record draft exist for synthetic controlled fixtures. DB persistence, E2E and production quote flow remain future. |
| F-05 | foundation_supported_not_closed | Pricing output rejects internal cost/profit/margin/threshold fields; broader redline output guard remains future integration. |
| D-04 | foundation_queued_not_closed | Quote record draft shape can support future customer asset quote history; no customer asset center integration. |
| J-05 | foundation_updated | This evidence records M3-05 pricing foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at takeover audit. |

M3-05 closes no production acceptance item. It only provides pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Review Notes

- Spec compliance review: allowed touch list only; source remains `packages/capabilities/pricing/src/index.ts`.
- Code quality review: pricing package remains pure TypeScript, with no DB runtime import, no LLM/provider call, no process env, no outbound send and no sibling capability import.
- Incident: none created by this spec.
