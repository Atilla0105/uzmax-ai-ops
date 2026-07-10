import { useState, type FormEvent } from "react";
import { LogIn, LogOut, Mail, ShieldCheck } from "lucide-react";
import { Button, IconSlot } from "./primitives";
import type { AdminRuntimeAccess } from "./adminRuntimeAuth";
import type { AdminRuntimeConfig } from "./adminRuntimeConfig";

type Props = {
  access: AdminRuntimeAccess;
  config: AdminRuntimeConfig;
};

export function AdminRuntimeAccessPanel({ access, config }: Props) {
  if (!config.apiBaseUrl) return null;
  return (
    <section className="uz-runtime-access" data-testid="admin-runtime-access">
      <AccessStatus access={access} config={config} />
      {access.isSignedIn ? (
        <SignedInAction access={access} />
      ) : (
        <AccessForms access={access} config={config} />
      )}
      {access.error ? (
        <span
          className="uz-runtime-access__error"
          data-testid="admin-runtime-error"
          role="alert"
        >
          {access.error}
        </span>
      ) : null}
      {access.feedback ? (
        <span
          aria-live="polite"
          className="uz-runtime-access__error uz-runtime-access__feedback"
        >
          {access.feedback}
        </span>
      ) : null}
    </section>
  );
}

function AccessStatus({ access, config }: Props) {
  return (
    <div className="uz-runtime-access__status">
      <IconSlot icon={ShieldCheck} />
      <span>{config.env}</span>
      <strong>
        {access.isSignedIn
          ? "API session active"
          : access.callbackKind
            ? "Set account password"
            : "API session required"}
      </strong>
      <span>{config.tenants?.[0]?.name ?? "tenant scope missing"}</span>
    </div>
  );
}

function SignedInAction({ access }: Pick<Props, "access">) {
  return (
    <Button
      data-testid="admin-runtime-sign-out"
      icon={<IconSlot icon={LogOut} />}
      onClick={() => void access.signOut()}
      variant="secondary"
    >
      退出
    </Button>
  );
}

function AccessForms({ access, config }: Props) {
  return (
    <div className="uz-runtime-access__forms">
      {access.callbackKind ? (
        <PasswordSetupForm access={access} />
      ) : (
        <SignInForm access={access} config={config} />
      )}
      <ManualTokenForm access={access} />
    </div>
  );
}

function SignInForm({ access, config }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submitSignIn = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    void access.signIn(email, password);
  };
  const requestReset = () => {
    if (!email.trim()) return;
    void access.requestPasswordReset(email);
  };
  const signInDisabled =
    access.isSigningIn ||
    access.isRequestingReset ||
    !email.trim() ||
    !password ||
    !config.supabaseUrl ||
    !config.supabasePublishableKey;
  const supabaseConfigured = Boolean(
    config.supabaseUrl && config.supabasePublishableKey
  );

  return (
    <form onSubmit={submitSignIn}>
      <input
        aria-label="Staging email"
        autoComplete="username"
        disabled={!supabaseConfigured}
        onChange={(event) => setEmail(event.currentTarget.value)}
        placeholder="email"
        type="email"
        value={email}
      />
      <input
        aria-label="Staging password"
        autoComplete="current-password"
        disabled={!supabaseConfigured}
        onChange={(event) => setPassword(event.currentTarget.value)}
        placeholder="password"
        type="password"
        value={password}
      />
      <Button
        data-testid="admin-runtime-sign-in"
        disabled={signInDisabled}
        icon={<IconSlot icon={LogIn} />}
        isLoading={access.isSigningIn}
        type="submit"
        variant="primary"
      >
        登录
      </Button>
      <Button
        data-testid="admin-runtime-reset-password"
        disabled={
          access.isRequestingReset ||
          access.isSigningIn ||
          !email.trim() ||
          !supabaseConfigured
        }
        icon={<IconSlot icon={Mail} />}
        isLoading={access.isRequestingReset}
        onClick={requestReset}
        type="button"
        variant="ghost"
      >
        重置密码
      </Button>
    </form>
  );
}

function PasswordSetupForm({ access }: Pick<Props, "access">) {
  const [password, setPassword] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!password) return;
    void access.updatePassword(password);
  };
  return (
    <form
      className="uz-runtime-access__callback"
      data-testid="admin-runtime-password-setup"
      onSubmit={submit}
    >
      <span>
        {access.callbackKind === "invite" ? "设置受邀账号密码" : "设置新密码"}
      </span>
      <input
        aria-label="New staging password"
        autoComplete="new-password"
        onChange={(event) => setPassword(event.currentTarget.value)}
        type="password"
        value={password}
      />
      <Button
        data-testid="admin-runtime-update-password"
        disabled={access.isUpdatingPassword || !password}
        isLoading={access.isUpdatingPassword}
        type="submit"
        variant="primary"
      >
        保存并进入
      </Button>
    </form>
  );
}

function ManualTokenForm({ access }: Pick<Props, "access">) {
  const [manualToken, setManualToken] = useState("");
  const submitToken = (event: FormEvent) => {
    event.preventDefault();
    if (!manualToken.trim()) return;
    access.saveManualToken(manualToken);
    setManualToken("");
  };
  return (
    <form onSubmit={submitToken}>
      <input
        aria-label="Staging access token"
        autoComplete="off"
        onChange={(event) => setManualToken(event.currentTarget.value)}
        placeholder="access token"
        type="password"
        value={manualToken}
      />
      <Button
        data-testid="admin-runtime-save-token"
        disabled={!manualToken.trim()}
        type="submit"
        variant="secondary"
      >
        使用 token
      </Button>
    </form>
  );
}
