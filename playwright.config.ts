import { defineConfig, devices } from "@playwright/test";

const localOwnerSourceEvidenceSpecs = [
  "**/*source-parity.spec.ts",
  "**/*default-visual-parity.spec.ts",
  "**/m7-ui-conversation-detail-parity.spec.ts",
  "**/m7-ui-tenant-entry-visible-proof.spec.ts"
];

export default defineConfig({
  testDir: "apps/admin/tests",
  testIgnore: process.env.CI ? localOwnerSourceEvidenceSpecs : [],
  webServer: {
    command:
      "npm run build:admin && npx vite preview apps/admin --host 127.0.0.1 --port 4173",
    reuseExistingServer: !process.env.CI,
    url: "http://127.0.0.1:4173"
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
