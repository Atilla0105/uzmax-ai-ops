do $$
begin
  if not exists (select 1 from pg_type where typname = 'config_version_domain') then
    create type config_version_domain as enum (
      'business_config',
      'feature_flag',
      'template_copy'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'config_version_status') then
    create type config_version_status as enum (
      'draft',
      'active',
      'rolled_back',
      'archived'
    );
  end if;
end $$;

create table if not exists config_version (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  config_domain config_version_domain not null,
  config_key text not null,
  version integer not null,
  status config_version_status not null default 'draft',
  payload jsonb not null,
  created_by_user_id uuid not null,
  previous_version_id uuid references config_version(id) on delete set null,
  rollback_of_version_id uuid references config_version(id) on delete set null,
  reason text,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  constraint config_version_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint config_version_scope_reference_unique
    unique (id, org_id, tenant_id, config_domain, config_key),
  constraint config_version_tenant_reference_unique
    unique (id, org_id, tenant_id),
  constraint config_version_identity_unique
    unique (org_id, tenant_id, config_domain, config_key, version),
  constraint config_version_previous_scope_fk
    foreign key (
      previous_version_id,
      org_id,
      tenant_id,
      config_domain,
      config_key
    )
    references config_version(
      id,
      org_id,
      tenant_id,
      config_domain,
      config_key
    ) on delete restrict,
  constraint config_version_rollback_scope_fk
    foreign key (
      rollback_of_version_id,
      org_id,
      tenant_id,
      config_domain,
      config_key
    )
    references config_version(
      id,
      org_id,
      tenant_id,
      config_domain,
      config_key
    ) on delete restrict,
  constraint config_version_key_not_blank check (length(btrim(config_key)) > 0),
  constraint config_version_version_positive check (version > 0),
  constraint config_version_payload_object check (jsonb_typeof(payload) = 'object')
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  actor_user_id uuid not null,
  event_type text not null,
  module text not null,
  action text not null,
  object_type text not null,
  object_id text,
  content jsonb not null,
  before_version_id uuid references config_version(id) on delete set null,
  after_version_id uuid references config_version(id) on delete set null,
  trace_id text,
  occurred_at timestamptz not null default now(),
  constraint audit_log_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint audit_log_before_version_scope_fk
    foreign key (before_version_id, org_id, tenant_id)
    references config_version(id, org_id, tenant_id) on delete restrict,
  constraint audit_log_after_version_scope_fk
    foreign key (after_version_id, org_id, tenant_id)
    references config_version(id, org_id, tenant_id) on delete restrict,
  constraint audit_log_event_type_not_blank check (length(btrim(event_type)) > 0),
  constraint audit_log_module_not_blank check (length(btrim(module)) > 0),
  constraint audit_log_action_not_blank check (length(btrim(action)) > 0),
  constraint audit_log_object_type_not_blank check (length(btrim(object_type)) > 0),
  constraint audit_log_content_before_after check (
    jsonb_typeof(content) = 'object'
    and content ? 'before'
    and content ? 'after'
  )
);

create index if not exists config_version_scope_status_idx
  on config_version(org_id, tenant_id, config_domain, config_key, status);
create index if not exists config_version_previous_idx
  on config_version(previous_version_id);
create index if not exists config_version_rollback_idx
  on config_version(rollback_of_version_id);
create index if not exists audit_log_scope_time_idx
  on audit_log(org_id, tenant_id, occurred_at);
create index if not exists audit_log_event_time_idx
  on audit_log(event_type, occurred_at);
create index if not exists audit_log_object_idx
  on audit_log(object_type, object_id);

alter table config_version enable row level security;
alter table audit_log enable row level security;

alter table config_version force row level security;
alter table audit_log force row level security;

drop policy if exists governance_config_version_select_context on config_version;
create policy governance_config_version_select_context
  on config_version
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists governance_config_version_insert_context on config_version;
create policy governance_config_version_insert_context
  on config_version
  for insert
  to uzmax_app_runtime
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists governance_audit_log_select_context on audit_log;
create policy governance_audit_log_select_context
  on audit_log
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists governance_audit_log_insert_context on audit_log;
create policy governance_audit_log_insert_context
  on audit_log
  for insert
  to uzmax_app_runtime
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

revoke all on table config_version from public;
revoke all on table audit_log from public;

grant select, insert on table config_version to uzmax_app_runtime;
grant select, insert on table audit_log to uzmax_app_runtime;
