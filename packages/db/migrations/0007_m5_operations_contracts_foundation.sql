do $$
begin
  if not exists (select 1 from pg_type where typname = 'confirmation_item_kind') then
    create type confirmation_item_kind as enum (
      'knowledge_candidate',
      'profile_candidate',
      'eval_candidate',
      'conflict_candidate'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'confirmation_item_status') then
    create type confirmation_item_status as enum (
      'pending',
      'approved',
      'edited',
      'discarded',
      'blocked'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'distill_run_status') then
    create type distill_run_status as enum (
      'queued',
      'running',
      'completed',
      'failed',
      'skipped'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'distill_frequency') then
    create type distill_frequency as enum ('daily', 'weekly', 'paused');
  end if;

  if not exists (select 1 from pg_type where typname = 'ai_member_status') then
    create type ai_member_status as enum (
      'online',
      'manual_offline',
      'breaker_offline',
      'disabled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'ai_member_version_status') then
    create type ai_member_version_status as enum (
      'draft',
      'active',
      'archived',
      'rolled_back'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'ai_capability_key') then
    create type ai_capability_key as enum (
      'tutorial',
      'vision',
      'quote',
      'order_read',
      'business_draft'
    );
  end if;
end $$;

create table if not exists distill_run (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  status distill_run_status not null default 'queued',
  frequency distill_frequency not null default 'daily',
  source_window_start timestamptz not null,
  source_window_end timestamptz not null,
  candidate_limit integer not null default 10,
  candidate_count integer not null default 0,
  truncated_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  failure_reason_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint distill_run_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint distill_run_scope_reference_unique unique (id, org_id, tenant_id),
  constraint distill_run_source_window_order
    check (source_window_end >= source_window_start),
  constraint distill_run_candidate_limit_max check (candidate_limit between 0 and 10),
  constraint distill_run_counts_non_negative
    check (candidate_count >= 0 and truncated_count >= 0),
  constraint distill_run_candidate_count_within_limit
    check (candidate_count <= candidate_limit),
  constraint distill_run_completed_after_started
    check (completed_at is null or started_at is null or completed_at >= started_at),
  constraint distill_run_failure_reason_ref_not_blank
    check (failure_reason_ref is null or length(btrim(failure_reason_ref)) > 0),
  constraint distill_run_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists distill_health_daily (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  business_date date not null,
  frequency distill_frequency not null default 'daily',
  candidate_count integer not null default 0,
  approved_count integer not null default 0,
  discarded_count integer not null default 0,
  seven_day_pass_rate_bps integer not null default 0,
  consecutive_low_pass_days integer not null default 0,
  downshifted boolean not null default false,
  downshift_reason_ref text,
  recovery_audit_log_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint distill_health_daily_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint distill_health_daily_scope_reference_unique unique (id, org_id, tenant_id),
  constraint distill_health_daily_business_date_unique
    unique (org_id, tenant_id, business_date),
  constraint distill_health_daily_counts_non_negative check (
    candidate_count >= 0
    and approved_count >= 0
    and discarded_count >= 0
    and consecutive_low_pass_days >= 0
  ),
  constraint distill_health_daily_reviewed_counts_within_candidates
    check (approved_count + discarded_count <= candidate_count),
  constraint distill_health_daily_pass_rate_range
    check (seven_day_pass_rate_bps between 0 and 10000),
  constraint distill_health_daily_downshift_reason_ref_not_blank
    check (downshift_reason_ref is null or length(btrim(downshift_reason_ref)) > 0),
  constraint distill_health_daily_metadata_object
    check (jsonb_typeof(metadata) = 'object')
);

create table if not exists ai_member (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  member_key text not null,
  display_name text not null,
  status ai_member_status not null default 'online',
  active_version_id uuid,
  emergency_stopped_at timestamptz,
  breaker_reason_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_member_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint ai_member_scope_reference_unique unique (id, org_id, tenant_id),
  constraint ai_member_key_unique unique (org_id, tenant_id, member_key),
  constraint ai_member_key_not_blank check (length(btrim(member_key)) > 0),
  constraint ai_member_display_name_not_blank check (length(btrim(display_name)) > 0),
  constraint ai_member_breaker_reason_ref_not_blank
    check (breaker_reason_ref is null or length(btrim(breaker_reason_ref)) > 0),
  constraint ai_member_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists ai_member_version (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  ai_member_id uuid not null,
  version integer not null,
  status ai_member_version_status not null default 'draft',
  persona_ref text not null,
  eval_gate_id uuid,
  config_version_id uuid,
  created_by_user_id uuid not null,
  activated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ai_member_version_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint ai_member_version_member_fk foreign key (ai_member_id, org_id, tenant_id)
    references ai_member(id, org_id, tenant_id) on delete cascade,
  constraint ai_member_version_eval_gate_fk foreign key (eval_gate_id, org_id, tenant_id)
    references eval_gate(id, org_id, tenant_id) on delete restrict,
  constraint ai_member_version_config_version_fk
    foreign key (config_version_id, org_id, tenant_id)
    references config_version(id, org_id, tenant_id) on delete restrict,
  constraint ai_member_version_scope_reference_unique unique (id, org_id, tenant_id),
  constraint ai_member_version_member_scoped_reference_unique
    unique (id, ai_member_id, org_id, tenant_id),
  constraint ai_member_version_member_version_unique
    unique (org_id, tenant_id, ai_member_id, version),
  constraint ai_member_version_positive check (version > 0),
  constraint ai_member_version_persona_ref_not_blank
    check (length(btrim(persona_ref)) > 0),
  constraint ai_member_version_metadata_object check (jsonb_typeof(metadata) = 'object')
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ai_member_active_version_fk'
  ) then
    alter table ai_member
      add constraint ai_member_active_version_fk
      foreign key (active_version_id, id, org_id, tenant_id)
      references ai_member_version(id, ai_member_id, org_id, tenant_id)
      on delete restrict;
  end if;
end $$;

create table if not exists ai_capability_toggle (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  ai_member_id uuid not null,
  capability_key ai_capability_key not null,
  enabled boolean not null default false,
  config_version_id uuid,
  updated_by_user_id uuid,
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ai_capability_toggle_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint ai_capability_toggle_member_fk
    foreign key (ai_member_id, org_id, tenant_id)
    references ai_member(id, org_id, tenant_id) on delete cascade,
  constraint ai_capability_toggle_config_version_fk
    foreign key (config_version_id, org_id, tenant_id)
    references config_version(id, org_id, tenant_id) on delete restrict,
  constraint ai_capability_toggle_scope_reference_unique unique (id, org_id, tenant_id),
  constraint ai_capability_toggle_member_capability_unique
    unique (org_id, tenant_id, ai_member_id, capability_key),
  constraint ai_capability_toggle_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists confirmation_item (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  kind confirmation_item_kind not null,
  status confirmation_item_status not null default 'pending',
  source_ref text not null,
  target_kind text,
  target_ref text,
  candidate_payload jsonb not null,
  diff_payload jsonb not null default '{}'::jsonb,
  distill_run_id uuid,
  reviewed_by_user_id uuid,
  reviewed_at timestamptz,
  audit_log_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint confirmation_item_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint confirmation_item_distill_run_fk
    foreign key (distill_run_id, org_id, tenant_id)
    references distill_run(id, org_id, tenant_id) on delete restrict,
  constraint confirmation_item_scope_reference_unique unique (id, org_id, tenant_id),
  constraint confirmation_item_source_ref_not_blank check (length(btrim(source_ref)) > 0),
  constraint confirmation_item_target_kind_not_blank
    check (target_kind is null or length(btrim(target_kind)) > 0),
  constraint confirmation_item_target_ref_not_blank
    check (target_ref is null or length(btrim(target_ref)) > 0),
  constraint confirmation_item_target_pair
    check (
      (target_kind is null and target_ref is null)
      or (target_kind is not null and target_ref is not null)
    ),
  constraint confirmation_item_candidate_payload_object
    check (jsonb_typeof(candidate_payload) = 'object'),
  constraint confirmation_item_diff_payload_object
    check (jsonb_typeof(diff_payload) = 'object'),
  constraint confirmation_item_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists distill_run_scope_status_created_idx
  on distill_run(org_id, tenant_id, status, created_at);
create index if not exists distill_run_scope_frequency_created_idx
  on distill_run(org_id, tenant_id, frequency, created_at);
create index if not exists distill_health_daily_downshift_idx
  on distill_health_daily(org_id, tenant_id, downshifted, business_date);
create index if not exists ai_member_scope_status_idx
  on ai_member(org_id, tenant_id, status);
create index if not exists ai_member_version_member_status_idx
  on ai_member_version(org_id, tenant_id, ai_member_id, status);
create index if not exists ai_member_version_eval_gate_idx on ai_member_version(eval_gate_id);
create index if not exists ai_member_version_config_version_idx
  on ai_member_version(config_version_id);
create index if not exists ai_capability_toggle_scope_capability_enabled_idx
  on ai_capability_toggle(org_id, tenant_id, capability_key, enabled);
create index if not exists ai_capability_toggle_config_version_idx
  on ai_capability_toggle(config_version_id);
create index if not exists confirmation_item_scope_status_created_idx
  on confirmation_item(org_id, tenant_id, status, created_at);
create index if not exists confirmation_item_scope_kind_status_idx
  on confirmation_item(org_id, tenant_id, kind, status);
create index if not exists confirmation_item_distill_run_idx
  on confirmation_item(distill_run_id);

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
        ('confirmation_item'),
        ('distill_run'),
        ('distill_health_daily'),
        ('ai_member'),
        ('ai_member_version'),
        ('ai_capability_toggle')
    ) as m5_operations_tables(table_name)
  loop
    execute format('alter table %I enable row level security', scoped_table);
    execute format('alter table %I force row level security', scoped_table);

    execute format(
      'drop policy if exists %I on %I',
      'm5_operations_' || scoped_table || '_select_scope',
      scoped_table
    );
    execute format(
      'create policy %I on %I for select to uzmax_app_runtime using (%s)',
      'm5_operations_' || scoped_table || '_select_scope',
      scoped_table,
      scope_check
    );

    execute format(
      'drop policy if exists %I on %I',
      'm5_operations_' || scoped_table || '_insert_scope',
      scoped_table
    );
    execute format(
      'create policy %I on %I for insert to uzmax_app_runtime with check (%s)',
      'm5_operations_' || scoped_table || '_insert_scope',
      scoped_table,
      scope_check
    );

    execute format(
      'drop policy if exists %I on %I',
      'm5_operations_' || scoped_table || '_update_scope',
      scoped_table
    );
    execute format(
      'create policy %I on %I for update to uzmax_app_runtime using (%s) with check (%s)',
      'm5_operations_' || scoped_table || '_update_scope',
      scoped_table,
      scope_check,
      scope_check
    );
  end loop;
end $$;

revoke all on table confirmation_item from public;
revoke all on table distill_run from public;
revoke all on table distill_health_daily from public;
revoke all on table ai_member from public;
revoke all on table ai_member_version from public;
revoke all on table ai_capability_toggle from public;

grant select, insert, update on table confirmation_item to uzmax_app_runtime;
grant select, insert, update on table distill_run to uzmax_app_runtime;
grant select, insert, update on table distill_health_daily to uzmax_app_runtime;
grant select, insert, update on table ai_member to uzmax_app_runtime;
grant select, insert, update on table ai_member_version to uzmax_app_runtime;
grant select, insert, update on table ai_capability_toggle to uzmax_app_runtime;
