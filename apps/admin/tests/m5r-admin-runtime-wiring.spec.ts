import { expect, test, type Page } from "@playwright/test";

const memberId = "00000000-0000-4000-8000-000000000507";
const evalGateId = "11111111-1111-4111-8111-111111111507";
const configVersionId = "22222222-2222-4222-8222-222222222507";
const requests: string[] = [];
const capabilityBodies: unknown[] = [];

test.beforeEach(async ({ page }) => {
  requests.length = 0;
  capabilityBodies.length = 0;
  await page.addInitScript((id) => {
    (
      window as Window & { __UZMAX_M5R_ADMIN_RUNTIME__?: unknown }
    ).__UZMAX_M5R_ADMIN_RUNTIME__ = {
      aiMemberId: id,
      enabled: true
    };
  }, memberId);
  await routeRuntimeApis(page);
});

test("wires M5 admin shells to runtime API clients", async ({ page }) => {
  await page.goto("/design");

  await expect(page.getByTestId("m5-runtime-result")).toContainText(
    "API loaded 1 confirmation items"
  );
  await page.getByRole("button", { name: "Details" }).first().click();
  await expect(page.getByTestId("m5-runtime-result")).toContainText(
    "API detail loaded m5r-07-item"
  );
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByTestId("m5-runtime-result")).toContainText(
    "API decision approved"
  );

  await expect(page.getByTestId("m5-ai-runtime-result")).toContainText(
    "Runtime state breaker_offline"
  );
  await page.getByTestId("m5-ai-capability-quote").click();
  await expect(page.getByTestId("m5-ai-runtime-result")).toContainText(
    "toggle capability API quote"
  );
  expect(capabilityBodies).toContainEqual(
    expect.objectContaining({
      configVersionId,
      enabled: true,
      evalGateId
    })
  );

  await expect(page.getByTestId("m5-logs-runtime-result")).toContainText(
    "Runtime logs and board loaded through API"
  );
  await page
    .getByTestId("m5-dimension-export-controls")
    .getByRole("button", { name: "Draft export review" })
    .click();
  await expect(page.getByTestId("m5-logs-runtime-result")).toContainText(
    "Export job API"
  );

  await page
    .getByTestId("m5-template-tabs")
    .locator('[data-template-kind="config"]')
    .click();
  await page
    .getByTestId("m5-template-copy")
    .getByRole("button", { name: "Draft tenant copy" })
    .click();
  await expect(page.getByTestId("m5-template-runtime-result")).toContainText(
    "Template copy API"
  );

  expect(requests).toEqual(
    expect.arrayContaining([
      "/confirmation-queue/items?status=pending",
      "/confirmation-queue/items/m5r-07-item",
      "/confirmation-queue/items/m5r-07-item/decisions",
      `/ai-members/${memberId}/runtime-control`,
      `/ai-members/${memberId}/runtime-control/capabilities/quote`,
      "/logs-analytics/board",
      "/logs-analytics/login-logs?limit=20",
      "/logs-analytics/presence-logs?limit=20",
      "/logs-analytics/operation-logs?limit=20",
      "/logs-analytics/export-jobs",
      "/template-copy/copies"
    ])
  );
});

test("routes 320px confirmation and AI emergency controls through API", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 980 });
  await page.goto("/design");

  await page.getByRole("button", { name: "Approve" }).first().click();
  await page.getByRole("button", { name: "Discard" }).first().click();
  await page
    .getByTestId("m5-ai-mobile-fallback")
    .getByRole("button", { name: "Emergency stop fallback" })
    .click();
  await page
    .getByTestId("m5-ai-mobile-fallback")
    .getByRole("button", { name: "Recover API fallback" })
    .click();

  expect(
    requests.filter((path) =>
      path.startsWith("/confirmation-queue/items/m5r-07-item/decisions")
    )
  ).toHaveLength(2);
  expect(requests).toEqual(
    expect.arrayContaining([
      `/ai-members/${memberId}/runtime-control/emergency-stop`,
      `/ai-members/${memberId}/runtime-control/recover`
    ])
  );
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
});

test("blocks runtime capability enable when config evidence is missing", async ({
  page
}) => {
  await page.unroute("**/ai-members/**/runtime-control");
  await page.route("**/ai-members/**/runtime-control", async (route) => {
    requests.push(requestPath(route.request().url()));
    await route.fulfill({
      json: {
        activeVersion: { evalGateId },
        status: "breaker_offline"
      }
    });
  });

  await page.goto("/design");

  await expect(page.getByTestId("m5-ai-runtime-result")).toContainText(
    "Runtime state breaker_offline"
  );
  await page.getByTestId("m5-ai-capability-quote").click();
  await expect(page.getByTestId("m5-ai-runtime-result")).toContainText(
    "Capability enable requires passed eval and config evidence."
  );
  await expect(page.getByTestId("m5-ai-capability-quote")).toContainText("disabled");
  expect(capabilityBodies).toHaveLength(0);
  expect(
    requests.filter((path) => path.includes("/runtime-control/capabilities/"))
  ).toHaveLength(0);
});

test("keeps empty runtime queue empty without synthetic card fallback", async ({
  page
}) => {
  await page.unroute("**/confirmation-queue/items?status=pending");
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    requests.push(requestPath(route.request().url()));
    await route.fulfill({ json: { items: [] } });
  });

  await page.goto("/design");

  await expect(page.getByTestId("m5-runtime-result")).toContainText(
    "API loaded 0 confirmation items"
  );
  await expect(page.getByTestId("m5-runtime-empty")).toContainText(
    "Runtime queue empty."
  );
  await expect(page.getByTestId("m5-card-knowledge")).toHaveCount(0);

  await page.keyboard.press("a");
  await page.keyboard.press("d");
  expect(
    requests.filter((path) => path.includes("/confirmation-queue/items/"))
  ).toHaveLength(0);
});

async function routeRuntimeApis(page: Page) {
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    requests.push(requestPath(route.request().url()));
    await route.fulfill({ json: { items: [confirmationItem("pending")] } });
  });
  await page.route("**/confirmation-queue/items/m5r-07-item", async (route) => {
    requests.push(requestPath(route.request().url()));
    await route.fulfill({ json: { item: confirmationItem("pending") } });
  });
  await page.route(
    "**/confirmation-queue/items/m5r-07-item/decisions",
    async (route) => {
      requests.push(requestPath(route.request().url()));
      const body = JSON.parse(route.request().postData() ?? "{}") as {
        action?: string;
      };
      const status = body.action === "discard" ? "discarded" : "approved";
      await route.fulfill({
        json: {
          auditDraft: {
            action: body.action,
            auditRef: `controlled://m5r-07/confirmation/audit/${status}`,
            formalWrite: false,
            itemId: "m5r-07-item",
            reasonRef: `controlled://m5r-07/confirmation/${status}`,
            reviewedAt: "2026-06-25T00:00:00.000Z",
            reviewerUserId: "owner"
          },
          formalWrite: false,
          item: confirmationItem(status)
        }
      });
    }
  );
  await page.route("**/ai-members/**/runtime-control", async (route) => {
    requests.push(requestPath(route.request().url()));
    await route.fulfill({
      json: {
        activeVersion: { configVersionId, evalGateId },
        status: "breaker_offline"
      }
    });
  });
  await page.route("**/ai-members/**/runtime-control/**", async (route) => {
    const path = requestPath(route.request().url());
    requests.push(path);
    if (path.includes("/capabilities/")) {
      capabilityBodies.push(JSON.parse(route.request().postData() ?? "{}"));
    }
    const status = path.includes("recover") ? "online" : "disabled";
    await route.fulfill({
      json: {
        auditRef: "controlled://m5r-07/ai-member/audit",
        member: { status }
      }
    });
  });
  await page.route("**/logs-analytics/board", async (route) => {
    requests.push(requestPath(route.request().url()));
    await route.fulfill({
      json: {
        confirmationQueuePassRateBps: 8200,
        distillFrequency: "daily",
        distillPassRateBps: 6400,
        source: "runtime API"
      }
    });
  });
  for (const name of ["login", "presence", "operation"] as const) {
    await page.route(`**/logs-analytics/${name}-logs?limit=20`, async (route) => {
      requests.push(requestPath(route.request().url()));
      await route.fulfill({ json: [logRow(name)] });
    });
  }
  await page.route("**/logs-analytics/export-jobs", async (route) => {
    requests.push(requestPath(route.request().url()));
    await route.fulfill({
      json: {
        exportRef: "controlled://m5r-07/logs/export",
        fileRef: null,
        formalExportWrite: false,
        requiresOwnerConfirmation: true
      }
    });
  });
  await page.route("**/template-copy/copies", async (route) => {
    requests.push(requestPath(route.request().url()));
    await route.fulfill({
      json: {
        auditRef: "controlled://m5r-07/template-copy/audit",
        configVersionRef: "controlled://m5r-07/template-copy/config-version",
        copiedPayload: { formalTenantWrite: false, templateAutoOverwrite: false },
        tenantVersionRef: "controlled://m5r-07/template-copy/tenant-version"
      }
    });
  });
}

function confirmationItem(status: string) {
  return {
    candidatePayload: {
      candidateRef: "controlled://m5r-07/confirmation/candidate"
    },
    createdAt: "2026-06-25T00:00:00.000Z",
    id: "m5r-07-item",
    kind: "knowledge_candidate",
    orgId: "org-m5r-07",
    sourceRef: "controlled://m5r-07/confirmation/source",
    status,
    tenantId: "tenant-m5r-07"
  };
}

function logRow(kind: "login" | "operation" | "presence") {
  if (kind === "login") {
    return { device: "runtime", loginType: "password", memberUserId: "owner" };
  }
  if (kind === "presence") {
    return { durationSeconds: 60, memberUserId: "owner", status: "online" };
  }
  return {
    action: "controlled://m5r-07/logs/action",
    eventType: "confirmation.approved",
    module: "confirmation_queue"
  };
}

function requestPath(url: string) {
  const parsed = new URL(url);
  return `${parsed.pathname}${parsed.search}`;
}
