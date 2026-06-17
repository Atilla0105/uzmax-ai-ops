do $$
begin
  if not exists (select 1 from pg_type where typname = 'channel_connection_status') then
    create type channel_connection_status as enum (
      'active',
      'degraded',
      'disabled',
      'archived'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'conversation_status') then
    create type conversation_status as enum (
      'open',
      'pending_handoff',
      'handoff',
      'closed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'message_direction') then
    create type message_direction as enum ('inbound', 'outbound', 'internal');
  end if;

  if not exists (select 1 from pg_type where typname = 'message_content_kind') then
    create type message_content_kind as enum (
      'text',
      'image',
      'voice',
      'callback',
      'unsupported',
      'system'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'message_delivery_status') then
    create type message_delivery_status as enum (
      'received',
      'queued',
      'sent',
      'failed',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'ticket_status') then
    create type ticket_status as enum (
      'open',
      'claimed',
      'locked',
      'escalated',
      'closed',
      'reopened'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'ticket_event_type') then
    create type ticket_event_type as enum (
      'created',
      'claimed',
      'locked',
      'note_added',
      'escalated',
      'closed',
      'reopened',
      'status_changed'
    );
  end if;
end $$;

create table if not exists channel_connection (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  provider text not null,
  external_account_ref text not null,
  display_name text,
  status channel_connection_status not null default 'active',
  capabilities jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint channel_connection_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint channel_connection_scope_reference_unique unique (id, org_id, tenant_id),
  constraint channel_connection_identity_unique
    unique (org_id, tenant_id, provider, external_account_ref),
  constraint channel_connection_provider_not_blank check (length(btrim(provider)) > 0),
  constraint channel_connection_external_ref_not_blank
    check (length(btrim(external_account_ref)) > 0),
  constraint channel_connection_capabilities_object
    check (jsonb_typeof(capabilities) = 'object'),
  constraint channel_connection_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table if not exists telegram_update_dedupe (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  channel_connection_id uuid not null,
  provider_update_id text not null,
  update_kind text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint telegram_update_dedupe_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint telegram_update_dedupe_channel_fk
    foreign key (channel_connection_id, org_id, tenant_id)
    references channel_connection(id, org_id, tenant_id) on delete cascade,
  constraint telegram_update_dedupe_identity_unique
    unique (org_id, tenant_id, channel_connection_id, provider_update_id),
  constraint telegram_update_dedupe_provider_update_id_not_blank
    check (length(btrim(provider_update_id)) > 0)
);

create table if not exists conversation (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  channel_connection_id uuid not null,
  external_conversation_ref text not null,
  participant_external_ref text not null,
  status conversation_status not null default 'open',
  unread_count integer not null default 0,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversation_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint conversation_channel_fk
    foreign key (channel_connection_id, org_id, tenant_id)
    references channel_connection(id, org_id, tenant_id) on delete cascade,
  constraint conversation_scope_reference_unique unique (id, org_id, tenant_id),
  constraint conversation_external_ref_unique
    unique (org_id, tenant_id, channel_connection_id, external_conversation_ref),
  constraint conversation_external_ref_not_blank
    check (length(btrim(external_conversation_ref)) > 0),
  constraint conversation_participant_external_ref_not_blank
    check (length(btrim(participant_external_ref)) > 0),
  constraint conversation_unread_count_non_negative check (unread_count >= 0)
);

create table if not exists message (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  conversation_id uuid not null,
  channel_connection_id uuid not null,
  direction message_direction not null,
  content_kind message_content_kind not null,
  delivery_status message_delivery_status not null default 'received',
  external_message_ref text,
  content jsonb not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint message_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint message_conversation_fk
    foreign key (conversation_id, org_id, tenant_id)
    references conversation(id, org_id, tenant_id) on delete cascade,
  constraint message_channel_fk
    foreign key (channel_connection_id, org_id, tenant_id)
    references channel_connection(id, org_id, tenant_id) on delete cascade,
  constraint message_scope_reference_unique unique (id, org_id, tenant_id),
  constraint message_external_ref_unique
    unique (org_id, tenant_id, channel_connection_id, external_message_ref),
  constraint message_content_object check (jsonb_typeof(content) = 'object')
);

create table if not exists ticket (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  conversation_id uuid not null,
  status ticket_status not null default 'open',
  priority integer not null default 3,
  assigned_user_id uuid,
  locked_by_user_id uuid,
  summary text,
  sla_due_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ticket_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint ticket_conversation_fk
    foreign key (conversation_id, org_id, tenant_id)
    references conversation(id, org_id, tenant_id) on delete cascade,
  constraint ticket_scope_reference_unique unique (id, org_id, tenant_id),
  constraint ticket_priority_range check (priority between 1 and 5),
  constraint ticket_summary_not_blank check (summary is null or length(btrim(summary)) > 0)
);

create table if not exists ticket_event (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id) on delete cascade,
  tenant_id uuid not null,
  ticket_id uuid not null,
  event_type ticket_event_type not null,
  actor_user_id uuid,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ticket_event_tenant_fk foreign key (org_id, tenant_id)
    references tenant(org_id, id) on delete cascade,
  constraint ticket_event_ticket_fk
    foreign key (ticket_id, org_id, tenant_id)
    references ticket(id, org_id, tenant_id) on delete cascade,
  constraint ticket_event_payload_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists channel_connection_scope_status_idx
  on channel_connection(org_id, tenant_id, status);
create index if not exists telegram_update_dedupe_scope_received_idx
  on telegram_update_dedupe(org_id, tenant_id, received_at);
create index if not exists conversation_scope_status_updated_idx
  on conversation(org_id, tenant_id, status, updated_at);
create index if not exists message_scope_conversation_occurred_idx
  on message(org_id, tenant_id, conversation_id, occurred_at);
create index if not exists ticket_scope_status_updated_idx
  on ticket(org_id, tenant_id, status, updated_at);
create index if not exists ticket_assigned_status_idx on ticket(assigned_user_id, status);
create index if not exists ticket_event_scope_ticket_occurred_idx
  on ticket_event(org_id, tenant_id, ticket_id, occurred_at);

alter table channel_connection enable row level security;
alter table telegram_update_dedupe enable row level security;
alter table conversation enable row level security;
alter table message enable row level security;
alter table ticket enable row level security;
alter table ticket_event enable row level security;

alter table channel_connection force row level security;
alter table telegram_update_dedupe force row level security;
alter table conversation force row level security;
alter table message force row level security;
alter table ticket force row level security;
alter table ticket_event force row level security;

drop policy if exists channel_conversation_channel_connection_select_tenant_scope on channel_connection;
create policy channel_conversation_channel_connection_select_tenant_scope
  on channel_connection
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_channel_connection_insert_tenant_scope on channel_connection;
create policy channel_conversation_channel_connection_insert_tenant_scope
  on channel_connection
  for insert
  to uzmax_app_runtime
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_channel_connection_update_tenant_scope on channel_connection;
create policy channel_conversation_channel_connection_update_tenant_scope
  on channel_connection
  for update
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  )
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_telegram_update_dedupe_select_tenant_scope on telegram_update_dedupe;
create policy channel_conversation_telegram_update_dedupe_select_tenant_scope
  on telegram_update_dedupe
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_telegram_update_dedupe_insert_tenant_scope on telegram_update_dedupe;
create policy channel_conversation_telegram_update_dedupe_insert_tenant_scope
  on telegram_update_dedupe
  for insert
  to uzmax_app_runtime
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_telegram_update_dedupe_update_tenant_scope on telegram_update_dedupe;
create policy channel_conversation_telegram_update_dedupe_update_tenant_scope
  on telegram_update_dedupe
  for update
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  )
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_conversation_select_tenant_scope on conversation;
create policy channel_conversation_conversation_select_tenant_scope
  on conversation
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_conversation_insert_tenant_scope on conversation;
create policy channel_conversation_conversation_insert_tenant_scope
  on conversation
  for insert
  to uzmax_app_runtime
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_conversation_update_tenant_scope on conversation;
create policy channel_conversation_conversation_update_tenant_scope
  on conversation
  for update
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  )
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_message_select_tenant_scope on message;
create policy channel_conversation_message_select_tenant_scope
  on message
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_message_insert_tenant_scope on message;
create policy channel_conversation_message_insert_tenant_scope
  on message
  for insert
  to uzmax_app_runtime
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_message_update_tenant_scope on message;
create policy channel_conversation_message_update_tenant_scope
  on message
  for update
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  )
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_ticket_select_tenant_scope on ticket;
create policy channel_conversation_ticket_select_tenant_scope
  on ticket
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_ticket_insert_tenant_scope on ticket;
create policy channel_conversation_ticket_insert_tenant_scope
  on ticket
  for insert
  to uzmax_app_runtime
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_ticket_update_tenant_scope on ticket;
create policy channel_conversation_ticket_update_tenant_scope
  on ticket
  for update
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  )
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_ticket_event_select_tenant_scope on ticket_event;
create policy channel_conversation_ticket_event_select_tenant_scope
  on ticket_event
  for select
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_ticket_event_insert_tenant_scope on ticket_event;
create policy channel_conversation_ticket_event_insert_tenant_scope
  on ticket_event
  for insert
  to uzmax_app_runtime
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

drop policy if exists channel_conversation_ticket_event_update_tenant_scope on ticket_event;
create policy channel_conversation_ticket_event_update_tenant_scope
  on ticket_event
  for update
  to uzmax_app_runtime
  using (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  )
  with check (
    org_id::text = current_setting('app.org_id', true)
    and tenant_id::text = current_setting('app.tenant_id', true)
    and nullif(current_setting('app.org_id', true), '') is not null
    and nullif(current_setting('app.tenant_id', true), '') is not null
  );

revoke all on table channel_connection from public;
revoke all on table telegram_update_dedupe from public;
revoke all on table conversation from public;
revoke all on table message from public;
revoke all on table ticket from public;
revoke all on table ticket_event from public;

grant select, insert, update on table channel_connection to uzmax_app_runtime;
grant select, insert, update on table telegram_update_dedupe to uzmax_app_runtime;
grant select, insert, update on table conversation to uzmax_app_runtime;
grant select, insert, update on table message to uzmax_app_runtime;
grant select, insert, update on table ticket to uzmax_app_runtime;
grant select, insert, update on table ticket_event to uzmax_app_runtime;
