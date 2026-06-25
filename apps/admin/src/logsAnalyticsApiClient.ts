type Init = { body?: string; headers?: Record<string, string>; method?: string };
type Fetcher = (
  input: string,
  init?: Init
) => Promise<{ json(): Promise<unknown>; ok: boolean; status: number }>;

export function createLogsAnalyticsApiClient({
  basePath = "/logs-analytics",
  fetcher
}: {
  basePath?: string;
  fetcher: Fetcher;
}) {
  const root = basePath.replace(/\/+$/, "");
  const list = (name: string, filters: Record<string, string | number> = {}) =>
    request(fetcher, `${root}/${name}${query(filters)}`).then(array);
  return {
    createExportJob: (input: Record<string, unknown>) =>
      request(fetcher, `${root}/export-jobs`, {
        body: JSON.stringify(input),
        headers: { "content-type": "application/json" },
        method: "POST"
      }).then(record),
    getBoard: () => request(fetcher, `${root}/board`).then(record),
    listLoginLogs: (filters?: Record<string, string | number>) =>
      list("login-logs", filters),
    listOperationLogs: (filters?: Record<string, string | number>) =>
      list("operation-logs", filters),
    listPresenceLogs: (filters?: Record<string, string | number>) =>
      list("presence-logs", filters)
  };
}

async function request(fetcher: Fetcher, path: string, init: Init = { method: "GET" }) {
  const response = await fetcher(path, init);
  if (!response.ok)
    throw new Error(`logs analytics API request failed with status ${response.status}`);
  return response.json();
}

function query(filters: Record<string, string | number>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) params.set(key, String(value));
  return params.size ? `?${params}` : "";
}

function array(value: unknown) {
  if (!Array.isArray(value)) throw new Error("logs response must be an array");
  return value.map(record);
}

function record(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("logs response must be an object");
  return value as Record<string, unknown>;
}
