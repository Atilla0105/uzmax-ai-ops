import { expect, test, type Page, type Route } from "@playwright/test";

const requests: string[] = [];
const decisions: unknown[] = [];

test.beforeEach(async ({ page }) => {
  requests.length = 0;
  decisions.length = 0;
  await routeQueue(page);
});

test("renders tenant.queue as the M7 confirmation queue page", async ({ page }) => {
  await openQueue(page);

  await expect(page.getByTestId("page-outlet")).toHaveAttribute(
    "data-page-id",
    "tenant.queue"
  );
  await expect(page.getByTestId("m7-confirmation-queue-page")).toBeVisible();
  await expect(page.getByTestId("page-scaffold")).toHaveCount(0);
  await expect(page.getByTestId("m7-queue-stats")).toContainText("今日候选");
  await expect(page.getByTestId("m7-queue-degraded")).toContainText(
    "缺少已批准 API 合约"
  );
  await expect(page.getByTestId("m7-queue-card-m7-normal")).toContainText(
    "controlled://m7-ui-10/candidate/m7-normal"
  );
  await expect(page.getByTestId("m7-queue-diff-m7-conflict")).toContainText(
    /当前值引用[\s\S]*候选值引用/
  );
  await expect(page.getByRole("button", { name: "保留当前值" })).toBeDisabled();
  await expect(page.getByTestId("m7-confirmation-queue-page")).not.toContainText(
    /Dilnoza|Madina|塔什干|ORD-|PAY-|TG-|phone|address|payment|secret/i
  );
});

test("uses the existing API client paths for decisions and blocks conflict keyboard bypass", async ({
  page
}) => {
  await openQueue(page);
  await expect(page.getByTestId("m7-queue-card-m7-normal")).toBeVisible();

  await page.keyboard.press("j");
  await expect(page.getByTestId("m7-queue-card-m7-conflict")).toHaveAttribute(
    "aria-current",
    "true"
  );
  await page.keyboard.press("a");
  await page.keyboard.press("d");
  expect(decisions).toHaveLength(0);
  await page.getByRole("button", { name: "采纳候选值" }).click();
  expect(decisions).toContainEqual(expect.objectContaining({ action: "approve" }));

  await page.keyboard.press("k");
  await page.keyboard.press("d");
  expect(decisions).toContainEqual(expect.objectContaining({ action: "discard" }));

  await resetNormalRoute(page);
  await openQueue(page);
  await expect(page.getByTestId("m7-queue-card-m7-normal")).toBeVisible();
  await page.keyboard.press("e");
  await page.getByLabel("edited payload ref").fill("controlled://m7-ui-10/edit/ref");
  await page.keyboard.press("a");
  await page.keyboard.press("d");
  expect(decisions).not.toContainEqual(expect.objectContaining({ action: "edit" }));
  await page.getByLabel("edited payload ref").fill("controlled://m7-ui-10/edit/ref");
  await page.getByRole("button", { name: "保存并通过" }).click();
  expect(decisions).toContainEqual(
    expect.objectContaining({
      action: "edit",
      editedPayloadRef: "controlled://m7-ui-10/edit/ref"
    })
  );

  await resetNormalRoute(page);
  await openQueue(page);
  await page.getByRole("button", { name: "拦截" }).first().click();
  await page.getByLabel("拦截原因").fill("controlled reason note");
  await page.getByRole("button", { name: "确认拦截并写审计" }).click();
  expect(decisions).toContainEqual(expect.objectContaining({ action: "block" }));
  expect(requests).toEqual(
    expect.arrayContaining([
      "/confirmation-queue/items?status=pending",
      "/confirmation-queue/items/m7-normal/decisions"
    ])
  );
});

test("covers loading empty error and permission states without fixture fallback", async ({
  page
}) => {
  let release: (() => void) | undefined;
  await page.unroute("**/confirmation-queue/items?status=pending");
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    requests.push(pathOf(route));
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    await route.fulfill({ json: { items: [] } });
  });
  await openQueue(page);
  await expect(page.getByTestId("m7-queue-loading")).toBeVisible();
  release?.();
  await expect(page.getByTestId("m7-queue-empty")).toContainText("不会回退到 fixture");

  await routeList(page, 500, { error: "controlled://m7-ui-10/error" });
  await openQueue(page);
  await expect(page.getByTestId("m7-queue-error")).toContainText("status 500");

  await routeList(page, 403, { error: "controlled://m7-ui-10/permission" });
  await openQueue(page);
  await expect(page.getByTestId("m7-queue-permission")).toContainText(
    "confirmation:read"
  );
});

test("keeps mobile approval fallback reachable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openQueue(page);

  await expect(page.getByRole("button", { name: "通过 A" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "丢弃 D" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "桌面编辑" }).first()).toBeDisabled();
  await page.getByRole("button", { name: "通过 A" }).first().click();
  expect(decisions).toContainEqual(expect.objectContaining({ action: "approve" }));
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
});

async function openQueue(page: Page) {
  await page.goto("/design");
  await page.getByRole("button", { name: "确认队列" }).click();
}

async function routeQueue(page: Page) {
  await routeList(page, 200, { items: [item("m7-normal"), item("m7-conflict", true)] });
  await page.route("**/confirmation-queue/items/*/decisions", async (route) => {
    requests.push(pathOf(route));
    const body = JSON.parse(route.request().postData() ?? "{}") as {
      action?: string;
    };
    decisions.push(body);
    const status =
      body.action === "discard"
        ? "discarded"
        : body.action === "block"
          ? "blocked"
          : body.action === "edit"
            ? "edited"
            : "approved";
    await route.fulfill({
      json: {
        auditDraft: {
          action: body.action,
          auditRef: `controlled://m7-ui-10/audit/${status}`,
          formalWrite: false,
          itemId: "m7-normal",
          reasonRef: `controlled://m7-ui-10/reason/${status}`,
          reviewedAt: "2026-07-03T00:00:00.000Z",
          reviewerUserId: "synthetic-reviewer"
        },
        formalWrite: false,
        item: item(
          pathOf(route).includes("m7-conflict") ? "m7-conflict" : "m7-normal",
          pathOf(route).includes("m7-conflict"),
          status
        )
      }
    });
  });
}

async function resetNormalRoute(page: Page) {
  await page.unroute("**/confirmation-queue/items?status=pending");
  await routeList(page, 200, { items: [item("m7-normal")] });
}

async function routeList(page: Page, status: number, json: unknown) {
  await page.unroute("**/confirmation-queue/items?status=pending").catch(() => {});
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    requests.push(pathOf(route));
    await route.fulfill({ json, status });
  });
}

function item(id: string, conflict = false, status = "pending") {
  return {
    candidatePayload: { candidateRef: `controlled://m7-ui-10/candidate/${id}` },
    createdAt: "2026-07-03T00:00:00.000Z",
    diffPayload: conflict
      ? {
          current: { ref: "controlled://m7-ui-10/current/ref" },
          candidate: { ref: "controlled://m7-ui-10/candidate/ref" }
        }
      : undefined,
    id,
    kind: conflict ? "conflict_candidate" : "knowledge_candidate",
    orgId: "org-m7-ui-10",
    sourceRef: `controlled://m7-ui-10/source/${id}`,
    status,
    tenantId: "tenant-m7-ui-10"
  };
}

function pathOf(route: Route) {
  const url = new URL(route.request().url());
  return `${url.pathname}${url.search}`;
}
