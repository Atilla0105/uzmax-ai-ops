type ApiResponseLike = {
  json(): Promise<unknown>;
  ok: boolean;
  status: number;
};

type RequestInitLike = {
  body?: string;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
};

export type CustomerAssetApiFetcher = (
  input: string,
  init?: RequestInitLike
) => Promise<ApiResponseLike>;

export function createCustomerAssetApiClient({
  basePath = "/customer-assets",
  fetcher
}: {
  basePath?: string;
  fetcher: CustomerAssetApiFetcher;
}) {
  if (typeof fetcher !== "function") throw new Error("fetcher is required");
  const root = normalizeCustomerAssetRoot(basePath);
  return {
    async getCustomerDetail(customerId: string) {
      const payload = await readJson(
        fetcher,
        `${root}/customers/${encodeURIComponent(readRequiredString(customerId, "customerId"))}`
      );
      return customerDetail(recordPayload(payload.item, "customer detail item"));
    },
    async listCustomers(
      filters: { flag?: "blacklisted" | "unreachable"; tagKey?: string } = {}
    ) {
      const query = new URLSearchParams();
      if (filters.flag) query.set("flag", filters.flag);
      if (filters.tagKey)
        query.set("tagKey", readRequiredString(filters.tagKey, "tagKey"));
      const suffix = query.size > 0 ? `?${query}` : "";
      const payload = await readJson(fetcher, `${root}/customers${suffix}`);
      return readArrayField(payload, "items").map(customerSummary);
    },
    async listFieldDefinitions() {
      const payload = await readJson(fetcher, `${root}/field-definitions`);
      return readArrayField(payload, "items").map(fieldDefinition);
    },
    async listTagDefinitions() {
      const payload = await readJson(fetcher, `${root}/tag-definitions`);
      return readArrayField(payload, "items").map(tagDefinition);
    },
    async restoreCustomer(
      customerId: string,
      input: {
        reasonRef: string;
        restoreBlacklisted?: boolean;
        restoreUnreachable?: boolean;
      }
    ) {
      const body = restoreBody(input);
      return restoreResult(
        await readJson(
          fetcher,
          `${root}/customers/${encodeURIComponent(readRequiredString(customerId, "customerId"))}/restore`,
          {
            body: JSON.stringify(body),
            headers: { "content-type": "application/json" },
            method: "POST"
          }
        )
      );
    }
  };
}

export type CustomerAssetApiClient = ReturnType<typeof createCustomerAssetApiClient>;

async function readJson(
  fetcher: CustomerAssetApiFetcher,
  path: string,
  init: RequestInitLike = { method: "GET" }
) {
  const response = await fetcher(path, init);
  if (!response.ok) {
    throw new Error(`customer asset API request failed with status ${response.status}`);
  }
  return recordPayload(await response.json(), "customer asset API response");
}

function restoreBody(input: {
  reasonRef: string;
  restoreBlacklisted?: boolean;
  restoreUnreachable?: boolean;
}) {
  const body = {
    reasonRef: readRequiredString(input.reasonRef, "reasonRef"),
    restoreBlacklisted: optionalBoolean(input.restoreBlacklisted, "restoreBlacklisted"),
    restoreUnreachable: optionalBoolean(input.restoreUnreachable, "restoreUnreachable")
  };
  if (!body.restoreBlacklisted && !body.restoreUnreachable) {
    throw new Error("restore flag is required");
  }
  return body;
}

function customerSummary(value: unknown) {
  const record = recordPayload(value, "customer summary");
  return {
    displayLabelRef: readOptionalString(record.displayLabelRef, "displayLabelRef"),
    id: readRequiredString(record.id, "id"),
    isBlacklisted: booleanValue(record.isBlacklisted, "isBlacklisted"),
    isUnreachable: booleanValue(record.isUnreachable, "isUnreachable"),
    journeyStage: readOptionalString(record.journeyStage, "journeyStage"),
    preferredLanguage: readOptionalString(
      record.preferredLanguage,
      "preferredLanguage"
    ),
    preferredScript: readOptionalString(record.preferredScript, "preferredScript"),
    relatedRefs: optionalRecord(record.relatedRefs, "relatedRefs") ?? {},
    status: readRequiredString(record.status, "status"),
    unresolvedIssueCount: readWholeNumber(
      record.unresolvedIssueCount,
      "unresolvedIssueCount"
    )
  };
}

function customerDetail(record: Record<string, unknown>) {
  return {
    customer: customerRecord(record.customer),
    fields: readArrayField(record, "fields").map(fieldValue),
    identities: readArrayField(record, "identities").map(identityItem),
    relatedRefs: optionalRecord(record.relatedRefs, "relatedRefs") ?? {},
    tags: readArrayField(record, "tags").map(tagAssignment)
  };
}

function customerRecord(value: unknown) {
  return {
    ...customerSummary(value),
    relatedRefs:
      optionalRecord(recordPayload(value, "customer").relatedRefs, "relatedRefs") ?? {}
  };
}

function identityItem(value: unknown) {
  const record = recordPayload(value, "customer identity");
  return {
    customerId: readRequiredString(record.customerId, "customerId"),
    externalSubjectRef: readRequiredString(
      record.externalSubjectRef,
      "externalSubjectRef"
    ),
    id: readRequiredString(record.id, "id"),
    identityKind: readRequiredString(record.identityKind, "identityKind"),
    provider: readRequiredString(record.provider, "provider"),
    status: readRequiredString(record.status, "status")
  };
}

function fieldDefinition(value: unknown) {
  const record = recordPayload(value, "field definition");
  return {
    fieldKey: readRequiredString(record.fieldKey, "fieldKey"),
    id: readRequiredString(record.id, "id"),
    label: readRequiredString(record.label, "label"),
    status: readRequiredString(record.status, "status"),
    valueType: readRequiredString(record.valueType, "valueType")
  };
}

function fieldValue(value: unknown) {
  const record = recordPayload(value, "field value");
  return {
    customerId: readRequiredString(record.customerId, "customerId"),
    definition: fieldDefinition(record.definition),
    fieldDefinitionId: readRequiredString(
      record.fieldDefinitionId,
      "fieldDefinitionId"
    ),
    id: readRequiredString(record.id, "id"),
    value: recordPayload(record.value, "field value payload")
  };
}

function tagDefinition(value: unknown) {
  const record = recordPayload(value, "tag definition");
  return {
    colorToken: readOptionalString(record.colorToken, "colorToken"),
    id: readRequiredString(record.id, "id"),
    label: readRequiredString(record.label, "label"),
    status: readRequiredString(record.status, "status"),
    tagKey: readRequiredString(record.tagKey, "tagKey"),
    targetKind: readRequiredString(record.targetKind, "targetKind")
  };
}

function tagAssignment(value: unknown) {
  const record = recordPayload(value, "tag assignment");
  return {
    customerId: readRequiredString(record.customerId, "customerId"),
    definition: tagDefinition(record.definition),
    id: readRequiredString(record.id, "id"),
    tagDefinitionId: readRequiredString(record.tagDefinitionId, "tagDefinitionId")
  };
}

function restoreResult(value: unknown) {
  const record = recordPayload(value, "restore result");
  const auditDraft = recordPayload(record.auditDraft, "audit draft");
  return {
    auditDraft: {
      action: exactText(auditDraft.action, "customer_restore_flags", "audit action"),
      actorUserId: readRequiredString(auditDraft.actorUserId, "actorUserId"),
      customerId: readRequiredString(auditDraft.customerId, "customerId"),
      eventType: optionalExactText(
        auditDraft.eventType,
        "customer.flags_restored",
        "audit eventType"
      ),
      reasonRef: readRequiredString(auditDraft.reasonRef, "reasonRef"),
      restoredFlags: readArrayField(auditDraft, "restoredFlags").map(restoredFlag)
    },
    item: customerSummary(record.item)
  };
}

function normalizeCustomerAssetRoot(basePath: string) {
  const requestedRoot = readRequiredString(basePath, "basePath");
  const withoutTrailingSlash = requestedRoot.replace(/\/+$/, "");
  const hasLocalPrefix =
    withoutTrailingSlash.charAt(0) === "/" && withoutTrailingSlash.charAt(1) !== "/";
  if (!hasLocalPrefix) {
    throw new Error("basePath must be relative");
  }
  return withoutTrailingSlash;
}

function readArrayField(source: Record<string, unknown>, key: string): unknown[] {
  const candidate = source[key];
  if (Array.isArray(candidate)) return candidate;
  throw new Error(`customer asset API ${key} must be an array`);
}

function recordPayload(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function optionalRecord(value: unknown, name: string) {
  return value === undefined ? undefined : recordPayload(value, name);
}

function booleanValue(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${name} must be boolean`);
  return value;
}

function optionalBoolean(value: unknown, name: string): boolean | undefined {
  if (value === undefined || typeof value === "boolean") return value;
  throw new Error(`${name} must be boolean`);
}

function readWholeNumber(value: unknown, name: string): number {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  throw new Error(`${name} must be an integer`);
}

function readOptionalString(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  return readRequiredString(value, name);
}

function readRequiredString(value: unknown, name: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length === 0) throw new Error(`${name} is required`);
  return text;
}

function exactText(value: unknown, expected: string, name: string): string {
  const text = readRequiredString(value, name);
  if (text !== expected) throw new Error(`${name} is invalid`);
  return text;
}

function optionalExactText(value: unknown, expected: string, name: string): string {
  if (value === undefined) return expected;
  return exactText(value, expected, name);
}

function restoredFlag(value: unknown): "blacklisted" | "unreachable" {
  if (value !== "blacklisted" && value !== "unreachable") {
    throw new Error("restored flag is invalid");
  }
  return value;
}
