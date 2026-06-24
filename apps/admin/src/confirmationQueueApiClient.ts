type RequestInitLike = {
  body?: string;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
};

export type ConfirmationQueueApiFetcher = (
  input: string,
  init?: RequestInitLike
) => Promise<{ json(): Promise<unknown>; ok: boolean; status: number }>;

export type ConfirmationDecisionRequest = {
  action: "approve" | "block" | "discard" | "edit";
  editedPayload?: Record<string, unknown>;
  editedPayloadRef?: string;
  reasonRef?: string;
};

const KINDS = [
  "conflict_candidate",
  "eval_candidate",
  "knowledge_candidate",
  "profile_candidate"
] as const;
const STATUSES = ["approved", "blocked", "discarded", "edited", "pending"] as const;
const FILTER_STATUSES = [...STATUSES, "all"] as const;
const ACTIONS = ["approve", "block", "discard", "edit"] as const;
const FORBIDDEN_KEYS = new Set(
  "address blob body completion content customerplaintext data file http https orderid payment phone prompt raw secret telegrampayload".split(
    " "
  )
);
const CONTROLLED_REF_PATTERN = /^(controlled|manifest|storage):\/\/[^\s]+$/i;
const INLINE_REF_PATTERN = /^[A-Za-z0-9+/_-]{40,}={0,2}$/;

export function createConfirmationQueueApiClient({
  basePath = "/confirmation-queue",
  fetcher
}: {
  basePath?: string;
  fetcher: ConfirmationQueueApiFetcher;
}) {
  if (typeof fetcher !== "function") throw new Error("fetcher is required");
  const root = normalizeBasePath(basePath);
  return {
    async listItems(filters: { kind?: string; status?: string } = {}) {
      const query = new URLSearchParams();
      if (filters.kind) query.set("kind", enumText(filters.kind, KINDS, "kind"));
      if (filters.status)
        query.set("status", enumText(filters.status, FILTER_STATUSES, "status"));
      const suffix = query.size > 0 ? `?${query}` : "";
      const payload = await readJson(fetcher, `${root}/items${suffix}`);
      return arrayField(payload, "items").map(queueItem);
    },
    async getItem(itemId: string) {
      const payload = await readJson(
        fetcher,
        `${root}/items/${encodeURIComponent(requiredText(itemId, "itemId"))}`
      );
      return queueItem(payload.item);
    },
    async submitDecision(itemId: string, input: ConfirmationDecisionRequest) {
      const body = decisionRequest(input);
      return decisionResult(
        await readJson(
          fetcher,
          `${root}/items/${encodeURIComponent(requiredText(itemId, "itemId"))}/decisions`,
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

async function readJson(
  fetcher: ConfirmationQueueApiFetcher,
  path: string,
  init: RequestInitLike = { method: "GET" }
) {
  const response = await fetcher(path, init);
  if (!response.ok) {
    throw new Error(
      `confirmation queue API request failed with status ${response.status}`
    );
  }
  return recordPayload(await response.json(), "confirmation queue API response");
}

function decisionRequest(input: ConfirmationDecisionRequest) {
  const record = recordPayload(input, "decision");
  assertSafePayload(record, "decision");
  const action = enumText(record.action, ACTIONS, "action");
  const editedPayload =
    record.editedPayload === undefined
      ? undefined
      : recordPayload(record.editedPayload, "editedPayload");
  if (editedPayload) assertEditedPayload(editedPayload, "editedPayload");
  const body = {
    action,
    editedPayload,
    editedPayloadRef: optionalControlledRef(
      record.editedPayloadRef,
      "editedPayloadRef"
    ),
    reasonRef: optionalControlledRef(record.reasonRef, "reasonRef")
  };
  if (action === "edit" && !body.editedPayload && !body.editedPayloadRef) {
    throw new Error("edit decision requires editedPayload or editedPayloadRef");
  }
  return body;
}

function queueItem(value: unknown) {
  const record = recordPayload(value, "confirmation item");
  const kind = enumText(record.kind, KINDS, "kind");
  const item = {
    candidatePayload: recordPayload(record.candidatePayload, "candidatePayload"),
    createdAt: requiredText(record.createdAt, "createdAt"),
    diffPayload:
      record.diffPayload === undefined
        ? undefined
        : recordPayload(record.diffPayload, "diffPayload"),
    id: requiredText(record.id, "id"),
    kind,
    orgId: requiredText(record.orgId, "orgId"),
    sourceRef: controlledRef(record.sourceRef, "sourceRef"),
    status: enumText(record.status, STATUSES, "status"),
    tenantId: requiredText(record.tenantId, "tenantId")
  };
  assertSafePayload(item.candidatePayload, "candidatePayload", true);
  if (item.diffPayload) {
    assertSafePayload(item.diffPayload, "diffPayload", true);
    assertSideBySideDiff(item.diffPayload);
  }
  if (kind === "conflict_candidate" && !item.diffPayload) {
    throw new Error("conflict candidate requires diffPayload");
  }
  return item;
}

function decisionResult(value: unknown) {
  const record = recordPayload(value, "decision result");
  const auditDraft = recordPayload(record.auditDraft, "auditDraft");
  if (record.formalWrite !== false || auditDraft.formalWrite !== false) {
    throw new Error("decision result must keep formalWrite false");
  }
  enumText(auditDraft.action, ACTIONS, "auditDraft.action");
  controlledRef(auditDraft.auditRef, "auditDraft.auditRef");
  requiredText(auditDraft.itemId, "auditDraft.itemId");
  optionalControlledRef(auditDraft.reasonRef, "auditDraft.reasonRef");
  requiredText(auditDraft.reviewedAt, "auditDraft.reviewedAt");
  requiredText(auditDraft.reviewerUserId, "auditDraft.reviewerUserId");
  return { auditDraft, formalWrite: false, item: queueItem(record.item) };
}

function normalizeBasePath(basePath: string) {
  const root = requiredText(basePath, "basePath").replace(/\/+$/, "");
  if (!root.startsWith("/") || root.startsWith("//")) {
    throw new Error("basePath must be relative");
  }
  return root;
}

function assertSideBySideDiff(record: Record<string, unknown>) {
  const pairs = [
    ["left", "right"],
    ["current", "candidate"],
    ["before", "after"]
  ] as const;
  const hasPair = pairs.some(
    ([left, right]) => hasDiffSideRef(record[left]) && hasDiffSideRef(record[right])
  );
  if (!hasPair) throw new Error("diffPayload requires side-by-side refs");
}

function hasDiffSideRef(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, child]) => key === "ref" || key.endsWith("Ref") || hasDiffSideRef(child)
  );
}

function assertSafePayload(value: unknown, path: string, controlledStrings = false) {
  if (typeof value === "string") {
    if (controlledStrings) controlledRef(value, path);
    else assertSafeString(value, path);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertSafePayload(entry, `${path}[${index}]`, controlledStrings)
    );
    return;
  }
  assertSafeRecord(value as Record<string, unknown>, path, controlledStrings);
}

function assertSafeString(value: string, path: string) {
  if (/^(?:https?|data|blob|file):/i.test(value) || INLINE_REF_PATTERN.test(value)) {
    throw new Error(`${path} must be a controlled ref`);
  }
}

function assertSafeRecord(
  record: Record<string, unknown>,
  path: string,
  controlledStrings = false
) {
  for (const [key, child] of Object.entries(record)) {
    const childPath = `${path}.${key}`;
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      throw new Error(`${childPath} is a forbidden raw payload key`);
    }
    if (key === "ref" || key.endsWith("Ref")) controlledRef(child, childPath);
    assertSafePayload(child, childPath, controlledStrings);
  }
}

function assertEditedPayload(record: Record<string, unknown>, path: string) {
  for (const [key, value] of Object.entries(record)) {
    if (!key.endsWith("Ref")) {
      throw new Error(`${path}.${key} must be a controlled ref field`);
    }
    controlledRef(value, `${path}.${key}`);
  }
}

function arrayField(source: Record<string, unknown>, key: string): unknown[] {
  if (!Array.isArray(source[key])) throw new Error(`${key} must be an array`);
  return source[key];
}

function recordPayload(value: unknown, name: string) {
  if (Array.isArray(value) || value === null || typeof value !== "object") {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function controlledRef(value: unknown, name: string) {
  const text = requiredText(value, name);
  if (INLINE_REF_PATTERN.test(text) || !CONTROLLED_REF_PATTERN.test(text)) {
    throw new Error(`${name} must be a controlled ref`);
  }
  return text;
}

function optionalControlledRef(value: unknown, name: string) {
  return value === undefined ? undefined : controlledRef(value, name);
}

function enumText<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  name: string
): T[number] {
  const text = requiredText(value, name);
  if (!(allowed as readonly string[]).includes(text)) {
    throw new Error(`${name} is invalid`);
  }
  return text;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requiredText(value: unknown, name: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${name} is required`);
  return text;
}
