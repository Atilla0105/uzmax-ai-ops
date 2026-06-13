import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "apps/admin/tests",
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
