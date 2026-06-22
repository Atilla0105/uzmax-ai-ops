# SPK-02 Order SaaS API No-API Branch Evidence

> evidence_id: SPK-02-order-saas-api
> milestone: M4
> spec: `docs/specs/SPK-02-order-api.md`
> adr: `docs/adr/ADR-B02-order-api.md`
> status: no_api_for_m4__import_snapshot_main_path
> created_at: 2026-06-22
> updated_at: 2026-06-22
> owner: 项目 owner 在 2026-06-22 提供 SPK-02 input “暂时没有api”；AI agent 负责 docs-only current-branch closure、ADR/evidence 记录、无外部订单 API 调用证明、敏感数据边界和未来重开条件。
> sensitive_data_location: none in repo
> redaction_status: no raw order/customer data, CSV/XLSX exports, screenshots, order IDs, phone numbers, addresses, payment data, customer plaintext, credentials, token values or env files included
> signoff: owner input recorded for current branch only; not production, GA-0, real traffic, customer LLM, M4 closeout or 1.0 release signoff

## Current Decision

SPK-02 closes the current M4 branch on `no_api_for_m4__import_snapshot_main_path`.

Project owner input on 2026-06-22: “暂时没有api”.

This evidence does not claim the order SaaS API is permanently impossible. It records that the current M4 branch has no usable API docs, sandbox credentials or controlled API test evidence. If owner later provides those inputs, SPK-02 must reopen through a new spec, ADR revision or superseding ADR.

## No External Order API Calls

This branch did not call an external order SaaS API, LLM/provider, Telegram, production customer system, order-data connector, CSV/XLSX import path or real customer-data system.

Required governance/tooling actions were not used as order SaaS evidence:

- `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` was run only for required open PR audit.
- `npm ci` was run only because this worker worktree initially had no `node_modules`.
- `npm run guard:worker-boundary` was run only as worker/root boundary evidence.

No API credentials, env files, token values, order IDs, phone/address/payment data, raw payloads, screenshots, CSV/XLSX exports or customer plaintext were read into or committed in this evidence.

## Pre-Edit Worker Boundary Evidence

| Check | Command | Recorded output |
|---|---|---|
| Worker path | `pwd` | `/Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure` |
| Worker status | `git status --short --branch` | `## codex/spk-02-order-api-no-api-closure` |
| Worker branch | `git branch --show-current` | `codex/spk-02-order-api-no-api-closure` |
| Root/main status | `git -C /Users/atilla/Documents/UZMAX智能运营 status --short --branch` | `## main...origin/main` |
| Open PR audit | `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` | `[]` |
| No-merged branch audit | `git branch --no-merged main` | no output before edits |
| Dependency install | `npm ci` | completed after node_modules was missing; npm audit reported 3 high severity vulnerabilities, not introduced by this docs PR |
| Worker boundary | `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | `worker-write-boundary: ok (codex/spk-02-order-api-no-api-closure, /Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure)` |

Runtime/harness prevention is outside this repository guard. This branch used absolute assigned paths and command cwd binding; root/main checkout remained coordination/read-only.

## Evidence Search Scope

| Check | Result | Note |
|---|---|---|
| SPK-02 spec | present before this PR | Existing spec described API spike/failure branches; this PR narrows it to docs-only current no-API closure. |
| ADR-B02 | missing before this PR | `docs/adr/README.md` reserved the filename; this PR creates the ADR. |
| M4 evidence directory | missing before this PR | This PR creates the M4 README and SPK-02 manifest only. |
| SPK-02 incident record | missing before follow-up | This PR records `INC-2026-06-22-spk02-root-main-worktree-pollution` because SPK-02 authoring briefly wrote the same docs changes into root/main before cleanup. |
| Root docs | current | PRD, architecture, backend design and acceptance matrix all support the conditional no-API branch. |
| Order SaaS API docs/sandbox credentials | absent from repo and owner input says no current API | No external API spike was attempted. |

## Branch Mapping

| Item | SPK-02 / ADR-B02 status | Evidence posture |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No current API docs/sandbox credentials; no connector feasibility claim; no fake provider. |
| E-02 | `p0_current_main_path__import_snapshot` | Import snapshot becomes the current order-data main path; implementation/test evidence remains future M4 work. |
| E-03 | `p0_remains__stale_snapshot_warning` | Future order paths must expose source, updated time, expiry and stale warning. |
| E-04 | `p0_remains__no_fabricated_order_status` | AI must hand off on missing, stale or degraded order data; no fabricated logistics/order state. |

## Current Admin/UI Wording

For the no-API branch, future admin order UI wording must be:

```text
订单数据主路径：导入快照
```

Do not call this a temporary API outage. The branch is a current product decision based on no usable API for M4, while still allowing future API reopening.

## Sensitive Data Boundary

This manifest intentionally excludes:

- CSV/XLSX exports or import samples;
- raw order SaaS payloads;
- screenshots;
- order IDs, batch IDs, external IDs or customer identifiers;
- phone numbers, addresses, payment data or customer plaintext;
- API credentials, tokens, env files or account identifiers.

If future SPK-02 work captures any sensitive source material, it must stay in controlled storage. The repo may only receive a manifest that records redaction method, access scope, retention period and project owner confirmation status.

## Boundary Incident Record

Incident: `docs/incidents/INC-2026-06-22-spk02-root-main-worktree-pollution.md`.

Detection:

- During SPK-02 docs-only authoring, the initial relative/path-agnostic `apply_patch` wrote the same five docs changes into root/main `/Users/atilla/Documents/UZMAX智能运营` instead of the assigned worktree.
- Affected root/main paths before cleanup:
  - `docs/specs/SPK-02-order-api.md`
  - `docs/adr/ADR-B02-order-api.md`
  - `docs/adr/README.md`
  - `docs/evidence/M4/README.md`
  - `docs/evidence/M4/spikes/SPK-02-order-saas-api/manifest.md`
- The mismatch was detected because the assigned worktree stayed clean while root/main showed modified/untracked SPK-02 docs paths.

Cleanup:

- No commit, push, PR creation or merge happened from the polluted root/main checkout.
- The same docs changes were migrated to the assigned worktree.
- Root/main was restored to clean: `git -C /Users/atilla/Documents/UZMAX智能运营 status --short --branch` -> `## main...origin/main`.
- The assigned worktree was committed cleanly in `b7f823e48da05683567d4a7f4bfbf2540ca3285a`, then this follow-up records the incident in the same branch.

Sensitive-data boundary:

- No raw order/customer data, CSV/XLSX export, credentials, env, secrets, screenshots, customer identifiers, payment data, LLM/provider call, external API call or production data were introduced by the polluted root/main writes.

Controls for remainder of SPK-02:

- Use absolute assigned paths or `git -C /Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure` for all writes.
- Run assigned/root dual status checks after edits, formatters, archive restores, generated writes and validation residue.
- Continue explicit worker boundary guard. Runtime/harness prevention remains outside the in-repo guard; the repo guard is forensic/detection evidence, not a complete write jail.

## Validation To Record For This PR

| Command | Required result |
|---|---|
| `npm run format:check` | pass |
| `npm run guard:doc-triggers` | pass |
| `npm run guard:workspace` | pass |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | pass |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/SPK-02-order-api.md --include-worktree` | pass |
| `git diff --check origin/main...HEAD` | pass |
| `npm run check` | run if feasible; record exact unrelated external/account/spending failure if it fails |

## Future Reopen Conditions

Reopen order API only through a new spec/PR or ADR revision/superseding ADR that includes:

1. Project owner confirmation of usable order SaaS API documentation, sandbox credentials, controlled test account or explicit API access path.
2. Controlled order/batch/customer lookup identifiers kept outside git.
3. Redacted evidence for authentication, token lifecycle, tenant/shop scope, field mapping, pagination, rate limits, timeout/error model, and data freshness.
4. A comparison source for true order status, such as the SaaS frontend or owner-controlled status evidence.
5. Updated E-01/E-02/E-03/E-04 acceptance mapping.
6. Confirmation that AI still cannot fabricate logistics/order state and must hand off when data is missing, stale or degraded.
7. Sensitive-data handling plan proving raw payloads, CSV/XLSX exports, screenshots, order IDs, phone/address/payment data, customer plaintext and credentials do not enter repo.
