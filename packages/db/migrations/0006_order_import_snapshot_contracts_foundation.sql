do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_snapshot_source_kind') then
    create type order_snapshot_source_kind as enum ('import_snapshot');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_snapshot_record_status') then
    create type order_snapshot_record_status as enum ('active', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'import_job_status') then
    create type import_job_status as enum (
      'queued',
      'running',
      'completed',
      'completed_with_errors',
      'failed',
      'rolled_back'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'import_row_error_severity') then
    create type import_row_error_severity as enum ('warning', 'error');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_query_kind') then
    create type order_query_kind as enum (
      'order_ref',
      'batch_ref',
      'customer_ref',
      'external_ref',
      'search_ref'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'order_query_outcome') then
    create type order_query_outcome as enum (
      'hit',
      'miss',
      'stale',
      'degraded',
      'handoff'
    );
  end if;
end $$;

create table if not exists import_job (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  file_ref text not null,
  file_sha256 text,
  status import_job_status not null default 'queued',
  total_rows integer not null default 0,
  successful_rows integer not null default 0,
  failed_rows integer not null default 0,
  error_report_ref text,
  rollback_of_job_id uuid,
  created_by_user_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint import_job_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint import_job_scope_reference_unique unique (id, org_id, tenant_id),
  constraint import_job_rollback_fk
    foreign key (rollback_of_job_id, org_id, tenant_id)
    references import_job(id, org_id, tenant_id) on delete restrict,
  constraint import_job_file_ref_not_blank check (length(btrim(file_ref)) > 0),
  constraint import_job_file_sha256_not_blank
    check (file_sha256 is null or length(btrim(file_sha256)) > 0),
  constraint import_job_counts_non_negative
    check (total_rows >= 0 and successful_rows >= 0 and failed_rows >= 0),
  constraint import_job_counts_within_total
    check (successful_rows + failed_rows <= total_rows),
  constraint import_job_error_report_ref_not_blank
    check (error_report_ref is null or length(btrim(error_report_ref)) > 0),
  constraint import_job_completed_after_started
    check (completed_at is null or started_at is null or completed_at >= started_at),
  constraint import_job_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists order_snapshot (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  customer_id uuid,
  import_job_id uuid,
  external_order_ref text not null,
  external_batch_ref text,
  order_status_ref text not null,
  source_kind order_snapshot_source_kind not null default 'import_snapshot',
  source_ref text not null,
  source_updated_at timestamptz not null,
  expires_at timestamptz not null,
  payload_summary jsonb not null default '{}'::jsonb,
  status order_snapshot_record_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_snapshot_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint order_snapshot_customer_fk
    foreign key (customer_id, org_id, tenant_id)
    references customer(id, org_id, tenant_id) on delete restrict,
  constraint order_snapshot_import_job_fk
    foreign key (import_job_id, org_id, tenant_id)
    references import_job(id, org_id, tenant_id) on delete restrict,
  constraint order_snapshot_scope_reference_unique unique (id, org_id, tenant_id),
  constraint order_snapshot_external_order_unique
    unique (org_id, tenant_id, external_order_ref),
  constraint order_snapshot_external_order_ref_not_blank
    check (length(btrim(external_order_ref)) > 0),
  constraint order_snapshot_external_batch_ref_not_blank
    check (external_batch_ref is null or length(btrim(external_batch_ref)) > 0),
  constraint order_snapshot_order_status_ref_not_blank
    check (length(btrim(order_status_ref)) > 0),
  constraint order_snapshot_source_ref_not_blank check (length(btrim(source_ref)) > 0),
  constraint order_snapshot_expires_after_source_update
    check (expires_at > source_updated_at),
  constraint order_snapshot_payload_summary_object
    check (jsonb_typeof(payload_summary) = 'object'),
  constraint order_snapshot_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists import_row_error (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  import_job_id uuid not null,
  row_number integer not null,
  column_key text,
  error_code text not null,
  message_ref text not null,
  row_ref text,
  severity import_row_error_severity not null default 'error',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint import_row_error_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint import_row_error_job_fk
    foreign key (import_job_id, org_id, tenant_id)
    references import_job(id, org_id, tenant_id) on delete cascade,
  constraint import_row_error_scope_reference_unique unique (id, org_id, tenant_id),
  constraint import_row_error_row_number_positive check (row_number > 0),
  constraint import_row_error_column_key_not_blank
    check (column_key is null or length(btrim(column_key)) > 0),
  constraint import_row_error_code_not_blank check (length(btrim(error_code)) > 0),
  constraint import_row_error_message_ref_not_blank check (length(btrim(message_ref)) > 0),
  constraint import_row_error_row_ref_not_blank
    check (row_ref is null or length(btrim(row_ref)) > 0),
  constraint import_row_error_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists order_query_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  customer_id uuid,
  order_snapshot_id uuid,
  query_kind order_query_kind not null,
  query_ref text not null,
  outcome order_query_outcome not null,
  stale_snapshot_used boolean not null default false,
  handoff_required boolean not null default false,
  reason_ref text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint order_query_log_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint order_query_log_customer_fk
    foreign key (customer_id, org_id, tenant_id)
    references customer(id, org_id, tenant_id) on delete restrict,
  constraint order_query_log_snapshot_fk
    foreign key (order_snapshot_id, org_id, tenant_id)
    references order_snapshot(id, org_id, tenant_id) on delete restrict,
  constraint order_query_log_scope_reference_unique unique (id, org_id, tenant_id),
  constraint order_query_log_query_ref_not_blank check (length(btrim(query_ref)) > 0),
  constraint order_query_log_reason_ref_not_blank
    check (reason_ref is null or length(btrim(reason_ref)) > 0),
  constraint order_query_log_stale_outcome_matches_flag
    check (outcome <> 'stale' or stale_snapshot_used),
  constraint order_query_log_handoff_outcome_matches_flag
    check (outcome <> 'handoff' or handoff_required),
  constraint order_query_log_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists import_job_scope_status_created_idx
  on import_job(org_id, tenant_id, status, created_at);
create index if not exists import_job_rollback_idx
  on import_job(org_id, tenant_id, rollback_of_job_id);
create index if not exists order_snapshot_batch_idx
  on order_snapshot(org_id, tenant_id, external_batch_ref);
create index if not exists order_snapshot_customer_status_idx
  on order_snapshot(org_id, tenant_id, customer_id, status);
create index if not exists order_snapshot_expires_idx
  on order_snapshot(org_id, tenant_id, expires_at);
create index if not exists import_row_error_job_row_idx
  on import_row_error(org_id, tenant_id, import_job_id, row_number);
create index if not exists order_query_log_kind_outcome_idx
  on order_query_log(org_id, tenant_id, query_kind, outcome, occurred_at);
create index if not exists order_query_log_customer_idx
  on order_query_log(org_id, tenant_id, customer_id, occurred_at);
create index if not exists order_query_log_snapshot_idx
  on order_query_log(org_id, tenant_id, order_snapshot_id);

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
        ('import_job'),
        ('order_snapshot'),
        ('import_row_error'),
        ('order_query_log')
    ) as order_import_tables(table_name)
  loop
    execute format('alter table %I enable row level security', scoped_table);
    execute format('alter table %I force row level security', scoped_table);

    execute format(
      'drop policy if exists %I on %I',
      'm4_order_import_' || scoped_table || '_read_scope',
      scoped_table
    );
    execute format(
      'create policy %I on %I for select to uzmax_app_runtime using (%s)',
      'm4_order_import_' || scoped_table || '_read_scope',
      scoped_table,
      scope_check
    );

    execute format(
      'drop policy if exists %I on %I',
      'm4_order_import_' || scoped_table || '_create_scope',
      scoped_table
    );
    execute format(
      'create policy %I on %I for insert to uzmax_app_runtime with check (%s)',
      'm4_order_import_' || scoped_table || '_create_scope',
      scoped_table,
      scope_check
    );

    execute format(
      'drop policy if exists %I on %I',
      'm4_order_import_' || scoped_table || '_change_scope',
      scoped_table
    );
    execute format(
      'create policy %I on %I for update to uzmax_app_runtime using (%s) with check (%s)',
      'm4_order_import_' || scoped_table || '_change_scope',
      scoped_table,
      scope_check,
      scope_check
    );
  end loop;
end $$;

revoke all on table import_job from public;
revoke all on table order_snapshot from public;
revoke all on table import_row_error from public;
revoke all on table order_query_log from public;

grant select, insert, update on table import_job to uzmax_app_runtime;
grant select, insert, update on table order_snapshot to uzmax_app_runtime;
grant select, insert, update on table import_row_error to uzmax_app_runtime;
grant select, insert, update on table order_query_log to uzmax_app_runtime;
