# SPK-01 Telegram Business Conservative Closure Evidence

> evidence_id: SPK-01-telegram-business
> milestone: M2
> spec: `docs/specs/SPK-01-telegram-business.md`
> adr: `docs/adr/ADR-B01-telegram-business.md`
> status: no_go_owner_inputs_missing
> created_at: 2026-06-17
> updated_at: 2026-06-17
> owner: 项目 owner 提供或授权真实 Telegram Business 账号、Premium、真实 Bot、客服本人账号、客户测试账号和测试会话；AI agent 负责当前 repo/evidence 检索、ADR/evidence conservative closure 和风险暴露。
> sensitive_data_location: none in repo
> redaction_status: no raw Telegram payloads, screenshots, customer plaintext, support personal accounts, Bot token, Business account identifiers, phone numbers, addresses, payment data or customer order IDs included

## Current Decision

SPK-01 closes M2 on the conservative branch `no_go_owner_inputs_missing`.

No real Telegram Business account, Premium status, real Business-bound Bot, support-person account, customer test account, webhook payload evidence, permission error evidence, backend draft evidence or `business_connection_id` send-limit evidence is available in the repo for this M2 closure.

This evidence does not claim Telegram Business is impossible. It only records that UZMAX cannot enable Telegram Business in the current M2 branch without the required real-environment inputs and evidence.

## Evidence Search Scope

| Check | Result | Note |
|---|---|---|
| Existing ADR-B01 | missing before this PR | `docs/adr/README.md` reserved the filename, but no ADR-B01 file existed |
| SPK-01 spec | present | `docs/specs/SPK-01-telegram-business.md` requires real Business account evidence |
| M2 readiness pack | pending | `docs/evidence/M2/M2-channel-conversation-readiness-pack.md` records `pending_real_business_account_or_conservative_closure` |
| M2 evidence directory | no SPK-01 manifest before this PR | `docs/evidence/M2/README.md` reserved `spikes/SPK-01-telegram-business/` |
| Business runtime evidence | absent | no real webhook sample, permission error, Business draft, Business send result or account manifest is tracked |
| Existing Bot runtime | not Business proof | M2-02 only defers Business updates as unsupported/deferred and does not declare Business feasibility |

## Missing Required Inputs

| Required by SPK-01 | Current status |
|---|---|
| Real Telegram Business account | missing from repo evidence |
| Premium status | missing from repo evidence |
| Real Bot bound to Business account | missing from repo evidence |
| Support-person account | missing from repo evidence |
| Customer test account | missing from repo evidence |
| Viewable webhook payload / permission error / draft evidence | missing from repo evidence |
| Owner-confirmed branch conclusion based on real test | unavailable; conservative branch used |

## Branch Mapping

| Item | SPK-01 / ADR-B01 status | Evidence posture |
|---|---|---|
| C-03 | not_current_blocker | No real evidence that Business connection/message can be received and stored |
| C-03b | P0_current_branch | Business module must remain feature-flag closed: entry hidden, API unavailable, backend cannot send Business draft/Business messages |
| C-04 | not_current_blocker | No Business draft-send implementation or enablement in this closure |
| C-05 | not_current_blocker | No real evidence that support-person messages can be reliably distinguished |
| C-05b | not_enabled | No partial-feasibility evidence; no substitute anti-race mechanism is claimed |

## Sensitive Data Boundary

This manifest intentionally excludes:

- raw Telegram payloads or JSON exports;
- screenshots;
- customer message text;
- support personal account identifiers;
- Bot token or webhook secret values;
- Business account identifiers;
- phone numbers, addresses, payment data or order IDs.

If future SPK-01 work captures any sensitive source material, it must stay in controlled storage. The repo may only receive a manifest that records redaction method, access scope, retention period and project owner confirmation status.

## Official Background References

- Telegram Business API: https://core.telegram.org/api/business
- Telegram Bot API: https://core.telegram.org/bots/api

These links are background only. They are not real-environment evidence for UZMAX and do not establish that the current project can receive Business updates, distinguish support-person messages or send through `business_connection_id`.

## Validation To Record In This PR

| Command | Result | Notes |
|---|---|---|
| `git status --short` | pass | root worktree clean before this manifest correction; final PR update contains only this docs evidence file |
| `git branch --no-merged main` | pass | only `codex/spk-01-telegram-business-closure` is ahead of `main`, as expected for PR #28 |
| `gh pr list --state open --limit 50 --json number,title,headRefName,baseRefName,isDraft,url` | pass | PR #28 is the draft SPK-01 closure PR for `codex/spk-01-telegram-business-closure` |
| `git diff --name-only origin/main...HEAD` | pass | committed PR diff is docs-only: SPK-01 spec, ADR-B01, ADR README, M2 README and this manifest |
| `npm run format:check` | pass | Prettier check passed on the clean root worktree |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok` |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/SPK-01-telegram-business.md` | pass | 5 docs files, source changed files 0, net source LOC 0, new source files 0 |
| `npm run check` | not_run | not run because this PR is docs-only ADR/evidence closure and the required targeted format/doc-trigger/pr-shape gates passed |

## Future Reopen Conditions

Reopen Telegram Business only through a new spec/PR or ADR revision that includes:

1. Project owner confirmation of a real Telegram Business account with Premium.
2. A real Bot bound to the Business account.
3. At least one support-person account and one customer test account.
4. Redacted evidence that the Bot receives or does not receive `business_connection` and `business_message` updates.
5. Redacted evidence for support-person message visibility, permission errors and `business_connection_id` send limits.
6. Confirmation that AI automatic Business sending remains impossible in the product path.
7. Updated acceptance mapping for C-03 / C-03b / C-04 / C-05 / C-05b.
