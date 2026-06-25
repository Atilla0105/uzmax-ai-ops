type RuntimeArea = "aiMember" | "confirmationQueue" | "logsAnalytics" | "templateCopy";

export type M5AdminRuntimeMode = {
  aiMemberId?: string;
  enabled?: boolean;
  areas?: Partial<Record<RuntimeArea, boolean>>;
};

declare global {
  interface Window {
    __UZMAX_M5R_ADMIN_RUNTIME__?: M5AdminRuntimeMode;
  }
}

export const defaultM5RuntimeAiMemberId = "00000000-0000-4000-8000-000000000507";

export function readM5AdminRuntimeMode() {
  return typeof window === "undefined" ? undefined : window.__UZMAX_M5R_ADMIN_RUNTIME__;
}

export function isM5AdminRuntimeEnabled(area: RuntimeArea) {
  const config = readM5AdminRuntimeMode();
  return config?.enabled === true && config.areas?.[area] !== false;
}

export function getM5RuntimeAiMemberId() {
  return readM5AdminRuntimeMode()?.aiMemberId ?? defaultM5RuntimeAiMemberId;
}

export function createM5AdminRuntimeFetcher() {
  return (input: string, init?: RequestInit) => window.fetch(input, init);
}
