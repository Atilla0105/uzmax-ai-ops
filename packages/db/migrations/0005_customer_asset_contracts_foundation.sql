do $$
begin
  if not exists (select 1 from pg_type where typname = 'customer_asset_record_status') then
    create type customer_asset_record_status as enum ('active', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'customer_identity_status') then
    create type customer_identity_status as enum ('active', 'merged', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'custom_field_value_type') then
    create type custom_field_value_type as enum (
      'text',
      'number',
      'boolean',
      'date',
      'json'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'tag_target_kind') then
    create type tag_target_kind as enum ('customer');
  end if;
end $$;

create table if not exists customer (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  display_label_ref text,
  preferred_language text,
  preferred_script text,
  journey_stage text,
  unresolved_issue_count integer not null default 0,
  is_blacklisted boolean not null default false,
  blacklisted_at timestamptz,
  is_unreachable boolean not null default false,
  unreachable_at timestamptz,
  status customer_asset_record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint customer_scope_reference_unique unique (id, org_id, tenant_id),
  constraint customer_display_label_ref_not_blank
    check (display_label_ref is null or length(btrim(display_label_ref)) > 0),
  constraint customer_unresolved_issue_count_non_negative
    check (unresolved_issue_count >= 0),
  constraint customer_blacklisted_timestamp_matches_flag
    check (is_blacklisted or blacklisted_at is null),
  constraint customer_unreachable_timestamp_matches_flag
    check (is_unreachable or unreachable_at is null),
  constraint customer_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists customer_identity (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  customer_id uuid not null,
  channel_connection_id uuid,
  identity_kind text not null,
  provider text not null,
  external_subject_ref text not null,
  status customer_identity_status not null default 'active',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_identity_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint customer_identity_customer_fk
    foreign key (customer_id, org_id, tenant_id)
    references customer(id, org_id, tenant_id) on delete cascade,
  constraint customer_identity_channel_fk
    foreign key (channel_connection_id, org_id, tenant_id)
    references channel_connection(id, org_id, tenant_id) on delete restrict,
  constraint customer_identity_scope_reference_unique unique (id, org_id, tenant_id),
  constraint customer_identity_external_ref_unique
    unique (org_id, tenant_id, provider, external_subject_ref),
  constraint customer_identity_kind_not_blank check (length(btrim(identity_kind)) > 0),
  constraint customer_identity_provider_not_blank check (length(btrim(provider)) > 0),
  constraint customer_identity_external_subject_ref_not_blank
    check (length(btrim(external_subject_ref)) > 0),
  constraint customer_identity_seen_order
    check (last_seen_at is null or last_seen_at >= first_seen_at),
  constraint customer_identity_metadata_object
    check (jsonb_typeof(metadata) = 'object')
);

create table if not exists custom_field_definition (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  field_key text not null,
  label text not null,
  value_type custom_field_value_type not null,
  status customer_asset_record_status not null default 'active',
  is_required boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_field_definition_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint custom_field_definition_scope_reference_unique
    unique (id, org_id, tenant_id),
  constraint custom_field_definition_key_unique unique (org_id, tenant_id, field_key),
  constraint custom_field_definition_key_not_blank check (length(btrim(field_key)) > 0),
  constraint custom_field_definition_label_not_blank check (length(btrim(label)) > 0),
  constraint custom_field_definition_config_object
    check (jsonb_typeof(config) = 'object')
);

create table if not exists customer_field_value (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  customer_id uuid not null,
  field_definition_id uuid not null,
  value jsonb not null,
  updated_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_field_value_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint customer_field_value_customer_fk
    foreign key (customer_id, org_id, tenant_id)
    references customer(id, org_id, tenant_id) on delete cascade,
  constraint customer_field_value_definition_fk
    foreign key (field_definition_id, org_id, tenant_id)
    references custom_field_definition(id, org_id, tenant_id) on delete cascade,
  constraint customer_field_value_scope_reference_unique unique (id, org_id, tenant_id),
  constraint customer_field_value_identity_unique
    unique (org_id, tenant_id, customer_id, field_definition_id),
  constraint customer_field_value_object check (jsonb_typeof(value) = 'object')
);

create table if not exists tag_definition (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  tag_key text not null,
  label text not null,
  target_kind tag_target_kind not null default 'customer',
  status customer_asset_record_status not null default 'active',
  color_token text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tag_definition_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint tag_definition_scope_reference_unique unique (id, org_id, tenant_id),
  constraint tag_definition_key_unique unique (org_id, tenant_id, target_kind, tag_key),
  constraint tag_definition_key_not_blank check (length(btrim(tag_key)) > 0),
  constraint tag_definition_label_not_blank check (length(btrim(label)) > 0),
  constraint tag_definition_color_token_not_blank
    check (color_token is null or length(btrim(color_token)) > 0),
  constraint tag_definition_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists tag_assignment (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  customer_id uuid not null,
  tag_definition_id uuid not null,
  assigned_by_user_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint tag_assignment_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint tag_assignment_customer_fk
    foreign key (customer_id, org_id, tenant_id)
    references customer(id, org_id, tenant_id) on delete cascade,
  constraint tag_assignment_definition_fk
    foreign key (tag_definition_id, org_id, tenant_id)
    references tag_definition(id, org_id, tenant_id) on delete cascade,
  constraint tag_assignment_scope_reference_unique unique (id, org_id, tenant_id),
  constraint tag_assignment_identity_unique
    unique (org_id, tenant_id, customer_id, tag_definition_id),
  constraint tag_assignment_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists customer_scope_status_updated_idx
  on customer(org_id, tenant_id, status, updated_at);
create index if not exists customer_scope_flags_idx
  on customer(org_id, tenant_id, is_blacklisted, is_unreachable);
create index if not exists customer_identity_scope_customer_status_idx
  on customer_identity(org_id, tenant_id, customer_id, status);
create index if not exists customer_identity_channel_idx on customer_identity(channel_connection_id);
create index if not exists custom_field_definition_scope_status_idx
  on custom_field_definition(org_id, tenant_id, status);
create index if not exists customer_field_value_definition_idx
  on customer_field_value(org_id, tenant_id, field_definition_id);
create index if not exists tag_definition_scope_target_status_idx
  on tag_definition(org_id, tenant_id, target_kind, status);
create index if not exists tag_assignment_definition_idx
  on tag_assignment(org_id, tenant_id, tag_definition_id);

do $$
declare
  policy_prefix text;
  table_name text;
  tenant_scope_predicate text;
begin
  tenant_scope_predicate := concat_ws(
    E'\n    and ',
    'org_id::text = current_setting(''app.org_id'', true)',
    'tenant_id::text = current_setting(''app.tenant_id'', true)',
    'nullif(current_setting(''app.org_id'', true), '''') is not null',
    'nullif(current_setting(''app.tenant_id'', true), '''') is not null'
  );

  for table_name in
    select unnest(array[
      'customer',
      'customer_identity',
      'custom_field_definition',
      'customer_field_value',
      'tag_definition',
      'tag_assignment'
    ])
  loop
    policy_prefix := format('m4_customer_asset_%s', table_name);

    execute format('alter table %I enable row level security', table_name);
    execute format('alter table %I force row level security', table_name);

    execute format('drop policy if exists %I on %I', policy_prefix || '_select_tenant_scope', table_name);
    execute format(
      'create policy %I on %I for select to uzmax_app_runtime using (%s)',
      policy_prefix || '_select_tenant_scope',
      table_name,
      tenant_scope_predicate
    );

    execute format('drop policy if exists %I on %I', policy_prefix || '_insert_tenant_scope', table_name);
    execute format(
      'create policy %I on %I for insert to uzmax_app_runtime with check (%s)',
      policy_prefix || '_insert_tenant_scope',
      table_name,
      tenant_scope_predicate
    );

    execute format('drop policy if exists %I on %I', policy_prefix || '_update_tenant_scope', table_name);
    execute format(
      'create policy %I on %I for update to uzmax_app_runtime using (%s) with check (%s)',
      policy_prefix || '_update_tenant_scope',
      table_name,
      tenant_scope_predicate,
      tenant_scope_predicate
    );
  end loop;
end $$;

revoke all on table customer from public;
revoke all on table customer_identity from public;
revoke all on table custom_field_definition from public;
revoke all on table customer_field_value from public;
revoke all on table tag_definition from public;
revoke all on table tag_assignment from public;

grant select, insert, update on table customer to uzmax_app_runtime;
grant select, insert, update on table customer_identity to uzmax_app_runtime;
grant select, insert, update on table custom_field_definition to uzmax_app_runtime;
grant select, insert, update on table customer_field_value to uzmax_app_runtime;
grant select, insert, update on table tag_definition to uzmax_app_runtime;
grant select, insert, update on table tag_assignment to uzmax_app_runtime;
