do $$
begin
  if not exists (select 1 from pg_type where typname = 'export_job_status') then
    create type export_job_status as enum (
      'draft',
      'queued',
      'completed',
      'failed',
      'expired'
    );
  end if;
end $$;

create table if not exists login_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  member_user_id uuid not null,
  login_type text not null,
  ip_hash text,
  location_ref text,
  device text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint login_log_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint login_log_scope_reference_unique unique (id, org_id, tenant_id),
  constraint login_log_type_not_blank check (length(btrim(login_type)) > 0),
  constraint login_log_ip_hash_not_blank
    check (ip_hash is null or length(btrim(ip_hash)) > 0),
  constraint login_log_location_ref_controlled
    check (
      location_ref is null
      or location_ref ~ '^(controlled|manifest|redaction|storage)://[A-Za-z0-9][A-Za-z0-9_:/.-]{0,160}$'
    ),
  constraint login_log_device_not_blank
    check (device is null or length(btrim(device)) > 0),
  constraint login_log_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists presence_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  member_user_id uuid not null,
  status text not null,
  update_method text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint presence_log_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint presence_log_scope_reference_unique unique (id, org_id, tenant_id),
  constraint presence_log_status_not_blank check (length(btrim(status)) > 0),
  constraint presence_log_update_method_not_blank check (length(btrim(update_method)) > 0),
  constraint presence_log_window_order
    check (ended_at is null or ended_at >= started_at),
  constraint presence_log_duration_non_negative
    check (duration_seconds is null or duration_seconds >= 0),
  constraint presence_log_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists export_job (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  created_by_user_id uuid not null,
  scope jsonb not null,
  filters jsonb not null,
  status export_job_status not null default 'draft',
  file_ref text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint export_job_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint export_job_scope_reference_unique unique (id, org_id, tenant_id),
  constraint export_job_scope_object check (jsonb_typeof(scope) = 'object'),
  constraint export_job_filters_object check (jsonb_typeof(filters) = 'object'),
  constraint export_job_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint export_job_file_ref_controlled
    check (
      file_ref is null
      or file_ref ~ '^(controlled|manifest|redaction|storage)://[A-Za-z0-9][A-Za-z0-9_:/.-]{0,160}$'
    )
);

create index if not exists login_log_scope_member_time_idx
  on login_log(org_id, tenant_id, member_user_id, occurred_at);
create index if not exists login_log_scope_time_idx
  on login_log(org_id, tenant_id, occurred_at);
create index if not exists presence_log_scope_member_time_idx
  on presence_log(org_id, tenant_id, member_user_id, started_at);
create index if not exists presence_log_scope_status_time_idx
  on presence_log(org_id, tenant_id, status, started_at);
create index if not exists export_job_scope_status_created_idx
  on export_job(org_id, tenant_id, status, created_at);
create index if not exists export_job_creator_created_idx
  on export_job(created_by_user_id, created_at);

do $$
declare
  scoped_table text;
  scope_check text := concat_ws(
    E'\n    and ',
    'org_id::text = current_setting(''app.org_id'', true)',
    'tenant_id::text = current_setting(''app.tenant_id'', true)',
    'nullif(current_setting(''app.org_id'', true), '''') is not null',
    'nullif(current_setting(''app.tenant_id'', true), '''') is not null'
  );
begin
  for scoped_table in
    select table_name
    from (
      values
        ('login_log'),
        ('presence_log'),
        ('export_job')
    ) as m5r05_tables(table_name)
  loop
    execute format('alter table %I enable row level security', scoped_table);
    execute format('alter table %I force row level security', scoped_table);

    execute format(
      'drop policy if exists %I on %I',
      'm5r05_' || scoped_table || '_select_scope',
      scoped_table
    );
    execute format(
      'create policy %I on %I for select to uzmax_app_runtime using (%s)',
      'm5r05_' || scoped_table || '_select_scope',
      scoped_table,
      scope_check
    );

    execute format(
      'drop policy if exists %I on %I',
      'm5r05_' || scoped_table || '_insert_scope',
      scoped_table
    );
    execute format(
      'create policy %I on %I for insert to uzmax_app_runtime with check (%s)',
      'm5r05_' || scoped_table || '_insert_scope',
      scoped_table,
      scope_check
    );
  end loop;
end $$;

revoke all on table login_log from public;
revoke all on table presence_log from public;
revoke all on table export_job from public;

grant select, insert on table login_log to uzmax_app_runtime;
grant select, insert on table presence_log to uzmax_app_runtime;
grant select, insert on table export_job to uzmax_app_runtime;
