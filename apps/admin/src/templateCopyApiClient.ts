type Init = { body?: string; headers?: Record<string, string>; method?: string };
type Fetcher = (
  input: string,
  init?: Init
) => Promise<{ json(): Promise<unknown>; ok: boolean; status: number }>;

export function createTemplateCopyApiClient({
  basePath = "/template-copy",
  fetcher
}: {
  basePath?: string;
  fetcher: Fetcher;
}) {
  const root = basePath.replace(/\/+$/, "");
  return {
    copyToTenant: (input: Record<string, unknown>) =>
      request(fetcher, `${root}/copies`, {
        body: JSON.stringify(input),
        headers: { "content-type": "application/json" },
        method: "POST"
      }).then(record)
  };
}

async function request(fetcher: Fetcher, path: string, init: Init) {
  const response = await fetcher(path, init);
  if (!response.ok)
    throw new Error(`template copy API request failed with status ${response.status}`);
  return response.json();
}

function record(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("template copy response must be an object");
  return value as Record<string, unknown>;
}
