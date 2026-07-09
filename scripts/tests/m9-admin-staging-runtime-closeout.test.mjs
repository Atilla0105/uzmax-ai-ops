import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const files = {
  accessPanel: read("apps/admin/src/AdminRuntimeAccessPanel.tsx"),
  adminAuth: read("apps/admin/src/adminRuntimeAuth.ts"),
  adminConfig: read("apps/admin/src/adminRuntimeConfig.ts"),
  adminPackage: read("apps/admin/package.json"),
  apiMain: read("apps/api/src/main.ts"),
  app: read("apps/admin/src/App.tsx"),
  conversationClient: read(
    "apps/admin/src/pages/conversations/conversationWorkbenchClient.ts"
  ),
  render: read("render.yaml"),
  shell: read("apps/admin/src/shell/AppShell.tsx"),
  shellCss: read("apps/admin/src/shell/AppShell.css"),
  spec: read("docs/specs/M9-01-admin-staging-runtime-closeout.md"),
  ticketPage: read("apps/admin/src/pages/tickets/TicketsPage.tsx"),
  knowledgePage: read("apps/admin/src/pages/knowledge/KnowledgePage.tsx")
};

test("M9 staging admin stays on Vercel and Render keeps only API CORS", () => {
  assert.doesNotMatch(files.render, /name: uzmax-admin-staging/);
  assert.doesNotMatch(files.render, /uzmax-admin-staging\.onrender\.com/);
  assert.match(
    files.adminPackage,
    /__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=.*uzmax-admin\.vercel\.app/
  );
  assert.doesNotMatch(files.adminPackage, /uzmax-admin-staging\.onrender\.com/);
  assert.match(
    files.render,
    /UZMAX_API_CORS_ORIGINS\s*\n\s*value: https:\/\/uzmax-admin\.vercel\.app,https:\/\/uzmax-admin-muxukk222-7795s-projects\.vercel\.app,https:\/\/uzmax-admin-atilla0105-muxukk222-7795s-projects\.vercel\.app,http:\/\/localhost:4173,http:\/\/127\.0\.0\.1:4173/
  );
});

test("API CORS is opt-in and allows the admin auth and scope headers", () => {
  assert.match(files.apiMain, /process\.env\.UZMAX_API_CORS_ORIGINS/);
  assert.match(files.apiMain, /app\.enableCors/);
  for (const header of ["authorization", "content-type", "x-org-id", "x-tenant-id"]) {
    assert.match(files.apiMain, new RegExp(`"${header}"`));
  }
  assert.match(files.apiMain, /methods: \["GET", "POST", "OPTIONS"\]/);
  assert.match(files.apiMain, /credentials: false/);
});

test("admin runtime fetcher targets staging API and adds authz scope headers", () => {
  assert.match(files.adminConfig, /VITE_UZMAX_API_BASE_URL/);
  assert.match(files.adminConfig, /VITE_UZMAX_ORG_ID/);
  assert.match(files.adminConfig, /VITE_UZMAX_TENANT_ID/);
  assert.match(files.adminConfig, /uzmax\.admin\.runtime\.accessToken/);
  assert.match(files.adminConfig, /headers\.set\("authorization", `Bearer/);
  assert.match(files.adminConfig, /headers\.set\("x-org-id", config\.orgId\)/);
  assert.match(files.adminConfig, /headers\.set\("x-tenant-id"/);
  assert.match(files.adminConfig, /admin runtime API path must be relative/);
  assert.match(
    files.adminConfig,
    /window\.fetch\(`\$\{config\.apiBaseUrl\}\$\{path\}`/
  );
  assert.doesNotMatch(files.adminConfig, /localStorage/);
});

test("admin access panel supports Supabase sign-in and manual token fallback", () => {
  assert.match(files.adminAuth, /signInWithPassword/);
  assert.match(files.adminAuth, /\/auth\/v1\/token\?grant_type=password/);
  assert.match(files.adminAuth, /apikey: config\.supabasePublishableKey/);
  assert.match(files.adminConfig, /window\.sessionStorage/);
  assert.match(files.adminAuth, /saveManualToken/);
  assert.doesNotMatch(files.adminPackage, /@supabase\/supabase-js/);
  assert.match(files.accessPanel, /admin-runtime-sign-in/);
  assert.match(files.accessPanel, /admin-runtime-save-token/);
  assert.match(files.accessPanel, /API session required/);
  assert.match(files.app, /readAdminRuntimeConfig/);
  assert.match(files.app, /useAdminRuntimeAccess/);
  assert.match(files.app, /AdminRuntimeAccessPanel/);
  assert.match(files.shell, /runtimeAccess\?: ReactNode/);
  assert.match(files.shellCss, /\.uz-runtime-access/);
});

test("conversation workbench uses runtime fetcher and fails closed on auth errors", () => {
  assert.match(files.conversationClient, /createAdminRuntimeFetcher/);
  assert.match(
    files.conversationClient,
    /const browserFetcher: ApiFetcher = createAdminRuntimeFetcher\(\)/
  );
  assert.match(files.conversationClient, /status \(401\|403\)/);
  assert.doesNotMatch(files.conversationClient, /window\.fetch\(input, init\)/);
});

test("ticket and knowledge surfaces remain explicitly degraded until real APIs close", () => {
  assert.match(
    files.spec,
    /Ticket\/knowledge pages remain visibly degraded\/read-only/
  );
  assert.match(files.ticketPage, /data-runtime-state="degraded"/);
  assert.match(files.knowledgePage, /data-runtime-state="degraded"/);
});
