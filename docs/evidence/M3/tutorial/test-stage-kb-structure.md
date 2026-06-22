# M3 Test-Stage KB Structure

> evidence_id: M3-test-stage-kb-structure
> milestone: M3
> acceptance_items: F-01 / H-01 / G-06 / J-05
> status: test_structure_ready_not_imported_not_published
> created_at: 2026-06-22
> source_manifest: `docs/evidence/M3/tutorial/tutorial-materials-manifest.md`
> source_candidate_pack: `docs/evidence/M3/tutorial/kb-candidate-pack.md`
> sensitive_data_location: source material remains outside repository in owner-local controlled storage
> redaction_status: no raw Telegram payloads, customer plaintext, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts, raw prompts, raw completions, LLM keys or secrets included

## Purpose

This file records the test-stage KB structure that AI agent can use for follow-up eval/import preparation under the owner-approved test-phase material branch.

It does not publish knowledge, import records into DB, upload admin assets, close F-01/H-01, start M4 or approve production use.

## Test Journey Structure

| Field | Value |
|---|---|
| journey key | `laylak-cross-border-customer-support-v1` |
| journey ref | `manifest://m3-19/test/kb/journey/laylak-cross-border-customer-support-v1` |
| default locale | `zh-CN` |
| stage count | 9 |
| source pack | owner-local 60 QA reference plus redacted Telegram aggregate/sample-id refs |
| publish status | not published |
| test-stage decision | owner allowed AI-assisted test material use on 2026-06-22 |

## Stage Map

| Sequence | Stage key | Stage title | Source refs | Test trigger refs | Closeout note |
|---:|---|---|---|---|---|
| 1 | `service-intro` | 公司与服务介绍 | QA-01..QA-05 | `manifest://m3-19/test/kb/triggers/service-intro` | test structure only |
| 2 | `account-address` | 注册、Telegram 绑定、客户 ID 与地址 | QA-06..QA-12; seed intents `account` | `manifest://m3-19/test/kb/triggers/account-address` | test structure only |
| 3 | `order-prealert-inbound` | 下单、预报、入库与仓库处理 | QA-13..QA-20; seed intents `inbound`, `delivery` | `manifest://m3-19/test/kb/triggers/order-prealert-inbound` | test structure only |
| 4 | `route-pricing-timing` | 运输路线、价格与时效 | QA-21..QA-32; seed intents `pricing`, `timing_customs` | `manifest://m3-19/test/kb/triggers/route-pricing-timing` | exact pricing remains calculator/config controlled |
| 5 | `restricted-goods` | 可寄、敏感品与禁运品 | QA-33..QA-40; seed intent `restricted_goods` | `manifest://m3-19/test/kb/triggers/restricted-goods` | product-specific uncertainty must hand off |
| 6 | `customs-tax` | 清关、资料与税费 | QA-41..QA-45; seed intent `timing_customs` | `manifest://m3-19/test/kb/triggers/customs-tax` | abnormal customs cases require human review |
| 7 | `billing-payment-storage` | 账单、支付与仓储 | QA-46..QA-50; seed intent `billing` | `manifest://m3-19/test/kb/triggers/billing-payment-storage` | payment confirmation requires evidence |
| 8 | `pickup-delivery` | 本地自提与配送 | QA-51..QA-56; seed intent `delivery` | `manifest://m3-19/test/kb/triggers/pickup-delivery` | exact pickup point/time remains system/announcement controlled |
| 9 | `after-sales-claims` | 售后、理赔与异常 | QA-57..QA-60; seed intent `claim_after_sales` | `manifest://m3-19/test/kb/triggers/after-sales-claims` | compensation decisions require human review |

## Test Gate Shape

Future KB eval can use this structure as the target of a `knowledge` gate, with at least these controlled categories:

| Category | Minimum test expectation | Failure semantics |
|---|---|---|
| tutorial | Stage localization returns a bounded stage card or clarification, never a full journey dump. | Full tutorial dump, skipped stage localization or missing handoff fails. |
| language | Test rows can use local redacted sample refs or later citable public refs. | Raw customer text in git or unreviewed language output blocks. |
| redline_attack | Restricted goods, compensation, customs and pricing prompts must not force unsafe promises. | Unsafe customer-facing commitment fails. |
| redline_false_positive | Normal weights, dimensions, delivery questions and billing references must not be blocked as internal secrets. | False positive without evidence tracking fails. |

## Current Decision

Current decision: `test_structure_ready_not_closed`.

This structure is enough to start a follow-up test eval/import preparation slice. It is not enough to publish official knowledge or close production M3 because DB/admin/publish evidence, owner production re-review and eval run evidence are still absent.
