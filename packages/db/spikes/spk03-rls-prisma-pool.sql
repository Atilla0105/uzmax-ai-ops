do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'uzmax_spk03_ci') then
    create role uzmax_spk03_ci nobypassrls;
  else
    alter role uzmax_spk03_ci nobypassrls;
  end if;
end $$;

create schema if not exists spk03;

create table if not exists spk03.rls_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  tenant_id uuid not null,
  payload text not null,
  created_at timestamptz not null default now()
);

alter table spk03.rls_items enable row level security;
alter table spk03.rls_items force row level security;

drop policy if exists spk03_rls_items_tenant_select on spk03.rls_items;
create policy spk03_rls_items_tenant_select
  on spk03.rls_items
  for select
  to uzmax_spk03_ci
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

revoke all on schema spk03 from public;
revoke all on all tables in schema spk03 from public;
grant usage on schema spk03 to uzmax_spk03_ci;
grant select on spk03.rls_items to uzmax_spk03_ci;
grant uzmax_spk03_ci to postgres;

delete from spk03.rls_items;
insert into spk03.rls_items (org_id, tenant_id, payload)
values
  (
    '00000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'tenant-a-row-1'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'tenant-a-row-2'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'tenant-b-row-1'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'tenant-b-row-2'
  );
