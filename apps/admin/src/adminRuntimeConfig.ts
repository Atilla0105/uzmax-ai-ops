type RuntimeEnv = "local" | "production" | "staging";
type TenantHealth = "attention" | "breaker" | "degraded" | "healthy";

export type AdminRuntimeTenant = {
  health: TenantHealth;
  id: string;
  line: string;
  name: string;
  risk: string;
  status: string;
};

export type AdminRuntimeConfig = {
  apiBaseUrl: string;
  env: RuntimeEnv;
  orgId: string;
  strictRuntime: boolean;
  supabasePublishableKey: string;
  supabaseUrl: string;
  tenants?: readonly [AdminRuntimeTenant, ...AdminRuntimeTenant[]];
};

export type AdminRuntimeFetchInit = {
  body?: BodyInit | null;
  headers?: HeadersInit;
  method?: string;
};

export type AdminRuntimeFetcherOptions = {
  selectedTenantId?: string;
};

const accessTokenStorageKey = "uzmax.admin.runtime.accessToken";

export const fallbackAdminRuntimeTenants = [
  tenant(
    "tenant-a",
    "玉珠跨境美妆",
    "美妆 · 中亚",
    "healthy",
    "健康",
    "aggregate only"
  ),
  tenant(
    "tenant-b",
    "丝路数码",
    "3C数码 · 俄语区",
    "degraded",
    "降级",
    "connector degraded"
  ),
  tenant(
    "tenant-c",
    "天净家居",
    "家居 · 哈萨克",
    "attention",
    "需人工",
    "manual review"
  ),
  tenant("tenant-d", "白桦母婴", "母婴 · 俄语区", "breaker", "熔断", "breaker offline")
] as const satisfies readonly [AdminRuntimeTenant, ...AdminRuntimeTenant[]];

export function readAdminRuntimeConfig(): AdminRuntimeConfig {
  const env = import.meta.env;
  const apiBaseUrl = normalizeApiBaseUrl(env.VITE_UZMAX_API_BASE_URL);
  return {
    apiBaseUrl,
    env: runtimeEnv(env.VITE_UZMAX_RUNTIME_ENV),
    orgId: envText(env.VITE_UZMAX_ORG_ID),
    strictRuntime: Boolean(apiBaseUrl) || envFlag(env.VITE_UZMAX_RUNTIME_STRICT),
    supabasePublishableKey: envText(env.VITE_UZMAX_SUPABASE_PUBLISHABLE_KEY),
    supabaseUrl: normalizeApiBaseUrl(env.VITE_UZMAX_SUPABASE_URL),
    tenants: runtimeTenants(env)
  };
}

export function createAdminRuntimeFetcher(
  config = readAdminRuntimeConfig(),
  options: AdminRuntimeFetcherOptions = {}
) {
  return (input: string, init: AdminRuntimeFetchInit = {}) => {
    const path = normalizeRuntimePath(input);
    const headers = new Headers(init.headers);
    const tenantId = runtimeTenantHeader(config, options.selectedTenantId);
    const accessToken = readStoredAccessToken();
    if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
    if (config.orgId) headers.set("x-org-id", config.orgId);
    if (tenantId) headers.set("x-tenant-id", tenantId);
    return window.fetch(`${config.apiBaseUrl}${path}`, {
      ...init,
      headers
    });
  };
}

export function storeAccessToken(token: string) {
  const trimmed = token.trim();
  if (!trimmed) {
    clearAccessToken();
    return;
  }
  window.sessionStorage.setItem(accessTokenStorageKey, trimmed);
}

export function readStoredAccessToken() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(accessTokenStorageKey) ?? "";
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(accessTokenStorageKey);
}

function runtimeEnv(value: string | undefined): RuntimeEnv {
  const normalized = envText(value);
  if (normalized === "production" || normalized === "staging") return normalized;
  return "production";
}

function runtimeTenants(env: ImportMetaEnv) {
  const tenantId = envText(env.VITE_UZMAX_TENANT_ID);
  if (!tenantId) return undefined;
  return [
    tenant(
      tenantId,
      envText(env.VITE_UZMAX_TENANT_NAME) || "Staging tenant",
      envText(env.VITE_UZMAX_TENANT_LINE) || "Runtime tenant",
      "healthy",
      "运行中",
      "staging runtime"
    )
  ] as const satisfies readonly [AdminRuntimeTenant, ...AdminRuntimeTenant[]];
}

function runtimeTenantHeader(
  config: AdminRuntimeConfig,
  selectedTenantId: string | undefined
) {
  const tenantId = envText(selectedTenantId);
  if (!config.strictRuntime) return tenantId;
  if (!tenantId)
    throw new Error("admin runtime selected tenant is required in strict runtime");
  if (!config.tenants?.length)
    throw new Error("admin runtime tenant configuration is required in strict runtime");
  if (!config.tenants.some((tenant) => tenant.id === tenantId))
    throw new Error(
      `admin runtime selected tenant ${tenantId} is not configured for strict runtime`
    );
  return tenantId;
}

function tenant(
  id: string,
  name: string,
  line: string,
  health: TenantHealth,
  status: string,
  risk: string
) {
  return { health, id, line, name, risk, status } satisfies AdminRuntimeTenant;
}

function normalizeApiBaseUrl(value: string | undefined) {
  return envText(value).replace(/\/+$/, "");
}

function envText(value: string | undefined) {
  return value?.trim() ?? "";
}

function envFlag(value: string | undefined) {
  return envText(value).toLowerCase() === "true";
}

function normalizeRuntimePath(input: string) {
  if (!input.startsWith("/") || input.startsWith("//")) {
    throw new Error("admin runtime API path must be relative");
  }
  return input;
}
