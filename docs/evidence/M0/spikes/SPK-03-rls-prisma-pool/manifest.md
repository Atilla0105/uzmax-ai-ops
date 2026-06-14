# SPK-03 RLS x Prisma x 连接池证据

> evidence_id: SPK-03-rls-prisma-pool
> milestone: M0
> status: accepted
> created_at: 2026-06-14
> updated_at: 2026-06-14
> owner: 项目 owner 确认数据库 secret 与隔离风险；AI agent 执行 spike、验证和归档
> sensitive_data_location: GitHub Actions secret `UZMAX_RLS_DATABASE_URL` / local env only; no secret in repo
> redaction_status: no secret or customer data included

## 当前结论

SPK-03 已 accepted。真实 Supabase SQL/RLS 基线已建立；GitHub Actions 已通过 Supabase transaction pooler、Prisma batch `$transaction`、`SET LOCAL ROLE`、事务内 `set_config(..., true)` 注入上下文完成 2000 次并发交错请求，零串话。

Gate 1 不再被 SPK-03 技术证据阻断；项目 owner 的最终风险确认仍通过 PR review / branch protection 承接。

## 环境

| 项目 | 值 |
|---|---|
| Supabase project | `uzmax-dev` / `enyocaykcgcfcswycujg` |
| Region | `ap-south-1` |
| Postgres | 17.6 |
| Pooler host accepted | `aws-1-ap-south-1.pooler.supabase.com` |
| Session pooler port | 5432 tested but not accepted for CI proof |
| Transaction pooler port | 6543 accepted |
| Prisma pool params in CI | `pgbouncer=true`, `sslmode=require`, `connection_limit=16`, `pool_timeout=60` |
| Direct host | `db.enyocaykcgcfcswycujg.supabase.co` did not resolve from local environment |
| Prisma version | 6.19.3 |

## Applied Spike Objects

The SQL shape is recorded in `packages/db/spikes/spk03-rls-prisma-pool.sql`.

Applied to Supabase dev via Supabase connector:

- `spk03` schema.
- `spk03.rls_items` table.
- RLS enabled and forced on `spk03.rls_items`.
- tenant select policy using `current_setting('app.org_id', true)` and `current_setting('app.tenant_id', true)`.
- restricted role `uzmax_spk03_ci` with `nobypassrls`.
- `grant uzmax_spk03_ci to postgres` so a `postgres.<project-ref>` pooler session can `SET LOCAL ROLE uzmax_spk03_ci` before tenant reads.
- two rows for tenant A and two rows for tenant B.

No customer, order, conversation, knowledge-base or production business schema was created.

## Verified Commands And Results

| Check | Command / method | Result |
|---|---|---|
| Supabase read connectivity | Supabase connector `select current_database(), current_user, current_setting('server_version')` | passed; database `postgres`, user `postgres`, server `17.6` |
| Role presence | Supabase connector `select rolname, rolcanlogin, rolbypassrls from pg_roles where rolname like 'uzmax_spk03%'` | passed; role `uzmax_spk03_ci` can login and `rolbypassrls = false` |
| RLS active under restricted role | Supabase connector transaction with `set local role uzmax_spk03_ci` | passed; `current_user = uzmax_spk03_ci`, `row_security_active = true` |
| Tenant A isolation through SQL | same connector transaction with tenant A context | passed; only `tenant-a-row-1`, `tenant-a-row-2` returned |
| Prisma client generation | `npm ci`; `npm run -w @uzmax/db prisma:generate` | passed locally after cleaning stale workspace-local `packages/db/node_modules` |
| npm high audit | `npm audit --audit-level=high` | passed locally; no vulnerabilities reported after pinning Prisma 6.19.3 |
| Pooler custom role login | Prisma harness with `uzmax_spk03_ci.<project-ref>` session pooler username | failed; Supavisor returned `tenant/user ... not found` |
| Pooler unqualified custom role login | Prisma harness with `uzmax_spk03_ci` session pooler username | failed; Supavisor returned `no tenant identifier provided` |
| Privileged role password rotation | Supabase connector `alter role postgres with password ...` | failed; permission denied to alter privileged role |
| Missing GitHub secret guard | GitHub Actions run `27495488912` before secret configuration | failed as expected; `UZMAX_RLS_DATABASE_URL is required` |
| Wrong pooler host guard | GitHub Actions with `aws-0-ap-south-1.pooler.supabase.com` | failed as expected; Supavisor returned `tenant/user postgres.enyocaykcgcfcswycujg not found` |
| Accepted transaction pooler harness | GitHub Actions run `27499077532`, job `81278472494` | passed; SPK-03 step `12:38:08Z` to `12:41:17Z`; `totalRequests = 2000`, `requestsPerTenant = 1000`, `concurrency = 16`, `crossTenantRows = 0` |
| Full CI gate | GitHub Actions run `27499077532` | passed; format, typecheck, lint, depcruise, jscpd, knip, forbidden terms, eval/doc guards, PR shape, Prisma generate, SPK-03, test, build, size and Playwright all succeeded |

## CI Hook

`.github/workflows/ci.yml` now includes:

- `npm run -w @uzmax/db prisma:generate`
- `UZMAX_RLS_SET_ROLE=uzmax_spk03_ci npm run -w @uzmax/db spike:rls-prisma-pool`

Expected secret:

- `UZMAX_RLS_DATABASE_URL`: Supabase transaction pooler URL for project `enyocaykcgcfcswycujg`, with password stored only in GitHub Actions secret. CI appends `connection_limit=16&pool_timeout=60`; the repository never stores the secret value.

If this secret is missing or points to the wrong pooler host, GitHub Actions fails instead of silently skipping SPK-03.

## Official Reference Notes

- Supabase Connect to Postgres docs: session pooler uses port 5432 and transaction pooler uses port 6543; direct connections may require IPv6 or the IPv4 add-on.
- Supabase Connect to Postgres docs: transaction mode does not support prepared statements.
- Supabase Prisma docs: Prisma should use the Supavisor session pooler string unless direct connection is available.

## Accepted Evidence Snapshot

Rerun command shape:

```bash
npm run -w @uzmax/db prisma:generate
UZMAX_RLS_SET_ROLE=uzmax_spk03_ci \
UZMAX_RLS_SPIKE_CONCURRENCY=16 \
npm run -w @uzmax/db spike:rls-prisma-pool
```

Accepted GitHub Actions evidence:

- Run: `https://github.com/Atilla0105/uzmax-ai-ops/actions/runs/27499077532`
- Job: `https://github.com/Atilla0105/uzmax-ai-ops/actions/runs/27499077532/job/81278472494`
- Head SHA: `ee399f99a591c34814c69fdfeada5494cf2ac215`
- SPK-03 result: `status = passed`, `totalRequests = 2000`, `requestsPerTenant = 1000`, per-tenant counts `1000 / 1000`, `crossTenantRows = 0`, `concurrency = 16`, `checkedAt = 2026-06-14T12:41:17.453Z`.
- Negative cases: missing context, wrong tenant context and transaction context cleanup are part of the same harness before the 2000-request run; CI would fail before printing `status = passed` if any negative case returned rows.

## Remaining Risks

- Evidence is from Supabase dev project only; staging/production must provide separate secrets and evidence before real customer data.
- The accepted path depends on `SET LOCAL ROLE` to avoid privileged `postgres` bypassing RLS. Production repository helpers must enforce this; business code must not call Prisma Client directly.
- Transaction pooler performance required explicit Prisma `connection_limit=16&pool_timeout=60` in CI. If pool size, region or provider settings change, rerun SPK-03 before treating the path as safe.

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending_pr_review | 已配置 GitHub Actions secret；最终隔离风险确认通过 PR review / branch protection |
| AI agent | evidence_accepted | SQL/RLS baseline、Prisma harness、负例、2000 次并发零串话和完整 CI 已验证 |
