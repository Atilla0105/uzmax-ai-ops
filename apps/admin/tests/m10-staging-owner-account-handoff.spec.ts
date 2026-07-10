import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { expect, test, type Page } from "@playwright/test";

const runtimeUrl = "http://127.0.0.1:4174";
let server: ChildProcess;

test.describe.configure({ mode: "serial" });
test.use({ baseURL: runtimeUrl });

test.beforeAll(async () => {
  server = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "apps/admin",
      "--host",
      "127.0.0.1",
      "--port",
      "4174"
    ],
    {
      env: {
        ...process.env,
        VITE_UZMAX_API_BASE_URL: "http://127.0.0.1:9999",
        VITE_UZMAX_ORG_ID: "11111111-1111-4111-8111-111111111604",
        VITE_UZMAX_RUNTIME_ENV: "staging",
        VITE_UZMAX_SUPABASE_PUBLISHABLE_KEY: "controlled-publishable-key",
        VITE_UZMAX_SUPABASE_URL: "https://supabase.example.test",
        VITE_UZMAX_TENANT_ID: "22222222-2222-4222-8222-222222222604",
        VITE_UZMAX_TENANT_NAME: "Controlled staging tenant"
      },
      stdio: "ignore"
    }
  );
  await waitForServer();
});

test.afterAll(async () => {
  if (!server?.killed) server.kill("SIGTERM");
  if (server?.exitCode === null) await once(server, "exit");
});

test("validates blank controls, reset, manual token and same-page callback recovery", async ({
  page
}) => {
  const calls = await routeSupabase(page);
  await page.goto("/");

  const signIn = page.getByTestId("admin-runtime-sign-in");
  const reset = page.getByTestId("admin-runtime-reset-password");
  await expect(signIn).toBeDisabled();
  await expect(reset).toBeDisabled();
  await page.getByLabel("Staging email").fill("operator@example.test");
  await expect(reset).toBeEnabled();
  await expect(signIn).toBeDisabled();
  await reset.click();
  await expect(page.getByText("重置邮件请求已提交，请检查邮箱。")).toBeVisible();

  await page.getByLabel("Staging access token").fill("controlled-manual-token");
  await page.getByTestId("admin-runtime-save-token").click();
  await expect(page.getByTestId("admin-runtime-sign-out")).toBeVisible();
  expect(await hasStoredToken(page)).toBe(true);
  await page.getByTestId("admin-runtime-sign-out").click();
  expect(await hasStoredToken(page)).toBe(false);

  await page.goto("/?code=opaque&type=invite");
  await expect(page.getByTestId("admin-runtime-error")).toContainText(
    "安全链接类型无法识别"
  );
  expect(new URL(page.url()).search).toBe("");
  await page.getByLabel("Staging email").fill("operator@example.test");
  await page.getByLabel("Staging password").fill("controlled-password");
  await expect(signIn).toBeEnabled();
  await signIn.click();
  await expect(page.getByTestId("admin-runtime-sign-out")).toBeVisible();
  expect(calls.filter((call) => call === "recover")).toHaveLength(1);
  expect(calls.filter((call) => call === "password")).toHaveLength(1);
});

for (const callbackKind of ["invite", "recovery"] as const) {
  test(`${callbackKind} callback updates password, cleans URL and stores current session`, async ({
    page
  }) => {
    const calls = await routeSupabase(page);
    await page.goto(`/#${implicitCallback(callbackKind)}`);
    await expect(page.getByTestId("admin-runtime-password-setup")).toBeVisible();
    expect(page.url()).not.toContain("access_token");
    expect(page.url()).not.toContain("refresh_token");
    await page.getByLabel("New staging password").fill("controlled-new-password");
    await page.getByTestId("admin-runtime-update-password").click();
    await expect(page.getByTestId("admin-runtime-sign-out")).toBeVisible();
    expect(await hasStoredToken(page)).toBe(true);
    expect(calls.filter((call) => call === "update-user")).toHaveLength(1);
  });
}

async function routeSupabase(page: Page) {
  const calls: string[] = [];
  await page.route("http://127.0.0.1:9999/**", (route) =>
    route.fulfill({ json: { error: "controlled API unavailable" }, status: 401 })
  );
  await page.route("https://supabase.example.test/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === "/auth/v1/recover") {
      calls.push("recover");
      return route.fulfill({ json: {} });
    }
    if (path === "/auth/v1/token") {
      calls.push("password");
      return route.fulfill({ json: sessionPayload() });
    }
    if (path === "/auth/v1/user" && request.method() === "PUT") {
      calls.push("update-user");
      const body = request.postDataJSON();
      expect(body).toMatchObject({ password: "controlled-new-password" });
      expect(body).not.toHaveProperty("access_token");
      expect(body).not.toHaveProperty("role");
      return route.fulfill({ json: controlledUser() });
    }
    if (path === "/auth/v1/user") return route.fulfill({ json: controlledUser() });
    return route.fulfill({ json: {} });
  });
  return calls;
}

function implicitCallback(type: "invite" | "recovery") {
  const session = sessionPayload();
  return new URLSearchParams({
    access_token: session.access_token,
    expires_in: "3600",
    refresh_token: session.refresh_token,
    token_type: "bearer",
    type
  }).toString();
}

function sessionPayload() {
  return {
    access_token: controlledToken(),
    expires_in: 3600,
    refresh_token: "controlled-refresh-token",
    token_type: "bearer",
    user: controlledUser()
  };
}

function controlledToken() {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return [
    encode({ alg: "HS256", typ: "JWT" }),
    encode({
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: "90000000-0000-4000-8000-000000001008"
    }),
    "controlled-signature"
  ].join(".");
}

function controlledUser() {
  return {
    email: "operator@example.test",
    id: "90000000-0000-4000-8000-000000001008"
  };
}

async function hasStoredToken(page: Page) {
  return page.evaluate(() =>
    Boolean(sessionStorage.getItem("uzmax.admin.runtime.accessToken"))
  );
}

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(runtimeUrl);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("M10-08 controlled Vite server did not start");
}
