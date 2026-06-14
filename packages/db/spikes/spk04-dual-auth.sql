do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'uzmax_spk04_ci') then
    create role uzmax_spk04_ci nobypassrls;
  else
    alter role uzmax_spk04_ci nobypassrls;
  end if;
end $$;

create schema if not exists spk04;

create table if not exists spk04.tenant_member (
  user_id uuid not null,
  org_id uuid not null,
  tenant_id uuid not null,
  status text not null check (status in ('active', 'revoked')),
  cache_version integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, tenant_id)
);

create table if not exists spk04.permission_grant (
  user_id uuid not null,
  org_id uuid not null,
  tenant_id uuid not null,
  permission text not null,
  primary key (user_id, tenant_id, permission)
);

create table if not exists spk04.rls_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  tenant_id uuid not null,
  payload text not null,
  created_at timestamptz not null default now()
);

create table if not exists spk04.storage_objects (
  bucket_id text not null,
  object_path text not null,
  org_id uuid not null,
  tenant_id uuid not null,
  audit_tag text not null,
  primary key (bucket_id, object_path)
);

create table if not exists spk04.audit_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid,
  org_id uuid,
  tenant_id uuid,
  object_path text,
  decision text not null,
  created_at timestamptz not null default now()
);

alter table spk04.tenant_member enable row level security;
alter table spk04.permission_grant enable row level security;
alter table spk04.rls_items enable row level security;
alter table spk04.storage_objects enable row level security;
alter table spk04.audit_log enable row level security;

alter table spk04.tenant_member force row level security;
alter table spk04.permission_grant force row level security;
alter table spk04.rls_items force row level security;
alter table spk04.storage_objects force row level security;
alter table spk04.audit_log force row level security;

drop policy if exists spk04_tenant_member_deny_all on spk04.tenant_member;
create policy spk04_tenant_member_deny_all
  on spk04.tenant_member
  as restrictive
  for all
  using (false)
  with check (false);

drop policy if exists spk04_permission_grant_deny_all on spk04.permission_grant;
create policy spk04_permission_grant_deny_all
  on spk04.permission_grant
  as restrictive
  for all
  using (false)
  with check (false);

drop policy if exists spk04_storage_objects_deny_all on spk04.storage_objects;
create policy spk04_storage_objects_deny_all
  on spk04.storage_objects
  as restrictive
  for all
  using (false)
  with check (false);

drop policy if exists spk04_audit_log_deny_all on spk04.audit_log;
create policy spk04_audit_log_deny_all
  on spk04.audit_log
  as restrictive
  for all
  using (false)
  with check (false);

drop policy if exists spk04_rls_items_tenant_select on spk04.rls_items;
create policy spk04_rls_items_tenant_select
  on spk04.rls_items
  for select
  to uzmax_spk04_ci
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

revoke all on schema spk04 from public;
revoke all on all tables in schema spk04 from public;
grant usage on schema spk04 to uzmax_spk04_ci;
grant select on spk04.rls_items to uzmax_spk04_ci;
grant uzmax_spk04_ci to postgres;
