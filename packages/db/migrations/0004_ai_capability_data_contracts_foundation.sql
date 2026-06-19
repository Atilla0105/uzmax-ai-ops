do $$
begin
  if not exists (select 1 from pg_type where typname = 'm3_record_status') then
    create type m3_record_status as enum ('draft', 'active', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'quote_record_status') then
    create type quote_record_status as enum ('created', 'expired', 'voided');
  end if;

  if not exists (select 1 from pg_type where typname = 'quote_source') then
    create type quote_source as enum ('code');
  end if;

  if not exists (select 1 from pg_type where typname = 'eval_category') then
    create type eval_category as enum (
      'intent',
      'tutorial',
      'quote',
      'vision',
      'speech',
      'redline_attack',
      'redline_false_positive',
      'business_draft',
      'degradation',
      'language'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'eval_run_status') then
    create type eval_run_status as enum (
      'queued',
      'running',
      'passed',
      'failed',
      'blocked'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'eval_result_status') then
    create type eval_result_status as enum ('passed', 'failed', 'skipped');
  end if;

  if not exists (select 1 from pg_type where typname = 'eval_gate_status') then
    create type eval_gate_status as enum ('pending', 'passed', 'failed', 'blocked');
  end if;

  if not exists (select 1 from pg_type where typname = 'llm_task') then
    create type llm_task as enum (
      'intent_classify',
      'kb_answer',
      'vision_diag',
      'speech_postprocess',
      'summarize',
      'profile_update',
      'draft_reply',
      'distill_daily',
      'journey_import',
      'eval_judge'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'llm_call_status') then
    create type llm_call_status as enum ('succeeded', 'failed', 'fallback');
  end if;
end $$;

create table if not exists kb_entry (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  entry_key text not null,
  title text not null,
  category text not null,
  status m3_record_status not null default 'draft',
  version integer not null default 1,
  source_ref text,
  content_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kb_entry_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint kb_entry_scope_reference_unique unique (id, org_id, tenant_id),
  constraint kb_entry_version_unique unique (org_id, tenant_id, entry_key, version),
  constraint kb_entry_key_not_blank check (length(btrim(entry_key)) > 0),
  constraint kb_entry_title_not_blank check (length(btrim(title)) > 0),
  constraint kb_entry_category_not_blank check (length(btrim(category)) > 0),
  constraint kb_entry_version_positive check (version > 0),
  constraint kb_entry_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists kb_stage (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  kb_entry_id uuid not null,
  stage_key text not null,
  title text not null,
  sequence integer not null,
  status m3_record_status not null default 'draft',
  material_refs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kb_stage_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint kb_stage_entry_fk foreign key (kb_entry_id, org_id, tenant_id)
    references kb_entry(id, org_id, tenant_id) on delete cascade,
  constraint kb_stage_key_unique unique (org_id, tenant_id, kb_entry_id, stage_key),
  constraint kb_stage_key_not_blank check (length(btrim(stage_key)) > 0),
  constraint kb_stage_title_not_blank check (length(btrim(title)) > 0),
  constraint kb_stage_sequence_non_negative check (sequence >= 0),
  constraint kb_stage_material_refs_object check (jsonb_typeof(material_refs) = 'object')
);

create table if not exists media_asset (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  asset_kind text not null,
  storage_ref text not null,
  mime_type text,
  content_hash text,
  status m3_record_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_asset_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint media_asset_storage_ref_unique unique (org_id, tenant_id, storage_ref),
  constraint media_asset_kind_not_blank check (length(btrim(asset_kind)) > 0),
  constraint media_asset_storage_ref_not_blank check (length(btrim(storage_ref)) > 0),
  constraint media_asset_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists quote_record (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  conversation_id uuid,
  config_version_id uuid,
  config_version_ref text,
  source quote_source not null default 'code',
  status quote_record_status not null default 'created',
  input_ref jsonb not null,
  result jsonb not null,
  currency text,
  total_minor_units integer,
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  constraint quote_record_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint quote_record_conversation_fk foreign key (conversation_id, org_id, tenant_id)
    references conversation(id, org_id, tenant_id) on delete restrict,
  constraint quote_record_config_version_fk foreign key (config_version_id, org_id, tenant_id)
    references config_version(id, org_id, tenant_id) on delete restrict,
  constraint quote_record_scope_reference_unique unique (id, org_id, tenant_id),
  constraint quote_record_code_source_only check (source = 'code'),
  constraint quote_record_input_ref_object check (jsonb_typeof(input_ref) = 'object'),
  constraint quote_record_result_object check (jsonb_typeof(result) = 'object'),
  constraint quote_record_total_minor_units_non_negative
    check (total_minor_units is null or total_minor_units >= 0),
  constraint quote_record_config_provenance_present
    check (config_version_id is not null or config_version_ref is not null)
);

create table if not exists eval_case (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  category eval_category not null,
  case_ref text not null,
  version integer not null default 1,
  status m3_record_status not null default 'draft',
  quota_weight integer not null default 1,
  redacted_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint eval_case_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint eval_case_scope_reference_unique unique (id, org_id, tenant_id),
  constraint eval_case_ref_version_unique unique (org_id, tenant_id, case_ref, version),
  constraint eval_case_ref_not_blank check (length(btrim(case_ref)) > 0),
  constraint eval_case_version_positive check (version > 0),
  constraint eval_case_quota_weight_positive check (quota_weight > 0),
  constraint eval_case_redacted_payload_object
    check (jsonb_typeof(redacted_payload) = 'object')
);

create table if not exists eval_run (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  gate_key text not null,
  trigger_ref text,
  status eval_run_status not null default 'queued',
  category_quotas jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint eval_run_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint eval_run_scope_reference_unique unique (id, org_id, tenant_id),
  constraint eval_run_gate_key_not_blank check (length(btrim(gate_key)) > 0),
  constraint eval_run_category_quotas_object
    check (jsonb_typeof(category_quotas) = 'object')
);

create table if not exists eval_result (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  eval_run_id uuid not null,
  eval_case_id uuid not null,
  category eval_category not null,
  status eval_result_status not null,
  score integer,
  redline_summary jsonb not null default '{}'::jsonb,
  output_ref text,
  occurred_at timestamptz not null default now(),
  constraint eval_result_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint eval_result_run_fk foreign key (eval_run_id, org_id, tenant_id)
    references eval_run(id, org_id, tenant_id) on delete cascade,
  constraint eval_result_case_fk foreign key (eval_case_id, org_id, tenant_id)
    references eval_case(id, org_id, tenant_id) on delete restrict,
  constraint eval_result_scope_reference_unique unique (id, org_id, tenant_id),
  constraint eval_result_score_range check (score is null or score between 0 and 100),
  constraint eval_result_redline_summary_object
    check (jsonb_typeof(redline_summary) = 'object')
);

create table if not exists eval_gate (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  gate_key text not null,
  target_kind text not null,
  target_ref text not null,
  status eval_gate_status not null default 'pending',
  category_quotas jsonb not null default '{}'::jsonb,
  last_eval_run_id uuid,
  passed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint eval_gate_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint eval_gate_last_run_fk foreign key (last_eval_run_id, org_id, tenant_id)
    references eval_run(id, org_id, tenant_id) on delete restrict,
  constraint eval_gate_scope_reference_unique unique (id, org_id, tenant_id),
  constraint eval_gate_target_unique unique (
    org_id,
    tenant_id,
    gate_key,
    target_kind,
    target_ref
  ),
  constraint eval_gate_key_not_blank check (length(btrim(gate_key)) > 0),
  constraint eval_gate_target_kind_not_blank check (length(btrim(target_kind)) > 0),
  constraint eval_gate_target_ref_not_blank check (length(btrim(target_ref)) > 0),
  constraint eval_gate_category_quotas_object
    check (jsonb_typeof(category_quotas) = 'object')
);

create table if not exists llm_call_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  task llm_task not null,
  provider_id text not null,
  model_id text not null,
  route_ref text,
  route_version text,
  status llm_call_status not null,
  input_token_count integer not null default 0,
  output_token_count integer not null default 0,
  total_token_count integer not null default 0,
  cost_micros integer not null default 0,
  latency_ms integer not null default 0,
  trace_id text,
  prompt_hash text,
  completion_hash text,
  redaction_metadata jsonb not null default '{}'::jsonb,
  fallback_summary jsonb not null default '{}'::jsonb,
  eval_summary jsonb not null default '{}'::jsonb,
  redline_summary jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint llm_call_log_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint llm_call_log_provider_not_blank check (length(btrim(provider_id)) > 0),
  constraint llm_call_log_model_not_blank check (length(btrim(model_id)) > 0),
  constraint llm_call_log_token_counts_non_negative check (
    input_token_count >= 0
    and output_token_count >= 0
    and total_token_count >= 0
  ),
  constraint llm_call_log_cost_latency_non_negative
    check (cost_micros >= 0 and latency_ms >= 0),
  constraint llm_call_log_redaction_metadata_object
    check (jsonb_typeof(redaction_metadata) = 'object'),
  constraint llm_call_log_fallback_summary_object
    check (jsonb_typeof(fallback_summary) = 'object'),
  constraint llm_call_log_eval_summary_object
    check (jsonb_typeof(eval_summary) = 'object'),
  constraint llm_call_log_redline_summary_object
    check (jsonb_typeof(redline_summary) = 'object')
);

create index if not exists kb_entry_scope_status_idx
  on kb_entry(org_id, tenant_id, status);
create index if not exists kb_stage_scope_status_idx
  on kb_stage(org_id, tenant_id, status);
create index if not exists media_asset_scope_kind_status_idx
  on media_asset(org_id, tenant_id, asset_kind, status);
create index if not exists quote_record_scope_status_created_idx
  on quote_record(org_id, tenant_id, status, created_at);
create index if not exists quote_record_config_version_idx on quote_record(config_version_id);
create index if not exists eval_case_scope_category_status_idx
  on eval_case(org_id, tenant_id, category, status);
create index if not exists eval_run_scope_gate_status_idx
  on eval_run(org_id, tenant_id, gate_key, status);
create index if not exists eval_result_scope_run_status_idx
  on eval_result(org_id, tenant_id, eval_run_id, status);
create index if not exists eval_result_scope_category_status_idx
  on eval_result(org_id, tenant_id, category, status);
create index if not exists eval_gate_scope_status_idx
  on eval_gate(org_id, tenant_id, status);
create index if not exists llm_call_log_scope_task_occurred_idx
  on llm_call_log(org_id, tenant_id, task, occurred_at);
create index if not exists llm_call_log_trace_idx on llm_call_log(trace_id);

do $$
declare
  action_name text;
  policy_clause text;
  policy_name text;
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
    'kb_entry',
    'kb_stage',
    'media_asset',
    'quote_record',
    'eval_case',
    'eval_run',
    'eval_result',
    'eval_gate',
    'llm_call_log'
  ])
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('alter table %I force row level security', table_name);

    for action_name in select unnest(array['select', 'insert', 'update'])
    loop
      policy_name := format('m3_ai_%s_%s_tenant_scope', table_name, action_name);

      policy_clause := format('using (%s)', tenant_scope_predicate);
      if action_name = 'insert' then
        policy_clause := format('with check (%s)', tenant_scope_predicate);
      elsif action_name = 'update' then
        policy_clause := format(
          'using (%s) with check (%s)',
          tenant_scope_predicate,
          tenant_scope_predicate
        );
      end if;

      execute format('drop policy if exists %I on %I', policy_name, table_name);
      execute format(
        'create policy %I on %I for %s to uzmax_app_runtime %s',
        policy_name,
        table_name,
        action_name,
        policy_clause
      );
    end loop;
  end loop;
end $$;

revoke all on table kb_entry from public;
revoke all on table kb_stage from public;
revoke all on table media_asset from public;
revoke all on table quote_record from public;
revoke all on table eval_case from public;
revoke all on table eval_run from public;
revoke all on table eval_result from public;
revoke all on table eval_gate from public;
revoke all on table llm_call_log from public;

grant select, insert, update on table kb_entry to uzmax_app_runtime;
grant select, insert, update on table kb_stage to uzmax_app_runtime;
grant select, insert, update on table media_asset to uzmax_app_runtime;
grant select, insert, update on table quote_record to uzmax_app_runtime;
grant select, insert, update on table eval_case to uzmax_app_runtime;
grant select, insert, update on table eval_run to uzmax_app_runtime;
grant select, insert, update on table eval_result to uzmax_app_runtime;
grant select, insert, update on table eval_gate to uzmax_app_runtime;
grant select, insert, update on table llm_call_log to uzmax_app_runtime;
