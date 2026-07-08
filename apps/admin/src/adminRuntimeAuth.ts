import { useCallback, useEffect, useState } from "react";
import {
  clearAccessToken,
  readStoredAccessToken,
  storeAccessToken,
  type AdminRuntimeConfig
} from "./adminRuntimeConfig";

type SessionSource = "manual" | "none" | "supabase";

type AdminRuntimeAccessState = {
  error: string;
  isConfigured: boolean;
  isSignedIn: boolean;
  isSigningIn: boolean;
  source: SessionSource;
};

export type AdminRuntimeAccess = AdminRuntimeAccessState & {
  saveManualToken(token: string): void;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

export function useAdminRuntimeAccess(config: AdminRuntimeConfig): AdminRuntimeAccess {
  const [state, setState] = useState<AdminRuntimeAccessState>(() => ({
    error: "",
    isConfigured: Boolean(config.apiBaseUrl),
    isSignedIn: Boolean(readStoredAccessToken()),
    isSigningIn: false,
    source: readStoredAccessToken() ? "manual" : "none"
  }));

  useEffect(() => {
    setState((current) => ({
      ...current,
      isConfigured: Boolean(config.apiBaseUrl)
    }));
  }, [config.apiBaseUrl]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!config.supabaseUrl || !config.supabasePublishableKey) {
        setState((current) => ({
          ...current,
          error: "Supabase runtime env is not configured."
        }));
        return;
      }
      setState((current) => ({ ...current, error: "", isSigningIn: true }));
      const result = await signInWithPassword(config, email, password);
      if ("error" in result) {
        clearAccessToken();
        setState((current) => ({
          ...current,
          error: result.error,
          isSignedIn: false,
          isSigningIn: false,
          source: "none"
        }));
        return;
      }
      storeAccessToken(result.accessToken);
      setState({
        error: "",
        isConfigured: Boolean(config.apiBaseUrl),
        isSignedIn: true,
        isSigningIn: false,
        source: "supabase"
      });
    },
    [config]
  );

  const saveManualToken = useCallback(
    (token: string) => {
      storeAccessToken(token);
      setState({
        error: "",
        isConfigured: Boolean(config.apiBaseUrl),
        isSignedIn: Boolean(token.trim()),
        isSigningIn: false,
        source: token.trim() ? "manual" : "none"
      });
    },
    [config.apiBaseUrl]
  );

  const signOut = useCallback(async () => {
    clearAccessToken();
    setState({
      error: "",
      isConfigured: Boolean(config.apiBaseUrl),
      isSignedIn: false,
      isSigningIn: false,
      source: "none"
    });
  }, [config.apiBaseUrl]);

  return {
    ...state,
    saveManualToken,
    signIn,
    signOut
  };
}

async function signInWithPassword(
  config: AdminRuntimeConfig,
  email: string,
  password: string
): Promise<{ accessToken: string } | { error: string }> {
  const response = await window.fetch(
    `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      body: JSON.stringify({ email, password }),
      headers: {
        apikey: config.supabasePublishableKey,
        "content-type": "application/json"
      },
      method: "POST"
    }
  );
  const payload = await safeJson(response);
  if (!response.ok) return { error: authErrorMessage(payload, response.status) };
  if (typeof payload.access_token !== "string" || !payload.access_token.trim()) {
    return { error: "Supabase session was not returned." };
  }
  return { accessToken: payload.access_token };
}

async function safeJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await response.json();
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    return {};
  }
  return {};
}

function authErrorMessage(payload: Record<string, unknown>, status: number) {
  for (const key of ["msg", "message", "error_description", "error"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return `Supabase sign-in failed with status ${status}`;
}
