import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthChangeEvent, SupabaseClient } from "@supabase/supabase-js";
import {
  clearAccessToken,
  readStoredAccessToken,
  storeAccessToken,
  type AdminRuntimeConfig
} from "./adminRuntimeConfig";

type CallbackKind = "invite" | "recovery";
type SessionSource = "manual" | "none" | "supabase";

type AdminRuntimeAccessState = {
  callbackKind: CallbackKind | null;
  error: string;
  feedback: string;
  isRequestingReset: boolean;
  isSignedIn: boolean;
  isSigningIn: boolean;
  isUpdatingPassword: boolean;
  source: SessionSource;
};

export type AdminRuntimeAccess = AdminRuntimeAccessState & {
  requestPasswordReset(email: string): Promise<void>;
  saveManualToken(token: string): void;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  updatePassword(password: string): Promise<void>;
};

export const adminAuthRedirectUrl = "https://uzmax-admin.vercel.app/";

export function useAdminRuntimeAccess(config: AdminRuntimeConfig): AdminRuntimeAccess {
  const initialToken = readStoredAccessToken();
  const [state, setState] = useState<AdminRuntimeAccessState>(() => ({
    callbackKind: null,
    error: "",
    feedback: "",
    isRequestingReset: false,
    isSignedIn: Boolean(initialToken),
    isSigningIn: false,
    isUpdatingPassword: false,
    source: initialToken ? "manual" : "none"
  }));
  const clientRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    if (!config.supabaseUrl || !config.supabasePublishableKey) return;
    const callback = readAuthCallback(window.location);
    if (callback.isSupported) {
      clearAccessToken();
      setState((current) => ({
        ...current,
        callbackKind: null,
        error: "",
        feedback: "正在验证安全链接…",
        isSignedIn: false,
        source: "none"
      }));
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;
    const rejectAuthCallback = (error: string) => {
      clearAccessToken();
      clearAuthCallbackUrl();
      setState((current) => ({
        ...current,
        callbackKind: null,
        error,
        feedback: "",
        isSignedIn: false,
        source: "none"
      }));
    };
    const initializeClient = async () => {
      const { createClient } = await import("@supabase/supabase-js");
      if (!active) return;
      const client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: true,
          flowType: "implicit",
          persistSession: false
        }
      });
      clientRef.current = client;
      const listener = client.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        const callbackKind = callback.isSupported
          ? callbackKindForEvent(event, callback.kind)
          : null;
        if (!callbackKind) return;
        if (!session?.access_token) {
          rejectAuthCallback("安全链接无有效会话，请重新发送重置邮件。");
          return;
        }
        clearAuthCallbackUrl();
        setState((current) => ({
          ...current,
          callbackKind,
          error: "",
          feedback:
            callbackKind === "invite"
              ? "邀请已验证，请设置登录密码。"
              : "重置链接已验证，请设置新密码。",
          isSignedIn: false,
          source: "none"
        }));
      });
      unsubscribe = () => listener.data.subscription.unsubscribe();

      if (callback.error) {
        rejectAuthCallback("安全链接无效或已过期，请重新发送重置邮件。");
      } else if (callback.hasAuthMaterial && !callback.isSupported) {
        rejectAuthCallback("安全链接类型无法识别或已过期，请重新发送重置邮件。");
      }
    };
    void initializeClient().catch(() => {
      if (active) rejectAuthCallback("Supabase client 初始化失败，请刷新后重试。");
    });

    return () => {
      active = false;
      unsubscribe?.();
      clientRef.current = null;
    };
  }, [config.supabasePublishableKey, config.supabaseUrl]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!email.trim() || !password) {
        setError(setState, "请输入邮箱和密码。");
        return;
      }
      const client = clientRef.current;
      if (!client) {
        setError(setState, "Supabase runtime env is not configured.");
        return;
      }
      setState((current) => ({
        ...current,
        error: "",
        feedback: "",
        isSigningIn: true
      }));
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      const accessToken = data.session?.access_token?.trim();
      if (error || !accessToken) {
        clearAccessToken();
        setState((current) => ({
          ...current,
          error: safeAuthError(error, "Supabase session was not returned."),
          feedback: "",
          isSignedIn: false,
          isSigningIn: false,
          source: "none"
        }));
        return;
      }
      storeAccessToken(accessToken);
      setState(readyState(config, "supabase", "登录成功，API session active。"));
    },
    [config]
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!email.trim()) {
      setError(setState, "请输入邮箱后再发送重置邮件。");
      return;
    }
    const client = clientRef.current;
    if (!client) {
      setError(setState, "Supabase runtime env is not configured.");
      return;
    }
    setState((current) => ({
      ...current,
      error: "",
      feedback: "",
      isRequestingReset: true
    }));
    const { error } = await client.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: adminAuthRedirectUrl }
    );
    setState((current) => ({
      ...current,
      error: error ? safeAuthError(error, "重置邮件请求失败。") : "",
      feedback: error ? "" : "重置邮件请求已提交，请检查邮箱。",
      isRequestingReset: false
    }));
  }, []);

  const updatePassword = useCallback(
    async (password: string) => {
      if (!password) {
        setError(setState, "请输入新密码。");
        return;
      }
      const client = clientRef.current;
      if (!client) {
        setError(setState, "Supabase runtime env is not configured.");
        return;
      }
      setState((current) => ({
        ...current,
        error: "",
        feedback: "",
        isUpdatingPassword: true
      }));
      const update = await client.auth.updateUser({ password });
      if (update.error) {
        setState((current) => ({
          ...current,
          error: safeAuthError(update.error, "密码更新失败。"),
          feedback: "",
          isUpdatingPassword: false
        }));
        return;
      }
      const currentSession = await client.auth.getSession();
      const accessToken = currentSession.data.session?.access_token?.trim();
      if (currentSession.error || !accessToken) {
        clearAccessToken();
        setState((current) => ({
          ...current,
          error: safeAuthError(
            currentSession.error,
            "密码已更新，但安全会话缺失，请重新登录。"
          ),
          feedback: "",
          isSignedIn: false,
          isUpdatingPassword: false,
          source: "none"
        }));
        return;
      }
      storeAccessToken(accessToken);
      setState(readyState(config, "supabase", "密码已更新，API session active。"));
    },
    [config]
  );

  const saveManualToken = useCallback(
    (token: string) => {
      storeAccessToken(token);
      setState({
        ...readyState(config, token.trim() ? "manual" : "none", ""),
        isSignedIn: Boolean(token.trim())
      });
    },
    [config]
  );

  const signOut = useCallback(async () => {
    if (state.source === "supabase" && clientRef.current) {
      await clientRef.current.auth.signOut({ scope: "local" });
    }
    clearAccessToken();
    setState(readyState(config, "none", ""));
  }, [config, state.source]);

  return {
    ...state,
    requestPasswordReset,
    saveManualToken,
    signIn,
    signOut,
    updatePassword
  };
}

function readyState(
  config: AdminRuntimeConfig,
  source: SessionSource,
  feedback: string
): AdminRuntimeAccessState {
  return {
    callbackKind: null,
    error: "",
    feedback,
    isRequestingReset: false,
    isSignedIn: source !== "none",
    isSigningIn: false,
    isUpdatingPassword: false,
    source
  };
}

function setError(
  setter: React.Dispatch<React.SetStateAction<AdminRuntimeAccessState>>,
  error: string
) {
  setter((current) => ({ ...current, error, feedback: "" }));
}

function callbackKindForEvent(
  event: AuthChangeEvent,
  urlKind: CallbackKind | null
): CallbackKind | null {
  if (event === "PASSWORD_RECOVERY") return "recovery";
  if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && urlKind) {
    return urlKind;
  }
  return null;
}

function readAuthCallback(location: Location) {
  const query = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.replace(/^#/, ""));
  const type = fragment.get("type") ?? query.get("type");
  const kind: CallbackKind | null =
    type === "invite" || type === "recovery" ? type : null;
  const hasImplicitSession = callbackSessionKeys.every(
    (key) => query.has(key) || fragment.has(key)
  );
  const hasCode = query.has("code") || fragment.has("code");
  const hasAuthMaterial = callbackUrlKeys.some(
    (key) => query.has(key) || fragment.has(key)
  );
  return {
    error: query.has("error") || fragment.has("error"),
    hasAuthMaterial,
    isSupported: Boolean(kind && hasImplicitSession && !hasCode),
    kind
  };
}

function clearAuthCallbackUrl() {
  const url = new URL(window.location.href);
  for (const key of callbackUrlKeys) url.searchParams.delete(key);
  url.hash = "";
  const clean = `${url.pathname}${url.search}` || "/";
  window.history.replaceState({}, document.title, clean);
}

const callbackUrlKeys =
  "access_token code error error_code error_description expires_at expires_in provider_refresh_token provider_token refresh_token token_hash token_type type".split(
    " "
  );
const callbackSessionKeys = ["access_token", "refresh_token"] as const;

function safeAuthError(error: { message?: string } | null, fallback: string) {
  const message = error?.message?.trim();
  if (!message || /access_token|refresh_token|eyJ[a-zA-Z0-9_-]+/i.test(message)) {
    return fallback;
  }
  return message;
}
