import { expect, test, type Page } from "@playwright/test";

const navWidth = async (page: Page) =>
  Math.round(
    await page
      .getByTestId("app-shell-nav")
      .evaluate((node) => node.getBoundingClientRect().width)
  );

const navIconCount = async (page: Page) =>
  page.getByTestId("app-shell-nav").locator(".uz-nav-item svg").count();

const expectNavIconTreatment = async (page: Page, expectedCount: number) => {
  const metrics = await page
    .getByTestId("app-shell-nav")
    .locator(".uz-nav-item")
    .evaluateAll((items) =>
      items.map((item) => {
        const slot = item.querySelector("[data-icon-slot]") as HTMLElement;
        const svg = slot.querySelector("svg") as SVGSVGElement;
        const itemRect = item.getBoundingClientRect();
        const slotRect = slot.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();

        return {
          iconSlotText: (slot.textContent ?? "").trim(),
          itemHeight: Math.round(itemRect.height),
          slotHeight: slotRect.height,
          slotWidth: slotRect.width,
          strokeWidth: svg.getAttribute("stroke-width") ?? "",
          svgCount: item.querySelectorAll("svg").length,
          svgHeight: svgRect.height,
          svgWidth: svgRect.width,
          viewBox: svg.getAttribute("viewBox") ?? ""
        };
      })
    );

  expect(metrics).toHaveLength(expectedCount);
  for (const metric of metrics) {
    expect(metric).toMatchObject({
      iconSlotText: "",
      itemHeight: 36,
      strokeWidth: "1.75",
      svgCount: 1,
      viewBox: "0 0 24 24"
    });
    expect(metric.slotWidth).toBeGreaterThanOrEqual(18);
    expect(metric.slotWidth).toBeLessThanOrEqual(20);
    expect(metric.slotHeight).toBeGreaterThanOrEqual(18);
    expect(metric.slotHeight).toBeLessThanOrEqual(20);
    expect(metric.svgWidth).toBeGreaterThanOrEqual(18);
    expect(metric.svgWidth).toBeLessThanOrEqual(20);
    expect(metric.svgHeight).toBeGreaterThanOrEqual(18);
    expect(metric.svgHeight).toBeLessThanOrEqual(20);
  }
};

const expectActiveNavRowTreatment = async (page: Page, label: string) => {
  const metrics = await page.getByRole("button", { name: label }).evaluate((item) => {
    const style = getComputedStyle(item);
    const rect = item.getBoundingClientRect();

    return {
      borderRadius: style.borderRadius,
      columnGap: style.columnGap,
      fontWeight: style.fontWeight,
      height: Math.round(rect.height),
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight
    };
  });

  expect(metrics).toMatchObject({
    borderRadius: "7px",
    columnGap: "11px",
    fontWeight: "600",
    height: 36,
    paddingLeft: "10px",
    paddingRight: "10px"
  });
};

const expectCollapseControlBottomPlaced = async (page: Page) => {
  const metrics = await page.getByTestId("app-shell-nav").evaluate((nav) => {
    const control = nav.querySelector(".uz-nav-collapse") as HTMLElement;
    const controlRect = control.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    return {
      bottomDelta: Math.round(navRect.bottom - controlRect.bottom),
      controlHeight: Math.round(controlRect.height)
    };
  });

  expect(metrics).toMatchObject({
    bottomDelta: 0,
    controlHeight: 40
  });
};

const expectCollapsedNavTextHidden = async (page: Page) => {
  await expect
    .poll(() =>
      page
        .getByTestId("app-shell-nav")
        .locator(".uz-nav-item")
        .evaluateAll((items) =>
          items.every((item) => (item.textContent ?? "").trim() === "")
        )
    )
    .toBe(true);
  await expect
    .poll(() =>
      page
        .getByTestId("app-shell-nav")
        .locator(".uz-nav-group p")
        .evaluateAll((labels) =>
          labels.every((label) => getComputedStyle(label).opacity === "0")
        )
    )
    .toBe(true);
};

test("renders the group-layer M7 foundation AppShell frame", async ({ page }) => {
  await page.goto("/design");

  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("app-shell-nav")).toBeVisible();
  await expect(page.getByTestId("tenant-switcher")).toBeVisible();
  await expect(page.getByLabel("Search")).toBeVisible();
  await expect(page.getByLabel("Search")).toHaveAttribute(
    "placeholder",
    "搜索会话、客户、订单、工单、知识..."
  );
  await expect(page.getByText("Search shell")).toHaveCount(0);
  await expect(page.locator(".uz-topbar .uz-input svg")).toBeVisible();
  await expect(page.getByTestId("environment-marker")).toContainText("PRODUCTION");
  await expect(page.getByTestId("system-heartbeat")).toContainText("68ms");
  await expect(page.getByRole("button", { name: "Notifications" })).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Notifications" }).locator("svg")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "User menu" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "User menu" })).toContainText("韩雪");
  await expect(page.getByRole("button", { name: "User menu" })).toContainText(
    "运营负责人"
  );

  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.overview"
  );
  await expect(page.getByRole("button", { name: "集团总览" })).toBeVisible();
  await expect(page.getByRole("button", { name: "发布与验收" })).toBeVisible();
  await expect(page.getByRole("button", { name: "确认队列" })).toHaveCount(0);
  await expect
    .poll(() =>
      page.getByTestId("app-shell-nav").locator(".uz-nav-group p").allTextContents()
    )
    .toEqual(["总览", "平台", "治理"]);
  await expect(page.getByText("GROUP", { exact: true })).toHaveCount(0);

  await expect(page.getByRole("button", { name: "Collapse navigation" })).toContainText(
    "收起导航"
  );
  await expect(
    page.getByRole("button", { name: "Collapse navigation" }).locator("svg")
  ).toBeVisible();
  await expect.poll(async () => navIconCount(page)).toBe(7);
  await expectNavIconTreatment(page, 7);
  await expectActiveNavRowTreatment(page, "集团总览");
  await expectCollapseControlBottomPlaced(page);
  await expect
    .poll(async () =>
      page
        .getByTestId("app-shell-nav")
        .locator(".uz-nav-item [data-icon-slot]")
        .evaluateAll((nodes) =>
          nodes.every((node) => (node.textContent ?? "").trim() === "")
        )
    )
    .toBe(true);
  await expect.poll(async () => navWidth(page)).toBe(232);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect.poll(async () => navWidth(page)).toBe(68);
  await expect.poll(async () => navIconCount(page)).toBe(7);
  await expectNavIconTreatment(page, 7);
  await expectCollapseControlBottomPlaced(page);
  await expectCollapsedNavTextHidden(page);
  await expect(page.getByText("收起导航", { exact: true })).toHaveCount(0);
  expect(
    await page.getByTestId("app-shell-nav").evaluate((nav) => {
      const navRect = nav.getBoundingClientRect();
      return Array.from(nav.querySelectorAll(".uz-nav-item svg")).every((icon) => {
        const rect = icon.getBoundingClientRect();
        return (
          rect.width > 0 && rect.left >= navRect.left && rect.right <= navRect.right
        );
      });
    })
  ).toBe(true);
  await page.getByRole("button", { name: "Expand navigation" }).click();

  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.conversations"
  );
  await expect.poll(async () => navIconCount(page)).toBe(12);
  await expectNavIconTreatment(page, 12);
  await expectActiveNavRowTreatment(page, "对话");
  await expectCollapseControlBottomPlaced(page);
  await expect(page.getByTestId("route-breadcrumb")).toContainText("丝路数码");
  await expect(page.getByText("Tenant B - Connector degraded")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "确认队列" })).toBeVisible();
  await expect(page.getByRole("button", { name: "集团总览" })).toHaveCount(0);
  await expect
    .poll(() =>
      page.getByTestId("app-shell-nav").locator(".uz-nav-group p").allTextContents()
    )
    .toEqual(["运营", "数据", "智能", "管理", "洞察"]);
  await expect(page.getByText("TENANT", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("environment-marker")).toContainText("PRODUCTION");
  await expect(page.getByTestId("m7-conversation-workbench-page")).toBeVisible();
  await expect(page.getByTestId("page-scaffold")).toHaveCount(0);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect.poll(async () => navWidth(page)).toBe(68);
  await expect.poll(async () => navIconCount(page)).toBe(12);
  await expectNavIconTreatment(page, 12);
  await expectCollapseControlBottomPlaced(page);
  await expectCollapsedNavTextHidden(page);
  await expect(page.getByRole("button", { name: "Expand navigation" })).toBeVisible();
});

test("keeps the M7 foundation shell within the 320px fallback width", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");

  await expect(page.getByTestId("admin-shell")).toBeVisible();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "group"
  );

  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});
