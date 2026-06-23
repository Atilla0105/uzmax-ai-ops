type ApiResponseLike = {
  json(): Promise<unknown>;
  ok: boolean;
  status: number;
};

export type OrderImportApiFetcher = (
  input: string,
  init?: { method?: "GET" }
) => Promise<ApiResponseLike>;

export function createOrderImportApiClient({
  basePath = "/order-import",
  fetcher
}: {
  basePath?: string;
  fetcher: OrderImportApiFetcher;
}) {
  if (typeof fetcher !== "function") throw new Error("fetcher is required");
  const root = normalizeBasePath(basePath);
  return {
    async listImportJobs() {
      const payload = await readJson(fetcher, `${root}/jobs`);
      return arrayPayload(payload, "items").map(jobItem);
    },
    async listImportRowErrors(jobId: string) {
      const payload = await readJson(
        fetcher,
        `${root}/jobs/${encodeURIComponent(requiredText(jobId, "jobId"))}/errors`
      );
      return arrayPayload(payload, "items").map(rowErrorItem);
    },
    async searchSnapshot(params: {
      now?: string;
      queryKind?:
        | "batch_ref"
        | "customer_ref"
        | "external_ref"
        | "order_ref"
        | "search_ref";
      queryRef: string;
    }) {
      const query = new URLSearchParams({
        queryKind: params.queryKind ?? "order_ref",
        queryRef: requiredText(params.queryRef, "queryRef")
      });
      if (params.now) query.set("now", params.now);
      return snapshotResult(
        await readJson(fetcher, `${root}/snapshots/search?${query}`)
      );
    }
  };
}

export type OrderImportApiClient = ReturnType<typeof createOrderImportApiClient>;

async function readJson(fetcher: OrderImportApiFetcher, path: string) {
  const response = await fetcher(path, { method: "GET" });
  if (!response.ok) {
    throw new Error(`order import API request failed with status ${response.status}`);
  }
  const payload = await response.json();
  return recordPayload(payload, "order import API response");
}

function normalizeBasePath(basePath: string) {
  const trimmed = requiredText(basePath, "basePath").replace(/\/+$/, "");
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    throw new Error("basePath must be relative");
  }
  return trimmed;
}

function arrayPayload(source: Record<string, unknown>, key: string): unknown[] {
  const value = source[key];
  if (!Array.isArray(value))
    throw new Error(`order import API ${key} must be an array`);
  return value;
}

function jobItem(value: unknown) {
  const record = recordPayload(value, "order import job");
  return {
    failedRows: integerValue(record.failedRows, "failedRows"),
    id: requiredText(record.id, "id"),
    sourceRef: requiredText(record.sourceRef, "sourceRef"),
    status: requiredText(record.status, "status"),
    successfulRows: integerValue(record.successfulRows, "successfulRows"),
    totalRows: integerValue(record.totalRows, "totalRows")
  };
}

function rowErrorItem(value: unknown) {
  const record = recordPayload(value, "order import row error");
  return {
    errorCode: requiredText(record.errorCode, "errorCode"),
    id: requiredText(record.id, "id"),
    importJobId: requiredText(record.importJobId, "importJobId"),
    messageRef: requiredText(record.messageRef, "messageRef"),
    rowNumber: integerValue(record.rowNumber, "rowNumber")
  };
}

function snapshotResult(value: unknown) {
  const record = recordPayload(value, "order snapshot search result");
  const status = requiredText(record.status, "status");
  if (status !== "snapshot_ready" && status !== "handoff_required") {
    throw new Error("order snapshot search status is invalid");
  }
  const customerVisible = recordPayload(record.customerVisible, "customerVisible");
  const handoff = recordPayload(record.handoff, "handoff") as { required?: unknown };
  const queryLogDraft = recordPayload(record.queryLogDraft, "queryLogDraft");
  if (status !== "snapshot_ready") {
    if (handoff.required !== true)
      throw new Error("handoff result must require handoff");
    if ("orderStatusRef" in customerVisible) {
      throw new Error("handoff result must not expose orderStatusRef");
    }
    const runtimeWarning = runtimeWarningPayload(
      record.runtimeWarning,
      requiredText(record.reasonCode, "reasonCode"),
      customerVisible,
      queryLogDraft
    );
    return {
      customerVisible,
      handoff: { required: true },
      queryLogDraft,
      reasonCode: requiredText(record.reasonCode, "reasonCode"),
      runtimeWarning,
      status
    };
  }
  if (record.runtimeWarning !== undefined) {
    throw new Error("snapshot_ready result must not include runtimeWarning");
  }
  return {
    customerVisible,
    handoff: { required: handoff.required === true },
    queryLogDraft,
    reasonCode: optionalText(record.reasonCode, "reasonCode"),
    status
  };
}

function runtimeWarningPayload(
  value: unknown,
  reasonCode: string,
  customerVisible: Record<string, unknown>,
  queryLogDraft: Record<string, unknown>
) {
  const warning = recordPayload(value, "runtimeWarning");
  const code = requiredText(warning.code, "runtimeWarning.code");
  if (code !== reasonCode) {
    throw new Error("runtimeWarning code must match reasonCode");
  }
  if (code !== requiredText(customerVisible.warningCode, "warningCode")) {
    throw new Error("runtimeWarning code must match customerVisible warningCode");
  }
  if (warning.handoffRequired !== true) {
    throw new Error("runtimeWarning must require handoff");
  }
  if (booleanValue(queryLogDraft.handoffRequired, "handoffRequired") !== true) {
    throw new Error("handoff queryLogDraft must require handoff");
  }
  const messageRef = requiredText(warning.messageRef, "runtimeWarning.messageRef");
  if (messageRef !== requiredText(queryLogDraft.reasonRef, "reasonRef")) {
    throw new Error("runtimeWarning messageRef must match queryLogDraft reasonRef");
  }
  const staleSnapshotUsed = booleanValue(
    warning.staleSnapshotUsed,
    "runtimeWarning.staleSnapshotUsed"
  );
  if (
    staleSnapshotUsed !==
    booleanValue(queryLogDraft.staleSnapshotUsed, "staleSnapshotUsed")
  ) {
    throw new Error("runtimeWarning staleSnapshotUsed must match queryLogDraft");
  }
  const expiresAt = optionalText(warning.expiresAt, "runtimeWarning.expiresAt");
  if (expiresAt !== optionalText(customerVisible.expiresAt, "expiresAt")) {
    throw new Error("runtimeWarning expiresAt must match customerVisible");
  }
  const sourceUpdatedAt = optionalText(
    warning.sourceUpdatedAt,
    "runtimeWarning.sourceUpdatedAt"
  );
  if (
    sourceUpdatedAt !== optionalText(customerVisible.sourceUpdatedAt, "sourceUpdatedAt")
  ) {
    throw new Error("runtimeWarning sourceUpdatedAt must match customerVisible");
  }
  return {
    code,
    expiresAt,
    handoffRequired: true,
    messageRef,
    sourceUpdatedAt,
    staleSnapshotUsed
  };
}

function recordPayload(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function integerValue(value: unknown, name: string): number {
  if (!Number.isInteger(value)) throw new Error(`${name} must be an integer`);
  return value as number;
}

function booleanValue(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${name} must be a boolean`);
  return value;
}

function optionalText(value: unknown, name: string): string | undefined {
  return value === undefined ? undefined : requiredText(value, name);
}

function requiredText(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}
