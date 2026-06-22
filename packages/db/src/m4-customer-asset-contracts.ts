const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type M4CustomerAssetContractInput = {
  orgId: string;
  tenantId: string;
} & Record<string, unknown>;

const m4CustomerAssetTableNames = {
  customer: "customer",
  customerFieldValue: "customer_field_value",
  customerIdentity: "customer_identity",
  customFieldDefinition: "custom_field_definition",
  tagAssignment: "tag_assignment",
  tagDefinition: "tag_definition"
} as const;
const customerAssetRecordStatuses = {
  active: "active",
  archived: "archived"
} as const;
const customerIdentityStatuses = {
  active: "active",
  archived: "archived",
  merged: "merged"
} as const;
const customFieldValueTypes = {
  boolean: "boolean",
  date: "date",
  json: "json",
  number: "number",
  text: "text"
} as const;
const tagTargetKinds = { customer: "customer" } as const;

function createCustomerContract(
  input: M4CustomerAssetContractInput
): Record<string, unknown> {
  const blacklistedAt = optionalString(input, "blacklistedAt");
  const unreachableAt = optionalString(input, "unreachableAt");
  return clean({
    ...tenantScope(input, "customer"),
    blacklistedAt,
    displayLabelRef: optionalString(input, "displayLabelRef"),
    id: readUuid(input.id, "customer id"),
    isBlacklisted: optionalBoolean(input, "isBlacklisted") ?? false,
    isUnreachable: optionalBoolean(input, "isUnreachable") ?? false,
    journeyStage: optionalString(input, "journeyStage"),
    metadata: optionalRecord(input, "metadata") ?? {},
    preferredLanguage: optionalString(input, "preferredLanguage"),
    preferredScript: optionalString(input, "preferredScript"),
    status: enumValue(input.status, customerAssetRecordStatuses, "customer status"),
    unreachableAt,
    unresolvedIssueCount: optionalInteger(input, "unresolvedIssueCount", 0) ?? 0
  });
}

function createCustomerIdentityContract(
  input: M4CustomerAssetContractInput
): Record<string, unknown> {
  return clean({
    ...tenantScope(input, "customer identity"),
    channelConnectionId: optionalUuid(input, "channelConnectionId"),
    customerId: readUuid(input.customerId, "customer identity customerId"),
    externalSubjectRef: readText(
      input.externalSubjectRef,
      "customer identity externalSubjectRef"
    ),
    firstSeenAt: optionalString(input, "firstSeenAt"),
    id: readUuid(input.id, "customer identity id"),
    identityKind: readText(input.identityKind, "customer identity kind"),
    lastSeenAt: optionalString(input, "lastSeenAt"),
    metadata: optionalRecord(input, "metadata") ?? {},
    provider: readText(input.provider, "customer identity provider"),
    status: enumValue(
      input.status,
      customerIdentityStatuses,
      "customer identity status"
    )
  });
}

function createCustomFieldDefinitionContract(
  input: M4CustomerAssetContractInput
): Record<string, unknown> {
  return clean({
    ...tenantScope(input, "custom field definition"),
    config: optionalRecord(input, "config") ?? {},
    fieldKey: readText(input.fieldKey, "custom field key"),
    id: readUuid(input.id, "custom field definition id"),
    isRequired: optionalBoolean(input, "isRequired") ?? false,
    label: readText(input.label, "custom field label"),
    status: enumValue(input.status, customerAssetRecordStatuses, "custom field status"),
    valueType: enumValue(
      input.valueType,
      customFieldValueTypes,
      "custom field valueType"
    )
  });
}

function createCustomerFieldValueContract(
  input: M4CustomerAssetContractInput
): Record<string, unknown> {
  return clean({
    ...tenantScope(input, "customer field value"),
    customerId: readUuid(input.customerId, "customer field value customerId"),
    fieldDefinitionId: readUuid(
      input.fieldDefinitionId,
      "customer field value fieldDefinitionId"
    ),
    id: readUuid(input.id, "customer field value id"),
    updatedByUserId: optionalUuid(input, "updatedByUserId"),
    value: readObject(input.value, "customer field value")
  });
}

function createTagDefinitionContract(
  input: M4CustomerAssetContractInput
): Record<string, unknown> {
  return clean({
    ...tenantScope(input, "tag definition"),
    colorToken: optionalString(input, "colorToken"),
    id: readUuid(input.id, "tag definition id"),
    label: readText(input.label, "tag label"),
    metadata: optionalRecord(input, "metadata") ?? {},
    status: enumValue(input.status, customerAssetRecordStatuses, "tag status"),
    tagKey: readText(input.tagKey, "tag key"),
    targetKind: enumValue(input.targetKind, tagTargetKinds, "tag targetKind")
  });
}

function createTagAssignmentContract(
  input: M4CustomerAssetContractInput
): Record<string, unknown> {
  return clean({
    ...tenantScope(input, "tag assignment"),
    assignedAt: optionalString(input, "assignedAt"),
    assignedByUserId: optionalUuid(input, "assignedByUserId"),
    customerId: readUuid(input.customerId, "tag assignment customerId"),
    id: readUuid(input.id, "tag assignment id"),
    metadata: optionalRecord(input, "metadata") ?? {},
    tagDefinitionId: readUuid(input.tagDefinitionId, "tag assignment tagDefinitionId")
  });
}

export const m4CustomerAssetContracts = {
  createCustomerContract,
  createCustomerFieldValueContract,
  createCustomerIdentityContract,
  createCustomFieldDefinitionContract,
  createTagAssignmentContract,
  createTagDefinitionContract,
  customFieldValueTypes,
  identityStatuses: customerIdentityStatuses,
  recordStatuses: customerAssetRecordStatuses,
  tableNames: m4CustomerAssetTableNames,
  tagTargetKinds
} as const;

function tenantScope(input: M4CustomerAssetContractInput, name: string) {
  return {
    orgId: readUuid(input.orgId, `${name} orgId`),
    tenantId: readUuid(input.tenantId, `${name} tenantId`)
  };
}

function clean(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

function enumValue<T extends string>(
  value: unknown,
  allowed: Record<string, T>,
  name: string
): T {
  const choices = Object.values(allowed);
  if (typeof value !== "string" || !choices.includes(value as T)) {
    throw new Error(`${name} is invalid`);
  }
  return value as T;
}

function optionalBoolean(
  source: M4CustomerAssetContractInput,
  key: string
): boolean | undefined {
  if (source[key] === undefined) return undefined;
  if (typeof source[key] !== "boolean") throw new Error(`${key} must be boolean`);
  return source[key];
}

function optionalInteger(
  source: M4CustomerAssetContractInput,
  key: string,
  minimum: number
): number | undefined {
  if (source[key] === undefined) return undefined;
  if (!Number.isInteger(source[key]) || (source[key] as number) < minimum) {
    throw new Error(`${key} must be an integer from ${minimum}`);
  }
  return source[key] as number;
}

function optionalRecord(
  source: M4CustomerAssetContractInput,
  key: string
): Record<string, unknown> | undefined {
  return source[key] === undefined ? undefined : readObject(source[key], key);
}

function optionalString(
  source: M4CustomerAssetContractInput,
  key: string
): string | undefined {
  return source[key] === undefined ? undefined : readText(source[key], key);
}

function optionalUuid(
  source: M4CustomerAssetContractInput,
  key: string
): string | undefined {
  return source[key] === undefined ? undefined : readUuid(source[key], key);
}

function readObject(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function readText(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function readUuid(value: unknown, name: string): string {
  const text = readText(value, name);
  if (!UUID_PATTERN.test(text)) throw new Error(`${name} must be a UUID`);
  return text;
}
