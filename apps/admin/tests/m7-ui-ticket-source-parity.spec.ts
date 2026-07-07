import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-64-ticket-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const unpackedTicketsPage =
  "/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx";
const unpackedTicketsHook = "/Users/atilla/源码/unpacked 6/hooks/useTickets.ts";
const unpackedTicketsFixture = "/Users/atilla/源码/unpacked 6/fixtures/tickets.ts";
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split("|");

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures tenant.tickets source parity evidence on latest shell stack", async ({
  page
}) => {
  writeSourceMappingSummary();

  await page.setViewportSize({ width: 1440, height: 900 });
  if (existsSync(ownerHtml)) {
    await page.goto(pathToFileURL(ownerHtml).toString());
    await page.waitForLoadState("domcontentloaded");
    await clickFirstVisibleText(page, "工单");
    const ownerSource = await collectOwnerSourceSample(page);
    expect(ownerSource.bodyTextLength).toBeGreaterThan(100);
    expect(ownerSource.contains.tickets).toBe(true);
    await page.screenshot({
      fullPage: false,
      path: `${artifactDir}/owner-html-ticket-source-sample.png`
    });
    writeFileSync(
      `${artifactDir}/owner-html-ticket-source-dom-sample.json`,
      `${JSON.stringify(ownerSource, null, 2)}\n`
    );
  } else {
    writeUnavailableArtifact("owner-html-ticket-source");
  }

  await page.goto("/design");
  await openTickets(page);

  const desktopMetrics = await collectTicketMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("tenant");
  expect(desktopMetrics.activePageId).toBe("tenant.tickets");
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.ticketListWidth).toBeGreaterThanOrEqual(380);
  expect(desktopMetrics.ticketListWidth).toBeLessThanOrEqual(381);
  expect(desktopMetrics.ticketDetailVisible).toBe(true);
  expect(desktopMetrics.ticketSideWidth).toBeGreaterThanOrEqual(247);
  expect(desktopMetrics.ticketSideWidth).toBeLessThanOrEqual(249);
  expect(desktopMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  expect(desktopMetrics.tenantCategories).toEqual(tenantSections);
  expect(desktopMetrics.groupCategoryCount).toBe(0);
  expect(desktopMetrics.groupButtonCount).toBe(0);
  expect(desktopMetrics.runtimeLabelVisible).toBe(true);
  expect(desktopMetrics.primaryTicketVisible).toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-ticket-desktop.png`
  });

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(page.getByTestId("admin-shell")).toHaveClass(/is-nav-collapsed/);
  const collapsedMetrics = await collectTicketMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.bodyScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.documentScrollWidth).toBeLessThanOrEqual(1440);
  expect(collapsedMetrics.tenantCategories).toEqual(tenantSections);
  expect(collapsedMetrics.groupCategoryCount).toBe(0);
  expect(collapsedMetrics.groupButtonCount).toBe(0);
  await page.screenshot({
    fullPage: false,
    path: `${artifactDir}/react-ticket-collapsed.png`
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openTickets(page);
  const mobileMetrics = await collectTicketMetrics(page);
  expect(mobileMetrics.shellLevel).toBe("tenant");
  expect(mobileMetrics.activePageId).toBe("tenant.tickets");
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.ticketListVisible).toBe(true);
  expect(mobileMetrics.ticketDetailVisible).toBe(true);
  expect(mobileMetrics.mobileReadable).toBe(true);
  expect(mobileMetrics.tenantCategories).toEqual(tenantSections);
  expect(mobileMetrics.groupCategoryCount).toBe(0);
  expect(mobileMetrics.groupButtonCount).toBe(0);
  await page.screenshot({
    fullPage: true,
    path: `${artifactDir}/react-ticket-mobile-320.png`
  });

  writeFileSync(
    `${artifactDir}/metrics.json`,
    `${JSON.stringify(
      { collapsed: collapsedMetrics, desktop: desktopMetrics, mobile: mobileMetrics },
      null,
      2
    )}\n`
  );
});

async function openTickets(page: Page) {
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { name: "工单", exact: true })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.tickets"
  );
  await expect(page.getByTestId("m7-ticket-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // The bundled owner HTML may already expose the ticket text without needing
    // a route click; the DOM sample below records which source terms rendered.
  }
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    const contains = (needle: string) => text.includes(needle);
    return {
      bodyTextLength: text.length,
      contains: {
        closeTicket: contains("关闭工单"),
        customer: contains("客户"),
        sla: contains("即将超SLA"),
        tickets: contains("工单")
      },
      sample: text.replace(/\s+/g, " ").trim().slice(0, 900),
      title: document.title
    };
  });
}

async function collectTicketMetrics(page: Page) {
  const raw = await page.evaluate(() => {
    const roundRect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return { height: 0, width: 0, x: 0, y: 0 };
      const rect = element.getBoundingClientRect();
      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    };
    const nav = document.querySelector('[data-testid="app-shell-nav"]');
    const bodyText = document.body.innerText;
    const tenantCategories = Array.from(
      nav?.querySelectorAll(".uz-nav-group p") ?? []
    ).map((node) => (node.textContent ?? "").trim());
    const list = roundRect('[data-testid="m7-ticket-list"]');
    const detail = roundRect('[data-testid="m7-ticket-detail"]');
    const side = roundRect('[data-testid="m7-ticket-side-column"]');
    const topbar = roundRect(".uz-topbar");
    const shell = roundRect('[data-testid="admin-shell"]');
    return {
      activePageId: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-active-page-id"),
      bodyText,
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      navText: nav?.textContent ?? "",
      navWidth: roundRect('[data-testid="app-shell-nav"]').width,
      shellLevel: document
        .querySelector('[data-testid="admin-shell"]')
        ?.getAttribute("data-shell-level"),
      shellWidth: shell.width,
      tenantCategories,
      ticketDetailHeight: detail.height,
      ticketDetailVisible: detail.width > 0 && detail.height > 0,
      ticketListHeight: list.height,
      ticketListVisible: list.width > 0 && list.height > 0,
      ticketListWidth: list.width,
      ticketSideHeight: side.height,
      ticketSideWidth: side.width,
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth
    };
  });
  const bodyText = raw.bodyText;
  const navText = raw.navText;
  return {
    ...raw,
    bodyText: undefined,
    groupButtonCount: groupLabels.filter((label) => navText.includes(label)).length,
    groupCategoryCount: groupSections.filter((label) =>
      raw.tenantCategories.includes(label)
    ).length,
    mobileReadable:
      raw.ticketListVisible &&
      raw.ticketDetailVisible &&
      bodyText.includes("T-1042") &&
      bodyText.includes("关闭工单"),
    navText: undefined,
    primaryTicketVisible: bodyText.includes("T-1042") && bodyText.includes("UZ-20413"),
    runtimeLabelVisible:
      bodyText.includes("degraded") &&
      bodyText.includes("mock") &&
      bodyText.includes("not production ticket data")
  };
}

function writeSourceMappingSummary() {
  const paths = [unpackedTicketsPage, unpackedTicketsHook, unpackedTicketsFixture];
  const missing = paths.filter((path) => !existsSync(path));
  if (missing.length > 0) {
    writeFileSync(
      `${artifactDir}/unpacked-ticket-source-mapping-unavailable.json`,
      `${JSON.stringify({ missing, status: "local-source-unavailable" }, null, 2)}\n`
    );
    return;
  }
  const ticketsPage = readFileSync(unpackedTicketsPage, "utf8");
  const hook = readFileSync(unpackedTicketsHook, "utf8");
  const fixtures = readFileSync(unpackedTicketsFixture, "utf8");
  writeFileSync(
    `${artifactDir}/unpacked-ticket-source-mapping.json`,
    `${JSON.stringify(
      {
        fixtures: {
          closeOptions: fixtures.includes("TICKET_CLOSE_OPTIONS"),
          lineCount: fixtures.split("\n").length,
          records: ["T-1042", "T-1039", "T-1051", "T-1033", "T-1028", "T-1019"].filter(
            (id) => fixtures.includes(id)
          )
        },
        hook: {
          closeRequiresNote: hook.includes("!closeDraft.note.trim()"),
          lineCount: hook.split("\n").length,
          localActions: ["claim", "reassign", "addNote", "confirmClose"].filter(
            (name) => hook.includes(name)
          )
        },
        ticketsPage: {
          detailSideColumn: ticketsPage.includes("width: 248"),
          lineCount: ticketsPage.split("\n").length,
          listColumn: ticketsPage.includes("width: 380"),
          sections: [
            "摘要",
            "AI 建议处理",
            "会话片段",
            "报价记录",
            "事件时间线",
            "备注",
            "关闭工单"
          ].filter((label) => ticketsPage.includes(label))
        }
      },
      null,
      2
    )}\n`
  );
}

function writeUnavailableArtifact(name: string) {
  writeFileSync(
    `${artifactDir}/${name}-unavailable.json`,
    `${JSON.stringify(
      {
        path: ownerHtml,
        status: "local-source-unavailable",
        reason: "Owner prototype files are local-only and absent in CI."
      },
      null,
      2
    )}\n`
  );
}
