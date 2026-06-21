# M3 KB Journey Import Draft Report

> evidence_id: M3-kb-journey-import-report
> milestone: M3
> status: draft_not_imported_not_published
> created_at: 2026-06-21
> spec: `docs/specs/M3-16-kb-material-candidates.md`
> source_manifest: `docs/evidence/M3/tutorial/tutorial-materials-manifest.md`

## Import Decision

No database import, admin upload, storage upload or knowledge publish was executed.

This report records a draft journey/stage mapping that is compatible with the M3-04 KB journey foundation shape: stage keys, controlled refs, bounded stage-card answers, material refs and fail-closed handoff boundaries.

## Draft Journey

| Field | Value |
|---|---|
| journey key | `laylak-cross-border-customer-support-v1` |
| journey ref | `manifest://m3-16/kb/journey/laylak-cross-border-customer-support-v1` |
| default locale | `zh-CN` |
| stage count | 9 |
| source pack | 60 QA reference + redacted Telegram aggregate/sample-id refs |
| publish status | not published |
| owner review | required |

## Draft Stages

| Sequence | Stage key | Stage title | Source refs | Material refs | Closeout note |
|---:|---|---|---|---|---|
| 1 | `service-intro` | 公司与服务介绍 | QA-01..QA-05 | `manifest://m3-16/material/service-intro` | ready for owner review |
| 2 | `account-address` | 注册、Telegram 绑定、客户 ID 与地址 | QA-06..QA-12; seed intents `account` | `manifest://m3-16/material/account-address` | ready for owner review |
| 3 | `order-prealert-inbound` | 下单、预报、入库与仓库处理 | QA-13..QA-20; seed intents `inbound`, `delivery` | `manifest://m3-16/material/order-prealert-inbound` | ready for owner review |
| 4 | `route-pricing-timing` | 运输路线、价格与时效 | QA-21..QA-32; seed intents `pricing`, `timing_customs` | `manifest://m3-16/material/route-pricing-timing` | exact pricing remains calculator/config controlled |
| 5 | `restricted-goods` | 可寄、敏感品与禁运品 | QA-33..QA-40; seed intent `restricted_goods` | `manifest://m3-16/material/restricted-goods` | product-specific uncertainty must hand off |
| 6 | `customs-tax` | 清关、资料与税费 | QA-41..QA-45; seed intent `timing_customs` | `manifest://m3-16/material/customs-tax` | abnormal customs cases require human review |
| 7 | `billing-payment-storage` | 账单、支付与仓储 | QA-46..QA-50; seed intent `billing` | `manifest://m3-16/material/billing-payment-storage` | payment confirmation requires evidence |
| 8 | `pickup-delivery` | 本地自提与配送 | QA-51..QA-56; seed intent `delivery` | `manifest://m3-16/material/pickup-delivery` | exact pickup point/time remains system/announcement controlled |
| 9 | `after-sales-claims` | 售后、理赔与异常 | QA-57..QA-60; seed intent `claim_after_sales` | `manifest://m3-16/material/after-sales-claims` | compensation decisions require human review |

## Stage-Card Checks

| Check | Result |
|---|---|
| Every stage has stable key/title/source refs | pass |
| Every stage has at least one controlled material ref | pass |
| Candidate answers are bounded by stage, not full-journey dumps | pass |
| Price/timing language uses reference wording and does not promise fixed dates | pass |
| Exact quote, SLA, cost and order-status decisions remain outside LLM/KB | pass |
| Ambiguous account, billing, claims, restricted goods and customs cases route to human review | pass |
| Raw Telegram messages are not committed | pass |
| Owner review required before official KB publish | pass |

## Remaining Work

- Owner review and corrections on candidate pack.
- Future import/persistence spec to turn approved candidates into real KB entries/stages.
- Eval gate cases for tutorial stage localization and redline behavior.
- Knowledge publish workflow and rollback path.
- Screenshot samples and language blind review remain separate M3 closeout blockers.
