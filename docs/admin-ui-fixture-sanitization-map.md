# UZMAX Admin UI Fixture Sanitization Map

> Status: M7-UI-00A docs-only preflight for prototype-derived UI migration.
> Scope: fixture and sample-data sanitization for future M7 UI page workers.
> Visual / structure sources:
>
> - `/Users/atilla/Downloads/运营塔台1.0.html`
> - `/Users/atilla/源码/unpacked 6`
>
> Boundary: these sources may guide layout, component shape, state coverage, density, interaction and microcopy style. They are not approved data sources.

This map does not approve GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply, external SaaS onboarding or 1.0 release.

No complete suspicious sample value is recorded here. Examples use synthetic or redacted placeholders only.

## 1. Source Scan Summary

The scans were conservative regex/count/path checks. Counts are signal counts, not proof that every hit is real sensitive data.

| Source | Structure |
|---|---|
| HTML | 1,239,803 bytes, UTF-8 HTML with long lines |
| `unpacked 6` | 93 files: 57 `tsx`, 31 `ts`, 2 `css`, 1 `md`, 2 `.DS_Store` |
| `unpacked 6/fixtures` | `agents`, `analytics`, `config`, `conversations`, `customers`, `evals`, `group`, `groupModel`, `groupPlatform`, `knowledge`, `orders`, `queue`, `team`, `tenants`, `tickets` |

Broad category scan:

| Category | HTML Hits | `unpacked 6` Hits / Files | Conservative Judgment |
|---|---:|---:|---|
| Customer/person/contact labels | 664 | 556 / 60 | Treat row-level labels, display names and contact text as replace-only. |
| Phone-like/contact terms | 406 | 194 / 22 | Treat as replace-only unless it is a generic UI label such as "Phone". |
| Email | 17 | 13 / 3 | Treat values as replace-only; use reserved `.test` fixtures. |
| Telegram/social/platform handles | 799 | 134 / 24 | Keep integration labels; replace handles, payloads and message bodies. |
| Order/tracking/logistics terms | 1769 | 1264 / 78 | Keep workflow labels; replace order IDs, tracking numbers and row payloads. |
| Money/quote/payment terms | 437 | 775 / 69 | Keep column labels and state names; replace amounts/quote examples. |
| Address/country/city terms | 30 | 26 / 16 | Keep taxonomy labels; replace customer/order-specific locations. |
| Merchant/org/tenant/platform terms | 469 | 183 / 18 | Keep generic tenant/org UI language; replace real or semi-real names. |
| API/secret/URL terms | 25 | 287 / 63 | Treat as high risk; only synthetic URLs/refs allowed. |
| Platform copy | 504 | 419 / 48 | Keep product integration names; rewrite user/platform sample copy if row-level. |
| Raw/export/payload/file terms | 279 | 815 / 90 | Do not import raw/export/jsonl/csv/xlsx samples into repo. |

More precise high-risk scan:

| Pattern Class | HTML Hits | `unpacked 6` Hits | Action |
|---|---:|---:|---|
| Email-like values | 4 | 4 | Replace with `customer-001@example.test` style values. |
| Long numeric / phone-like values | 155 | 41 | Replace with reserved fake contact/order/metric formats. |
| Order/payment/tracking-like codes | 32 | 72 | Replace with controlled synthetic refs, not production-shaped IDs. |
| URL values | 4 | 0 | Replace with `https://example.invalid/...` or `controlled://...`. |
| Secret assignment-like syntax | 0 | 1 | Treated as token/config wording; no known secret prefix hit. |
| Known secret prefixes | 0 | 0 | Still do not allow raw secrets in fixtures. |
| Raw payload terms | 2 | 0 | Do not copy payload text. |

## 2. Data Category Map

| Category | Source Signals | Keep As UI Label / Structure | Replace With Synthetic Fixture |
|---|---|---|---|
| Customer name / display name | `fixtures/customers.ts`, conversation/customer pages, HTML customer rows | Labels such as "Customer", "Customer detail", "Customer list" | Any person-like value, initials tied to a row, display name, nickname or profile text |
| Phone | HTML phone-like values, contact fields, team/customer fixtures | Generic field label "Phone" or permission copy | Full numbers, partial numbers, country-code examples, WhatsApp phone values |
| Email | HTML and fixture email-like values | Generic field label "Email" | Full local-part/domain values, support/customer/team addresses |
| Telegram / social | Telegram Business labels, handle-like strings, conversation fixtures | Integration name, status label, channel label, "Telegram Business draft" copy | Handles, social profile URLs, raw Telegram payloads, copied customer messages |
| Order number | `fixtures/orders.ts`, order pages, import workflow copy | Column labels "Order", "Order status", "Order snapshot" | Any production-shaped order/payment/tracking IDs or imported row IDs |
| Amount / price / quote | analytics/order/quote/payment strings | Column labels, state labels, chart/metric labels | Any amount tied to customer/order/quote; use deterministic synthetic amount |
| Address | customer/order pages, address/city/country terms | Field labels "Address", "City", "Country" | Customer address, warehouse address, delivery address, city tied to a row |
| Country / city | country/city taxonomy and logistics copy | Product taxonomy only when not tied to a sample row | Per-customer/per-order country or city values copied from source |
| Logistics trajectory | order/import/tracking/status pages | State labels such as "in transit", "stale", "missing", "snapshot" | Tracking number, carrier code, route, timestamped path, raw event payload |
| Merchant / org / tenant | tenant/group/team/platform fixtures | Generic "Tenant", "Organization", "Merchant" UI language | Real or semi-real org names, store names, staff/team names, tenant names |
| API / secret / URL | URL terms, token/config wording, platform integration pages | Generic labels "API key", "Webhook", "Provider URL" | Real endpoints, provider keys, tokens, webhook URLs, auth headers, signed links |
| Real platform copy | Telegram/Business/platform messages and connector wording | Official product/integration names and generic status labels | Copied message bodies, canned platform sample text, support scripts that read like real conversations |
| Raw/export formats | jsonl/csv/xlsx/import/export/payload terms | UI labels describing import/export actions | Raw files, exported rows, payload bodies, screenshots of raw records |

## 3. Preserve vs Replace Boundary

### May Be Preserved

- Information architecture: group layer, tenant layer, page order, navigation groups.
- Layout structure: rail, topbar, tenant switcher, tables, cards, dialogs, drawers, queue flow, conversation workbench columns.
- Component shape and state coverage: loading, empty, error, permission denied, degraded, selected, disabled, modal confirmation, keyboard affordances.
- Generic UI labels: "Customer", "Order", "Ticket", "Knowledge", "Eval", "Release", "Tenant", "Telegram Business", "API key", "Webhook".
- Generic state vocabulary: "synthetic local shell", "controlled ref", "stale", "missing", "degraded", "blocked", "pending", "approved", "discarded".
- Design tokens, spacing, typography, radius, icon usage and motion patterns after tokenization.

### Must Be Replaced

- Any row-level customer, contact, order, shipment, address, staff, merchant, tenant or organization value.
- Any message body, transcript, quick reply, platform sample, support text or copied customer-facing script that appears to be a sample conversation.
- Any phone number, email, social handle, profile URL, Telegram payload, webhook URL, API endpoint, key, token, auth header or signed URL.
- Any raw/export/jsonl/csv/xlsx file body or pasted payload.
- Any screenshot/test assertion/evidence snippet containing full raw sample values.
- Any production-shaped identifiers using prefixes like order/payment/tracking IDs copied from the source. Future synthetic IDs must be visibly synthetic.

## 4. Synthetic Fixture Naming Rules

Use deterministic synthetic fixtures. Do not use random faker output seeded from raw samples. Do not "lightly edit" a real value.

| Object | Preferred Ref | Display Label | Notes |
|---|---|---|---|
| Tenant | `controlled://tenant/syn-001` | `Tenant SYN-001` | Use `syn-001`, `syn-002`; no real org names. |
| Customer | `controlled://customer/syn-001` | `Customer SYN-001` | No personal name, no initials from source. |
| Conversation | `controlled://conversation/syn-001` | `Conversation SYN-001` | Message bodies must be generic synthetic text. |
| Ticket | `controlled://ticket/syn-001` | `Ticket SYN-001` | Close reasons may be generic workflow states. |
| Order | `controlled://order/syn-001` | `Synthetic order 001` | Avoid production-like prefixes copied from source. |
| Quote | `controlled://quote/syn-001` | `Synthetic quote 001` | Amounts are layout fixtures, not pricing truth. |
| Tracking | `controlled://tracking/syn-001` | `Synthetic tracking 001` | Do not mimic a real carrier tracking number. |
| Import job | `controlled://import-job/syn-001` | `Synthetic import job 001` | Metadata only; no raw CSV/TSV body. |
| Knowledge item | `controlled://kb/syn-001` | `Synthetic knowledge 001` | No copied product/customer script. |
| Media/storage | `controlled://storage/syn-001` | `Synthetic media 001` | No real filename, file_id, bucket path or signed URL. |
| Audit/log row | `controlled://audit/syn-001` | `Synthetic audit 001` | Do not include real actor/customer/order details. |

Reserved fake values:

| Data Type | Allowed Format | Forbidden Format |
|---|---|---|
| Email | `customer-001@example.test`, `operator-001@example.test` | Any real domain or copied source address |
| Phone | `+1 555 0101` through `+1 555 0199`, or no phone value at all | Any copied number, partial real number or WhatsApp number |
| URL | `https://example.invalid/uzmax/synthetic-001` | Real endpoint, webhook, signed URL, SaaS dashboard URL |
| Amount | `USD 42.00`, `UZS 120000`, marked as synthetic | Copied quote/order amount or live pricing result |
| City/Country | `Example City`, `Testland` for row values | Customer/order-specific location copied from source |
| Social | `controlled://social/telegram/syn-001` | `@handle`, `t.me/...`, profile URL |
| Payload | `controlled://payload/syn-001` | pasted JSON, jsonl row, CSV row, raw Telegram payload |

## 5. Migration Rules For Future Page Workers

- Start each page slice by reading this map, `AGENTS.md`, M7-05 spec/evidence and the target page source in `unpacked 6`.
- Treat `unpacked 6/fixtures/*.ts` as sensitive sample input, not a repo fixture source.
- Rebuild page fixtures from the synthetic naming table above.
- Keep permissions and customer-data boundaries visible. Group-level pages must not render customer plaintext.
- Keep current admin precedent: prefer `controlled://...` refs and "synthetic local shell" wording for local evidence.
- Tests must assert absence of forbidden raw samples on rendered surfaces. Use negative patterns for raw payloads, jsonl/csv/xlsx/export, phone-like numbers, handles, production-shaped IDs, payment/address/secret terms where applicable.
- Screenshots and visual evidence must not contain real or semi-real values. If a screenshot needs a value for layout, it must be synthetic and traceable to this map.
- Do not add raw sample files under repo, including `.jsonl`, `.csv`, `.xlsx`, raw HTML extracts, exported rows or copied source fixture files.
- If a page needs realistic volume, generate deterministic synthetic rows from a tiny schema, not from source values.
- If a source value looks harmless but is row-level, replace it. UI structure can be copied; row data cannot.
- If a platform name is needed for product truth, keep only the platform/integration label and rewrite all sample copy around it.

## 6. Acceptance Requirements For Page Workers

Each future page worker must provide evidence for:

- Source paths read and page scope.
- Synthetic fixture provenance: either inline controlled refs, a repo fixture module created under a spec, or generated deterministic rows; never raw `unpacked 6` samples.
- Negative rendered-data checks for the touched page.
- Confirmation that screenshots, Playwright assertions and docs evidence do not contain full customer/contact/order/address/tracking/secret/URL/payload values.
- Confirmation that permission denied, degraded, empty, loading and customer-data boundary states remain visible where the page owns those states.
- Confirmation that no source/test/docs file imports or copies raw/export/jsonl/csv/xlsx samples.

Suggested rendered-data deny pattern for UI tests, adapted per page:

```text
raw payload|jsonl|telegram payload|csv export|xlsx|ORD-|PAY-|TG-|phone|address|payment|secret|@[A-Za-z0-9_]+|\+?\d[\d\s().-]{6,}
```

The deny pattern is intentionally conservative. If a page must show a generic label such as "Phone" or "Address", scope the assertion to row data or use case-sensitive exceptions documented in that page spec/evidence.

## 7. Open Items

- This map does not sanitize or rewrite `unpacked 6`; that source remains frozen.
- This map does not create shared fixture modules. Future implementation specs must decide where synthetic fixtures live.
- This map does not update M7 evidence indexes because Worker 01 is constrained to three writable files.
- M7 evidence currently names planned `M7-UI-01 Global Admin Frame`; this preflight slice uses `M7-UI-00A` so that implementation slot remains available.
- Human owner may still need a separate retention/deletion decision for any real or semi-real samples outside the repo.
