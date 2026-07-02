# M7-UI-00A Fixture Sanitization Map Evidence

## Entry State

| Fact | Evidence |
|---|---|
| worker worktree | `/Users/atilla/.codex/worktrees/m7-ui-01-fixture-sanitization-map/UZMAX智能运营` |
| worker branch | `codex/m7-ui-00a-fixture-sanitization-map` |
| entry `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-01-fixture-sanitization-map/UZMAX智能运营` |
| entry `git status --short --branch` | `## codex/m7-ui-00a-fixture-sanitization-map` |
| entry `git branch --show-current` | `codex/m7-ui-00a-fixture-sanitization-map` |

## Sources Read

| Source | Use |
|---|---|
| `AGENTS.md` | Source-of-truth, workspace isolation, allowed change flow, data/customer boundary. |
| `docs/specs/M7-05-prototype-visual-source-reset.md` | Confirms owner HTML and `unpacked 6` are visual/structure source, not raw data source. |
| `docs/evidence/M7/M7-05-prototype-visual-source-reset.md` | Confirms M7-05 boundary: no raw prototype/customer/order/secrets copied. |
| `docs/specs/SPEC-template.md` | Spec structure. |
| `docs/specs/M7-03-admin-design-system-from-prototype.md` and evidence | Design-system extraction precedent and no raw sample boundary. |
| `docs/admin-design-system.md` | Current visual implementation standard and future UI slice expectations. |
| `docs/evidence/M7/README.md` | Current M7 status and boundary. |
| `apps/admin/src/**`, `apps/admin/tests/**` | Existing synthetic/controlled-ref and negative sample checks. |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Read-only source scan; no full sample values copied. |
| `/Users/atilla/源码/unpacked 6` | Read-only source/package scan; source remains frozen. |

## Admin Fixture / Test Structure Check

Commands:

```bash
rg --files apps/admin | rg '(fixture|fixtures|test|tests|spec|mock|data|evidence|__tests__|\.test\.|\.spec\.)'
find apps/admin -maxdepth 4 -type d | sort
rg -n "controlled://|synthetic local|No real customer|raw payload|jsonl|csv export|phone|address|secret|@\[" apps/admin/src apps/admin/tests
```

Findings:

- `apps/admin` currently has `src` and `tests`, with no dedicated repo fixture directory.
- Current admin shell uses controlled refs such as `controlled://...` and explicit "synthetic local shell" copy.
- Current Playwright tests already include deny checks for raw payloads, jsonl/csv/xlsx/export, production-shaped order/payment/Telegram prefixes, phone-like numbers, handles, address/payment/secret terms and customer plaintext.
- Current admin code also includes runtime client contract guards that reject forbidden raw payload keys in selected M5 runtime surfaces.

## Input Source Shape

Commands:

```bash
wc -c /Users/atilla/Downloads/运营塔台1.0.html
file /Users/atilla/Downloads/运营塔台1.0.html
find /Users/atilla/源码/unpacked\ 6 -type f | wc -l
find /Users/atilla/源码/unpacked\ 6 -type f | sed 's/.*\.//' | sort | uniq -c | sort -nr
find /Users/atilla/源码/unpacked\ 6 -maxdepth 3 -type f | sort
```

Results:

- HTML source: `1,239,803` bytes, UTF-8 HTML, long lines.
- `unpacked 6`: `93` files.
- Extension summary: `57 tsx`, `31 ts`, `2 css`, `1 md`, `2 DS_Store`.
- `unpacked 6` contains `fixtures`, `hooks`, `pages`, `patterns`, `primitives`, `shell` and `ui-tokens` folders.
- `fixtures` includes page/domain sample sources: `agents`, `analytics`, `config`, `conversations`, `customers`, `evals`, `group`, `groupModel`, `groupPlatform`, `knowledge`, `orders`, `queue`, `team`, `tenants`, `tickets`.

## Sensitive Sample Scan Commands

Broad scan command shape, run separately against HTML and `unpacked 6`:

```bash
while IFS=$'\t' read -r label pattern; do
  count=$(rg -i -o --no-heading --no-line-number "$pattern" <source> | wc -l | tr -d ' ')
  printf '%s\t%s\n' "$label" "$count"
done <<'EOF'
customer_or_person_labels	客户|customer|client|姓名|name|contact|контакт|клиент|имя
phone	(\+?[0-9][0-9 .()/-]{6,}[0-9])|电话|手机号|phone|tel|whatsapp
email	[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}|邮箱|email
telegram_social	Telegram|telegram|tg://|t\.me|@[-_[:alnum:]]{4,}|Instagram|WhatsApp|Facebook|WeChat|VK|社媒|Business
order_tracking	订单|order|ORD[-_[:alnum:]]+|tracking|track|shipment|物流|轨迹|运单|cargo|batch|snapshot
money_quote	金额|报价|价格|付款|payment|amount|price|total|quote|USD|UZS|RUB|CNY|[$€£¥₽]|сум|so'm
address_geo	地址|address|国家|城市|country|city|Tashkent|Uzbekistan|China|Guangzhou|Yiwu|Узбекистан
org_merchant	商户|组织|organization|merchant|tenant|company|org|店铺|平台
api_secret_url	api[_-]?key|secret|token|bearer|password|client_secret|webhook|https?://|supabase|openai|key=|AKIA
platform_copy	Telegram Business|Bot|WhatsApp|Instagram|platform|平台|Business|OpenAI|Supabase|Render|Vercel
raw_export_formats	jsonl|csv|xlsx|export|raw payload|payload|导出|上传|import
EOF
```

Broad scan results:

| Category | HTML Hits | `unpacked 6` Hits / Files |
|---|---:|---:|
| customer_or_person_labels | 664 | 556 / 60 |
| phone | 406 | 194 / 22 |
| email | 17 | 13 / 3 |
| telegram_social | 799 | 134 / 24 |
| order_tracking | 1769 | 1264 / 78 |
| money_quote | 437 | 775 / 69 |
| address_geo | 30 | 26 / 16 |
| org_merchant | 469 | 183 / 18 |
| api_secret_url | 25 | 287 / 63 |
| platform_copy | 504 | 419 / 48 |
| raw_export_formats | 279 | 815 / 90 |

Precise high-risk scan command shape:

```bash
while IFS=$'\t' read -r label pattern; do
  html=$(rg -i -o --no-heading --no-line-number "$pattern" /Users/atilla/Downloads/运营塔台1.0.html | wc -l | tr -d ' ')
  unpacked=$(rg -i -o --no-heading --no-line-number "$pattern" /Users/atilla/源码/unpacked\ 6 | wc -l | tr -d ' ')
  printf '%s\tHTML=%s\tunpacked=%s\n' "$label" "$html" "$unpacked"
done <<'EOF'
precise_email	[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}
long_numeric_or_phone_like	\+?[0-9][0-9 .()/-]{7,}[0-9]
possible_order_code	\b(ORD|PAY|TG|UZ|TRK|INV|BATCH)[-_][A-Z0-9-]{3,}\b
url	https?://[^\"' )<>]+
secret_assignment	(api[_-]?key|secret|client_secret|password|bearer|authorization|token)\s*[:=]
known_secret_prefix	\b(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})\b
raw_payload_terms	raw payload|jsonl|csv export|xlsx|payload
EOF
```

Precise high-risk scan results:

| Pattern Class | HTML Hits | `unpacked 6` Hits |
|---|---:|---:|
| precise_email | 4 | 4 |
| long_numeric_or_phone_like | 155 | 41 |
| possible_order_code | 32 | 72 |
| url | 4 | 0 |
| secret_assignment | 0 | 1 |
| known_secret_prefix | 0 | 0 |
| raw_payload_terms | 2 | 0 |

Path-only category scan for `unpacked 6/fixtures`:

```bash
while IFS=$'\t' read -r label pattern; do
  printf '%s\n' "$label"
  rg -i -l "$pattern" /Users/atilla/源码/unpacked\ 6/fixtures | sed 's#^/Users/atilla/源码/unpacked 6/##' | sort
done <<'EOF'
customer_contact	客户|customer|client|姓名|name|contact|电话|phone|email|telegram|whatsapp|@[-_[:alnum:]]{4,}
order_tracking_money	订单|order|ORD[-_[:alnum:]]+|tracking|track|shipment|物流|金额|报价|payment|amount|price|quote|USD|UZS|RUB|CNY|[$€£¥₽]
address_geo_org	地址|address|国家|城市|country|city|Tashkent|Uzbekistan|China|商户|组织|organization|merchant|tenant|company|平台
api_url_raw	api[_-]?key|secret|token|bearer|password|webhook|https?://|jsonl|csv|xlsx|payload|import|export
EOF
```

Conservative path findings:

- `customer_contact`: all primary fixture files except `groupModel` matched.
- `order_tracking_money`: all primary fixture files except `groupModel` matched.
- `address_geo_org`: `fixtures/groupModel.ts`, `fixtures/groupPlatform.ts`, `fixtures/knowledge.ts`, `fixtures/team.ts`, `fixtures/tenants.ts`.
- `api_url_raw`: all primary fixture files matched.

## Conservative Judgment

- Both owner input sources contain enough customer/contact/order/payment/platform/raw-file signals that future workers must not copy row-level sample values.
- `unpacked 6` should be treated as visual/source-structure input and fixture-risk input, not as a fixture library.
- Existing repo admin precedent already favors controlled refs and negative rendered-data checks; future page workers should extend that precedent.
- Platform labels such as Telegram Business may remain when they are product/integration labels, but row-level handles, payloads, message bodies and copied platform sample copy must be rewritten.
- Broad counts are intentionally noisy and conservative; any uncertain row-level value should be replaced.

## Write-Boundary Repair

The first `apply_patch` invocation targeted the root/main checkout instead of this assigned worker worktree and created these three intended files as untracked root files:

- `docs/specs/M7-UI-00A-fixture-sanitization-map.md`
- `docs/evidence/M7/M7-UI-00A-fixture-sanitization-map.md`
- `docs/admin-ui-fixture-sanitization-map.md`

Repair actions:

- Removed only the three fixture-map docs originally created by this worker from root/main.
- Repeated M7 UI root patch-target events require a coordinator incident record.
- Recreated the three files in the assigned worker worktree using worker-local `apply_patch`.

Root/main status after cleanup returned to `## main...origin/main`. This worker did not create an incident file because the explicit writable file list for this task contains only the three M7-UI-00A docs files; coordinator should decide whether to open/update an incident record for the repeated patch-target class.

## Deliverables

| File | Result |
|---|---|
| `docs/specs/M7-UI-00A-fixture-sanitization-map.md` | docs-only spec for this worker slice |
| `docs/admin-ui-fixture-sanitization-map.md` | fixture/sample category map, preserve/replace boundary, naming and future worker acceptance rules |
| `docs/evidence/M7/M7-UI-00A-fixture-sanitization-map.md` | this evidence file |

## Boundaries Preserved

This slice did not:

- modify `apps/admin/**`, `packages/**`, runtime source, tests, lockfiles, generated artifacts, config, README or docs indexes;
- modify, move, format or write `/Users/atilla/源码/unpacked 6`;
- copy full suspicious customer/contact/order/address/tracking/secret/URL/payload values into repo;
- submit, push, merge or approve release/GA/customer-data use.

## Open PR / Branch Check

| Command | Result | Notes |
|---|---|---|
| `git branch --no-merged main` | completed | Local output listed `codex/m7-05-prototype-visual-source-reset`, `codex/m7-ui-00-prototype-migration-index`, current `codex/m7-ui-00a-fixture-sanitization-map`, and `codex/m7-ui-00b-token-foundation-contract`. This worker does not resolve other worker branches. |
| `gh pr list --state open` | failed | `gh` is not installed in this shell: `zsh:1: command not found: gh`. Open PR truth could not be checked locally. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `git status --short --branch` | pass | Worker status shows exactly three untracked M7-UI-00A docs files. |
| `git ls-files --others --exclude-standard` | pass | Listed only `docs/admin-ui-fixture-sanitization-map.md`, `docs/evidence/M7/M7-UI-00A-fixture-sanitization-map.md`, `docs/specs/M7-UI-00A-fixture-sanitization-map.md`. |
| root/main `git status --short --branch` after repair | pass | `## main...origin/main`. |
| `git diff --check` | pass | No output. Note: files are untracked, so this is a mandatory command run but not sufficient by itself for new-file content. |
| supplemental `git diff --no-index --check /dev/null <new-file>` for each new file | pass | No whitespace errors reported for all three new docs files. |
| `node scripts/guards/pr-shape.mjs --base codex/m7-05-prototype-visual-source-reset --spec docs/specs/M7-UI-00A-fixture-sanitization-map.md --include-worktree` | failed then retried | Plain `node` is not in PATH: `zsh:1: command not found: node`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base codex/m7-05-prototype-visual-source-reset --spec docs/specs/M7-UI-00A-fixture-sanitization-map.md --include-worktree` | pass | `changedFiles: 3`, categories `docs: 3`, source changed files `0`, source net LOC `0`, new source files `0`. |

## Open Items

- The M7 evidence index still lists planned `M7-UI-01 Global Admin Frame`; this preflight slice was renumbered to `M7-UI-00A` to preserve that future implementation slot.
- No shared repo fixture implementation exists yet; future page implementation specs must define where synthetic fixtures live.
- No human retention/deletion decision for raw owner input sources is made by this docs-only slice.
