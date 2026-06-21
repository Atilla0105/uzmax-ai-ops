# M3 KB Candidate Pack

> evidence_id: M3-kb-candidate-pack
> status: candidate_owner_review_completed_not_published
> created_at: 2026-06-21
> source_manifest: `docs/evidence/M3/tutorial/tutorial-materials-manifest.md`
> publish_status: not_published

## Review Rules

- This is a candidate pack, not the official knowledge base.
- Project owner review is recorded for the candidate pack on 2026-06-21, with no corrections provided in that turn.
- Customer-facing publication still requires a future import/publish spec, eval gate evidence and explicit release decision.
- Exact route price, quote, SLA, cost, order status and compensation decisions must come from system data, code calculators, policies or human review, not free-form LLM judgment.
- If a customer asks about a concrete parcel, ask for one key identifier first: customer ID, tracking number, order number or phone number.
- If a customer asks about restricted goods, uncertain goods, claims, billing review, customs exceptions, enterprise terms or agent cooperation, collect the minimum required facts and hand off.

## Source Evidence Summary

| Signal | Evidence |
|---|---|
| FAQ source | 60 high-frequency QA items from owner-local file; sha256 `c90821e219a22a5c646b2aa47759927aca4e1885468ab96e15f711b334e27db1` |
| Telegram aggregate source | 2443 redacted candidate pairs; seed review set 80 rows; source manifest residual rescan reports zero residual phone/url/handle/long-number/identity-doc hits |
| Telegram top intents | delivery 273, inbound 198, billing 187, timing_customs 154, account 138, pricing 72, restricted_goods 62, claim_after_sales 27, business 3 |
| Telegram top language signals | latin_other 1209, uz_latin 524, ru_latin_mixed 518, uz_ru_mixed 150, ru_or_cyrillic 28 |
| Review caveat | Telegram rows are `needs_human_review`; this pack uses aggregate intent/sample refs only |

## Owner Review Record

| Fact | Evidence |
|---|---|
| Review status | `owner_review_completed_no_corrections_provided` |
| Review source | Project owner wrote `审核完了` in the Codex thread on 2026-06-21 after PR #54 candidate-pack review. |
| Scope | Candidate content review only; not knowledge publish, DB/admin import, eval closure, M3 closeout, M4 start, production, customer LLM or 1.0 release. |

## Journey Stage Candidates

### 1. `service-intro` - 公司与服务介绍

Sources: QA-01..QA-05.

Candidate answer principles:

- UZMAX/Laylak provides China to Uzbekistan cross-border consolidation and logistics.
- Customers can ship personal shopping, small wholesale, ecommerce stock and enterprise cargo.
- The platform helps with China warehouse receiving, inbound registration, consolidation, international transport, customs handling and pickup/delivery in Uzbekistan.
- Chinese, Uzbek and Russian support are allowed; answer in the customer's main language.

Boundaries:

- Do not promise every route is always cheapest.
- Enterprise contracts, invoices, long-term pricing and custom terms go to a customer manager.

### 2. `account-address` - 注册、Telegram 绑定、客户 ID 与地址

Sources: QA-06..QA-12; seed intents `account`; Telegram source refs include account-heavy seed examples such as `real-94ffde9b156846e4`, `real-52dcdefe7d11ad73`, `real-6ad83069a76fdbda`.

Candidate answer principles:

- Registration requires Telegram binding, phone verification and completing profile/address fields.
- Telegram binding is strongly recommended because Bot notifications carry inbound, arrival, bill and pickup updates.
- Customer ID is required so the China warehouse can identify parcel ownership.
- China shopping platform address must include warehouse address, recipient information and customer ID.
- Personal information should be real because customs, billing, pickup and local delivery depend on it.

Boundaries:

- If a customer forgot ID, ask for China tracking number and shopping screenshot, then route to abnormal parcel handling.
- Account conflicts, phone changes and identity changes require verification and human handling.

### 3. `order-prealert-inbound` - 下单、预报、入库与仓库处理

Sources: QA-13..QA-20; seed intents `inbound`, `delivery`.

Candidate answer principles:

- After purchase, the customer should pre-alert the China tracking number once the seller ships.
- Pre-alert enables tracking, anomaly handling and claim basis.
- A parcel shown as delivered by China courier still needs warehouse sorting, checking, weighing, photo and system entry before it appears in the platform.
- Warehouse normally signs, weighs, photographs, checks safety and records inbound; it does not guarantee deep product inspection.
- Multiple parcels can be consolidated when warehouse/platform rules allow it.

Boundaries:

- If China courier says delivered but platform has no inbound record, ask for one key item first: tracking number.
- Unprealerted parcels may lose tracking and claim protection.
- Return to China seller is only possible before international dispatch and depends on seller acceptance; domestic return cost is customer-side.

### 4. `route-pricing-timing` - 运输路线、价格与时效

Sources: QA-21..QA-32; seed intents `pricing`, `timing_customs`; Telegram aggregate shows pricing and Avto standart questions recurring.

Candidate answer principles:

- Main route types: Avia pochta, Avto pochta and Avto standart.
- Avia is usually faster and suited for smaller, higher-value, time-sensitive ordinary goods, but has stricter restrictions.
- Avto pochta is usually more flexible and cheaper than air for less urgent small goods.
- Avto standart is for larger or commercial batches; FAQ threshold says same-type goods usually need over 30 kg or over 0.3 cubic meters.
- Accurate price depends on route, weight, volume, category and batch; the calculator/system bill is authoritative.
- Reference timing from FAQ: Avia about 3-7 days after dispatch, Avto pochta around two weeks, Avto standart around 20-28 days. These are not promises.

Boundaries:

- Do not give a fixed per-kg price if route, weight, volume and product category are missing.
- Do not calculate final quote in chat; collect facts and use the calculator/system quote path.
- If already in international transport, individual acceleration is usually not available.

### 5. `restricted-goods` - 可寄、敏感品与禁运品

Sources: QA-33..QA-40; seed intent `restricted_goods`.

Candidate answer principles:

- Ordinary legal goods such as clothes, shoes, bags, home goods, toys, books and small accessories are generally acceptable.
- Sensitive goods require confirmation: food, liquid, powder, electronics, batteries, cosmetics, medicine, medical supplies and similar goods.
- Prohibited across channels: medicine/medical supplies, 18+ products, food, tobacco, flammable/explosive items, toxic chemicals, weapons/ammunition, drugs, imitation weapons, controlled knives, illegal publications, counterfeit money, live animals, seeds and illegal goods.
- Large light goods may incur high volumetric cost and should be estimated before purchase.

Boundaries:

- If the product is specific, ask for product image, link, parameters and quantity.
- Do not provide ways to bypass restrictions.
- If warehouse finds prohibited or high-risk goods, freezing, return, refusal or confiscation can happen under platform rules; losses/costs caused by customer risk belong to customer side.

### 6. `customs-tax` - 清关、资料与税费

Sources: QA-41..QA-45; seed intent `timing_customs`.

Candidate answer principles:

- Normal parcels are handled by customs partners/local team; customers usually do not need to go to customs themselves.
- Customers must keep real name, phone and address accurate.
- In special checks, high-value orders or abnormal categories, passport, order screenshot, payment proof or other documents may be requested.
- Platform bills usually include ordinary customs-related fees for the relevant route, with exceptions for special goods, high-value orders, abnormal information or violations.
- Customs delays can be caused by inspection, document checks, holidays, policy changes or product category.

Boundaries:

- Do not collect unnecessary sensitive information proactively.
- Customs failures caused by false declaration, prohibited goods or wrong information are customer-side risk.
- Do not promise compensation for customs policy or incomplete-document delay.

### 7. `billing-payment-storage` - 账单、支付与仓储

Sources: QA-46..QA-50; seed intent `billing`.

Candidate answer principles:

- Most orders are billed after goods arrive in Uzbekistan and the system consolidates the bill.
- Common payment methods include Payme, Click, local bank transfer and cash at headquarters, subject to the system bill page.
- Bill amount can include transport, customs-related fees, value-added services, payment-on-behalf fees, storage or delivery.
- Electronic payment can delay; keep payment screenshot, transaction ID and payment time.
- FAQ says paid parcels are normally stored free for 15 days; over time may incur storage fee or abandoned-goods handling.

Boundaries:

- Do not confirm payment arrival without proof/system status.
- Billing review requires bill screenshot, customer ID or order number.
- Special storage extension should be requested before overdue.

### 8. `pickup-delivery` - 本地自提与配送

Sources: QA-51..QA-56; seed intent `delivery`.

Candidate answer principles:

- After arrival and bill payment, customers can choose free pickup point collection or paid home delivery where available.
- Pickup point address, schedule and contact information should follow official platform, announcements and current system options.
- Customers should bring required pickup information such as phone number, order number or pickup notification.
- Home delivery fee depends on address, distance, parcel size and delivery method.
- Scheduled delivery can be attempted but depends on local delivery capacity.

Boundaries:

- Do not report pickup point addresses from memory.
- Do not promise exact delivery time.
- Unpaid bills generally block pickup.

### 9. `after-sales-claims` - 售后、理赔与异常

Sources: QA-57..QA-60; seed intent `claim_after_sales`.

Candidate answer principles:

- Lost parcel claim review requires customer ID, tracking number, order screenshot and value proof.
- Damage reports should be made within 24 hours with outer package photos, item damage photos, order information and pickup record.
- Fragile goods cannot be guaranteed 100% safe; reinforcement and insurance are recommended for high-value fragile items.
- Non-compensation cases include unprealerted parcels, late complaint, prohibited/restricted goods, wrong address/information, hidden product attributes, force majeure, customs policy, product quality issue and missing evidence.

Boundaries:

- Compensation decision must be reviewed by humans or policy workflow.
- If the customer is angry, first collect facts and evidence; do not argue or make unsupported conclusions.

## Fact Candidate Index

| Candidate key | Type | Owner review focus |
|---|---|---|
| `fact-service-scope` | fact | Confirm brand wording and service scope. |
| `fact-language-policy` | fact | Confirm Uzbek/Russian/Chinese support wording. |
| `fact-telegram-binding` | fact | Confirm whether Telegram binding is required or strongly recommended. |
| `fact-customer-id-address` | fact | Confirm address and customer ID wording. |
| `fact-prealert-required` | fact | Confirm claim impact of unprealerted parcels. |
| `fact-inbound-delay` | fact | Confirm normal warehouse processing delay wording. |
| `fact-route-types` | fact | Confirm route names and descriptions. |
| `fact-avto-standart-threshold` | fact | Confirm 30 kg / 0.3 cubic threshold and goods type conditions. |
| `fact-price-authority` | policy | Confirm calculator/system bill remains authoritative. |
| `fact-reference-timing` | policy | Confirm 3-7 days, around two weeks and 20-28 days as reference only. |
| `fact-restricted-goods` | redline/policy | Confirm prohibited list and sensitive-goods handling. |
| `fact-customs-documents` | policy | Confirm document collection boundaries. |
| `fact-payment-methods` | fact | Confirm Payme/Click/bank/cash support. |
| `fact-storage-free-window` | policy | Confirm 15-day free storage after payment. |
| `fact-pickup-delivery` | fact | Confirm self-pickup and home delivery conditions. |
| `fact-claims-lost-damaged` | policy | Confirm evidence and time-window requirements. |

## Owner Review Checklist

- Candidate pack review completed by project owner on 2026-06-21.
- No corrections were provided in that turn.
- Future import/publish work must still decide which entries become public KB, internal-only KB or handoff-only guidance.
- Future translation/eval work must still confirm Uzbek/Russian customer-facing wording and redline behavior.
