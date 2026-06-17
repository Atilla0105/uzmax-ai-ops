create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'uzmax_app_runtime') then
    create role uzmax_app_runtime nobypassrls;
  else
    alter role uzmax_app_runtime nobypassrls;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'platform_record_status') then
    create type platform_record_status as enum ('active', 'disabled', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'platform_membership_status') then
    create type platform_membership_status as enum ('active', 'revoked');
  end if;
end $$;

create table if not exists org (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status platform_record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint org_slug_not_blank check (length(btrim(slug)) > 0),
  constraint org_name_not_blank check (length(btrim(name)) > 0)
);

create table if not exists tenant (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  slug text not null,
  name text not null,
  status platform_record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_slug_not_blank check (length(btrim(slug)) > 0),
  constraint tenant_name_not_blank check (length(btrim(name)) > 0),
  constraint tenant_org_id_id_unique unique (org_id, id),
  constraint tenant_org_id_slug_unique unique (org_id, slug)
);

create table if not exists org_member (
  org_id uuid not null references org(id) on delete cascade,
  user_id uuid not null,
  role text not null,
  status platform_membership_status not null default 'active',
  cache_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (org_id, user_id),
  constraint org_member_role_not_blank check (length(btrim(role)) > 0),
  constraint org_member_cache_version_positive check (cache_version > 0)
);

create table if not exists tenant_member (
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  user_id uuid not null,
  role text not null,
  status platform_membership_status not null default 'active',
  cache_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (org_id, tenant_id, user_id),
  constraint tenant_member_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint tenant_member_role_not_blank check (length(btrim(role)) > 0),
  constraint tenant_member_cache_version_positive check (cache_version > 0)
);

create table if not exists permission_grant (
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  user_id uuid not null,
  permission text not null,
  created_at timestamptz not null default now(),
  primary key (org_id, tenant_id, user_id, permission),
  constraint permission_grant_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint permission_grant_tenant_member_fk foreign key (org_id, tenant_id, user_id)
    references tenant_member(org_id, tenant_id, user_id) on delete cascade,
  constraint permission_grant_permission_not_blank check (length(btrim(permission)) > 0)
);

create index if not exists tenant_org_id_idx on tenant(org_id);
create index if not exists org_member_user_status_idx on org_member(user_id, status);
create index if not exists tenant_member_user_status_idx on tenant_member(user_id, status);
create index if not exists tenant_member_org_user_status_idx
  on tenant_member(org_id, user_id, status);
create index if not exists permission_grant_user_tenant_idx
  on permission_grant(user_id, tenant_id);

alter table org enable row level security;
alter table tenant enable row level security;
alter table org_member enable row level security;
alter table tenant_member enable row level security;
alter table permission_grant enable row level security;

alter table org force row level security;
alter table tenant force row level security;
alter table org_member force row level security;
alter table tenant_member force row level security;
alter table permission_grant force row level security;

drop policy if exists platform_org_select_context on org;
create policy platform_org_select_context
  on org
  for select
  to uzmax_app_runtime
  using (
    id::text = current_setting('app.org_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
    and exists (
      select 1
      from tenant context_tenant
      where context_tenant.org_id = org.id
        and context_tenant.id::text = current_setting('app.tenant_id', true)
    )
  );

drop policy if exists platform_tenant_select_context on tenant;
create policy platform_tenant_select_context
  on tenant
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists platform_org_member_select_context on org_member;
create policy platform_org_member_select_context
  on org_member
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
    and exists (
      select 1
      from tenant context_tenant
      where context_tenant.org_id = org_member.org_id
        and context_tenant.id::text = current_setting('app.tenant_id', true)
    )
  );

drop policy if exists platform_tenant_member_select_context on tenant_member;
create policy platform_tenant_member_select_context
  on tenant_member
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists platform_permission_grant_select_context on permission_grant;
create policy platform_permission_grant_select_context
  on permission_grant
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

revoke all on table org from public;
revoke all on table tenant from public;
revoke all on table org_member from public;
revoke all on table tenant_member from public;
revoke all on table permission_grant from public;

grant select on table org to uzmax_app_runtime;
grant select on table tenant to uzmax_app_runtime;
grant select on table org_member to uzmax_app_runtime;
grant select on table tenant_member to uzmax_app_runtime;
grant select on table permission_grant to uzmax_app_runtime;
grant uzmax_app_runtime to postgres;
