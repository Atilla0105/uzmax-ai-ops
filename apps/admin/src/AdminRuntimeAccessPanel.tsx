import { useState, type FormEvent } from "react";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
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
        <span className="uz-runtime-access__error" data-testid="admin-runtime-error">
          {access.error}
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
        {access.isSignedIn ? "API session active" : "API session required"}
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
  const [email, setEmail] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [password, setPassword] = useState("");
  const submitSignIn = (event: FormEvent) => {
    event.preventDefault();
    void access.signIn(email, password);
  };
  const submitToken = (event: FormEvent) => {
    event.preventDefault();
    access.saveManualToken(manualToken);
    setManualToken("");
  };
  const signInDisabled =
    access.isSigningIn || !config.supabaseUrl || !config.supabasePublishableKey;
  const supabaseConfigured = Boolean(
    config.supabaseUrl && config.supabasePublishableKey
  );

  return (
    <div className="uz-runtime-access__forms">
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
      </form>
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
    </div>
  );
}
