export async function upsertAccessFacts(prisma, config, userId) {
  await prisma.$executeRaw`insert into org_member (org_id, user_id, role, status, cache_version) values (${config.orgId}::uuid, ${userId}::uuid, ${config.role}, 'active', 1) on conflict (org_id, user_id) do update set role = excluded.role, status = 'active', cache_version = org_member.cache_version + 1, updated_at = now()`;
  await prisma.$executeRaw`insert into tenant_member (org_id, tenant_id, user_id, role, status, cache_version) values (${config.orgId}::uuid, ${config.tenantId}::uuid, ${userId}::uuid, ${config.role}, 'active', 1) on conflict (org_id, tenant_id, user_id) do update set role = excluded.role, status = 'active', cache_version = tenant_member.cache_version + 1, updated_at = now()`;
  await prisma.$executeRaw`delete from permission_grant where org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and user_id = ${userId}::uuid`;
  for (const permission of config.permissions) {
    await prisma.$executeRaw`insert into permission_grant (org_id, tenant_id, user_id, permission) values (${config.orgId}::uuid, ${config.tenantId}::uuid, ${userId}::uuid, ${permission})`;
  }
  return {
    orgMember: "upserted",
    permissionCount: config.permissions.length,
    permissions: [...config.permissions],
    tenantMember: "upserted"
  };
}

export async function seedSyntheticRows(prisma, config) {
  await prisma.$executeRaw`insert into org (id, name, slug) values (${config.orgId}::uuid, 'M10-03 Synthetic Org', 'm10-03-synthetic-org') on conflict (id) do nothing`;
  await prisma.$executeRaw`insert into tenant (id, org_id, name, slug) values (${config.tenantId}::uuid, ${config.orgId}::uuid, 'M10-03 Synthetic Tenant', 'm10-03-synthetic-tenant') on conflict (id) do nothing`;
  await prisma.$executeRaw`insert into channel_connection (id, org_id, tenant_id, provider, external_account_ref, capabilities, metadata) values (${config.syntheticChannelId}::uuid, ${config.orgId}::uuid, ${config.tenantId}::uuid, 'telegram_bot', 'controlled://channel/m10-03', ${JSON.stringify({ supportOperatorSmoke: true })}::jsonb, ${JSON.stringify({ synthetic_spec: "M10-03" })}::jsonb) on conflict (id) do update set metadata = excluded.metadata`;
  await prisma.$executeRaw`insert into conversation (id, org_id, tenant_id, channel_connection_id, external_conversation_ref, participant_external_ref, status, unread_count, last_message_at) values (${config.syntheticConversationId}::uuid, ${config.orgId}::uuid, ${config.tenantId}::uuid, ${config.syntheticChannelId}::uuid, 'controlled://conversation/m10-03', 'controlled://participant/m10-03', 'open', 1, now()) on conflict (id) do update set status = 'open', unread_count = 1, last_message_at = excluded.last_message_at`;
}

export async function cleanupSyntheticRows(prisma, config) {
  await prisma.$executeRaw`delete from ticket_event e using ticket t, conversation c where e.ticket_id = t.id and t.conversation_id = c.id and c.id = ${config.syntheticConversationId}::uuid and c.org_id = ${config.orgId}::uuid and c.tenant_id = ${config.tenantId}::uuid and c.external_conversation_ref = 'controlled://conversation/m10-03'`;
  await prisma.$executeRaw`delete from ticket t using conversation c where t.conversation_id = c.id and c.id = ${config.syntheticConversationId}::uuid and c.org_id = ${config.orgId}::uuid and c.tenant_id = ${config.tenantId}::uuid and c.external_conversation_ref = 'controlled://conversation/m10-03'`;
  await prisma.$executeRaw`delete from conversation where id = ${config.syntheticConversationId}::uuid and org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and external_conversation_ref = 'controlled://conversation/m10-03'`;
  await prisma.$executeRaw`delete from channel_connection where id = ${config.syntheticChannelId}::uuid and org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and metadata->>'synthetic_spec' = 'M10-03'`;
}

export async function syntheticResidueCount(prisma, config) {
  const rows =
    await prisma.$queryRaw`select ((select count(*) from channel_connection where id = ${config.syntheticChannelId}::uuid and org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and metadata->>'synthetic_spec' = 'M10-03') + (select count(*) from conversation where id = ${config.syntheticConversationId}::uuid and org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and external_conversation_ref = 'controlled://conversation/m10-03') + (select count(*) from ticket t join conversation c on c.id = t.conversation_id where c.id = ${config.syntheticConversationId}::uuid and c.org_id = ${config.orgId}::uuid and c.tenant_id = ${config.tenantId}::uuid and c.external_conversation_ref = 'controlled://conversation/m10-03') + (select count(*) from ticket_event e join ticket t on t.id = e.ticket_id join conversation c on c.id = t.conversation_id where c.id = ${config.syntheticConversationId}::uuid and c.org_id = ${config.orgId}::uuid and c.tenant_id = ${config.tenantId}::uuid and c.external_conversation_ref = 'controlled://conversation/m10-03'))::int as residue`;
  return Number(rows[0]?.residue ?? -1);
}
