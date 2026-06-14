# SPK-04 双鉴权链路证据

> evidence_id: SPK-04-dual-auth
> milestone: M0
> status: pending_ci_secret
> created_at: 2026-06-14
> updated_at: 2026-06-14
> owner: 项目 owner 确认权限、数据和体验风险；AI agent 执行 spike、验证和归档
> sensitive_data_location: GitHub Actions secrets / local env only; no secret in repo
> redaction_status: no secret, signed URL, token or customer data included

## 当前结论

SPK-04 implementation is ready for CI execution but not yet accepted. Supabase dev project has the spike-only `spk04` schema, RLS policies, restricted role and 0 security advisor lints. Local repo gates pass, including Prisma generate, static guards, build, size and Playwright. Final acceptance is blocked only by adding the two Supabase API key secrets to GitHub Actions and capturing a passing CI run.

Gate 1 remains blocked until this evidence status is changed to `accepted`.

## 环境

| 项目 | 值 |
|---|---|
| Supabase project | `uzmax-dev` / `enyocaykcgcfcswycujg` |
| Region | `ap-south-1` |
| Postgres | 17.6 |
| Auth | available; SPK-04 harness uses password flow and `auth.getUser(jwt)` |
| Storage | available; SPK-04 harness creates private bucket `spk04-dual-auth` during the run |
| RLS role | `uzmax_spk04_ci`, `rolbypassrls = false` |
| Sensitive values | `UZMAX_RLS_DATABASE_URL`, `UZMAX_SUPABASE_PUBLISHABLE_KEY`, `UZMAX_SUPABASE_SECRET_KEY` |

## Applied Spike Objects

The SQL shape is recorded in `packages/db/spikes/spk04-dual-auth.sql`.

Applied to Supabase dev via Supabase connector:

- `spk04` schema.
- `spk04.tenant_member`, `spk04.permission_grant`, `spk04.rls_items`, `spk04.storage_objects`, `spk04.audit_log`.
- RLS enabled and forced on all `spk04` tables.
- deny-all policies on backend fact/audit tables.
- tenant select policy on `spk04.rls_items` using `current_setting('app.org_id', true)` and `current_setting('app.tenant_id', true)`.
- restricted role `uzmax_spk04_ci` with `nobypassrls`.
- `grant uzmax_spk04_ci to postgres` so the pooler `postgres.<project-ref>` session can `SET LOCAL ROLE uzmax_spk04_ci` before tenant reads.

No customer, order, conversation, knowledge-base or production business schema was created.

## Verified Commands And Results

| Check | Command / method | Result |
|---|---|---|
| Baseline tests before work | `npm test` | passed; 24 tests, 0 failures |
| Baseline typecheck | `npm run typecheck` | passed |
| Baseline lint | `npm run lint` | passed |
| Supabase project discovery | Supabase connector `_list_projects` | passed; `uzmax-dev` is ACTIVE_HEALTHY |
| Existing secret inventory | `gh secret list --repo Atilla0105/uzmax-ai-ops` | passed; only `UZMAX_RLS_DATABASE_URL` currently exists |
| SQL/RLS setup | Supabase connector applying `packages/db/spikes/spk04-dual-auth.sql` | passed |
| Role check | Supabase connector query `pg_roles` | passed; `uzmax_spk04_ci.rolbypassrls = false` |
| RLS force check | Supabase connector query `pg_class` | passed; all 5 `spk04` tables have `relrowsecurity = true`, `relforcerowsecurity = true` |
| Policy check | Supabase connector query `pg_policies` | passed; deny-all policies plus tenant select policy present |
| Security advisors | Supabase connector `_get_advisors(type=security)` | passed; no lints |
| Dependency install | `npm ci` / `npm install` after package alignment | passed; Prisma CLI and `@prisma/client` resolve from root workspace |
| Prisma generate | `npm run -w @uzmax/db prisma:generate` | passed; generated Prisma Client v6.19.3 to root `node_modules/@prisma/client` |
| Local format | `npm run format:check` | passed after scoped Prettier write |
| Local typecheck | `npm run typecheck` | passed |
| Local lint | `npm run lint` | passed |
| Dependency boundaries | `npm run depcruise` | passed; no violations |
| Duplicate detection | `npm run jscpd` | passed; 0 clones |
| Unused/dead code scan | `npm run knip` | passed |
| Unit/governance tests | `npm test` | passed; 24 tests, 0 failures |
| Production build | `npm run build` | passed |
| Forbidden terms guard | `npm run guard:forbidden-terms` | passed |
| Eval trigger guard | `npm run guard:eval-triggers -- --base origin/main` | passed; no eval-triggering paths |
| Doc trigger guard | `npm run guard:doc-triggers` | passed |
| Audit | `npm audit --audit-level=high` | passed; 0 vulnerabilities |
| Bundle size | `npm run size` | passed; 51.13 kB brotlied vs 250 kB limit |
| Browser smoke | `npm run playwright` | passed; 1 desktop Chromium test |
| Whitespace check | `git diff --check` | passed |
| Source budget | `git diff --numstat origin/main` | passed; source net LOC 580, changed source files 3, new source files 2 |
| Local secret inventory | `printenv` name-only check | blocked locally; `UZMAX_RLS_DATABASE_URL`, `UZMAX_SUPABASE_PUBLISHABLE_KEY`, `UZMAX_SUPABASE_SECRET_KEY` are not set in this shell |

## CI Hook

`.github/workflows/ci.yml` includes:

- `npm run -w @uzmax/db prisma:generate`
- `UZMAX_RLS_SET_ROLE=uzmax_spk03_ci npm run -w @uzmax/db spike:rls-prisma-pool`
- `UZMAX_RLS_SET_ROLE=uzmax_spk04_ci npm run -w @uzmax/authz spike:dual-auth`

Expected GitHub Actions secrets:

- `UZMAX_RLS_DATABASE_URL`: existing Supabase transaction pooler URL for project `enyocaykcgcfcswycujg`; CI appends `connection_limit=16&pool_timeout=60`.
- `UZMAX_SUPABASE_PUBLISHABLE_KEY`: Supabase dev publishable or legacy anon key.
- `UZMAX_SUPABASE_SECRET_KEY`: Supabase dev secret or legacy service_role key; backend/CI only.

If any required secret is missing, the SPK-04 job fails instead of silently skipping.

## Harness Coverage

`packages/authz/scripts/run-dual-auth-spike.mjs` covers:

| Case | Expected result |
|---|---|
| JWT business claim scan | no `permissions`, `tenantIds`, `tenant_ids`, `orgId`, `org_id` business authorization claim |
| HTTP tenant A whoami + RLS | only tenant A row returned |
| HTTP tenant B whoami + RLS | only tenant B row returned |
| Missing RLS context | zero rows |
| Missing token | 401 |
| Expired-token claim shape | 401 before authorization |
| Valid identity switching to unauthorized tenant | 403 |
| Refresh token flow | new access token rebuilds context |
| Storage signed URL in selected tenant | allowed and audited |
| Storage cross-tenant object | 403 and audited denied |
| Storage forged path | 403 |
| Revoked membership | HTTP 403; existing WS context must reconnect |

The harness does not print tokens, signed URLs, API keys or passwords. It logs only case labels, test user UUIDs and token hashes.

## Official Reference Notes

- Supabase Auth JavaScript `auth.getUser(jwt)` performs a network request to Auth and returns an authentic user for authorization preconditions.
- Supabase JWT docs recommend avoiding custom shared-secret verification when the project uses shared secret signing; backend can use Auth server verification.
- Supabase Storage docs state private objects need time-limited signed URLs and that service keys must stay server-side.
- Supabase Storage docs note signed URLs use a Storage signing key separate from Auth JWT signing keys, so short expiry and backend auditing are required.
- Supabase database security docs distinguish grants from RLS policies; both must be considered.

## Pending Acceptance Evidence

After GitHub secrets are added, rerun CI and update this section with:

- Accepted GitHub Actions run URL.
- Job URL.
- Head SHA.
- SPK-04 JSON result `status = passed` and case list.
- Confirmation that full CI gate passed.

## Remaining Risks

- Natural access-token expiry has not been proven by waiting past Supabase's configured token lifetime. The harness proves the backend rejects an expired-claim token before authorization and verifies real signed tokens through Auth; staging should add a low-expiry or equivalent real expired-token proof.
- Evidence is from Supabase dev only. Staging/prod must have separate secrets and evidence before real customer data.
- Signed URLs remain valid until their expiry; sensitive file paths require short TTLs and server-side audit.

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending_secret_and_pr_review | 需要新增两个 GitHub Actions secrets 后复核 CI 和权限/Storage 风险 |
| AI agent | implementation_ready | SQL/RLS 基线、代码、CI hook、ADR 和 evidence 已准备；等待 CI 实跑 |
