import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts",
  navigation: "/Users/atilla/源码/unpacked 6/shell/navigation.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx"
};
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const tenantNames = ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"];
const ownerColumns =
  "租户|成员|AI 成员|渠道连接|订单 connector|默认语言|状态|操作".split("|");
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic tenant metrics|no production tenant change|no tenant config persistence|no connector or feature flag change|no audit write".split(
    "|"
  );
const forbiddenVisibleTerms = [
  ...runtimeLabels,
  "Synthetic",
  "created in browser preview"
];
const oldCardPollution =
  "mock 运行中|mock 降级|mock 需人工|mock 已停用|mock 成员|mock AI|mock 连接|mock 已启用".split(
    "|"
  );

type RawTenantMetrics = {
  activePageId?: string | null;
  bodyScrollWidth: number;
  bodyText: string;
  boundaryText: string;
  createButtonWidth: number;
  documentScrollWidth: number;
  hasTenantId: boolean;
  headerHeight: number;
  headerWidth: number;
  managementActionWidth: number;
  modalHeight: number;
  modalWidth: number;
  navButtonLabels: string[];
  navWidth: number;
  panelHeight: number;
  panelWidth: number;
  shellLevel?: string | null;
  sidebarCategories: string[];
  sourceNoteHeight: number;
  tableHeight: number;
  tableScrollWidth: number;
  topbarHeight: number;
  viewportWidth: number;
  visibleText: string;
};

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures owner HTML table truth and React source-parity refresh", async ({
  page
}) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.decision.reactFollows).toBe("owner-html-visible-table-state");
  expect(mapping.conflict.unpackedCardGridConflictsWithOwnerHtml).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(ownerHtml).toString());
  await page.waitForLoadState("domcontentloaded");
  await clickFirstVisibleText(page, "集团");
  await clickFirstVisibleText(page, "租户管理");

  const ownerDefault = await collectOwnerSourceSample(page);
  expect(ownerDefault.contains.tenantManagement).toBe(true);
  expect(ownerDefault.contains.newTenant).toBe(true);
  expect(ownerDefault.contains.blankManagementAction).toBe(true);
  expect(ownerDefault.contains.disableNote).toBe(true);
  expect(ownerDefault.contains.tenantNames).toBe(false);
  expect(ownerDefault.contains.tableColumns).toBe(false);
  expect(ownerDefault.contains.capabilityRows).toBe(false);
  await saveShot(page, "owner-html-tenant-management-table.png", true);
  writeJson("owner-html-tenant-management-table-dom-sample.json", ownerDefault);

  await page.getByRole("button", { name: "新建租户" }).click();
  const ownerNew = await collectOwnerNewTenantSample(page);
  expect(Object.values(ownerNew.contains)).not.toContain(false);
  await saveShot(page, "owner-html-tenant-management-new-tenant-modal.png", true);
  writeJson("owner-html-tenant-management-new-tenant-modal-dom-sample.json", ownerNew);
  await page.getByRole("button", { name: "取消" }).click();
  await page.getByText("管理", { exact: true }).last().click();
  const ownerManage = await collectOwnerSourceSample(page);
  expect(ownerManage.contains.drawerFields).toBe(false);
  await saveShot(page, "owner-html-tenant-management-manage-click-noop.png", true);

  await page.goto("/design");
  await openTenants(page);
  await expect(page.getByTestId("m7-tenant-table-panel")).toBeVisible();
  await expect(page.getByTestId("m7-tenant-new-button")).toBeVisible();
  await expect(page.getByTestId("m7-tenant-source-note")).toContainText(
    "停用租户须填写原因"
  );
  await expect(page.locator(".uz-tenant-card")).toHaveCount(0);
  await expect(page.getByTestId("m7-tenant-drawer")).toHaveCount(0);
  const tenantPage = page.getByTestId("m7-tenant-page");
  for (const name of tenantNames)
    await expect(tenantPage.getByText(name)).toHaveCount(0);
  const desktopMetrics = await collectTenantMetrics(page);
  expect(desktopMetrics.shellLevel).toBe("group");
  expect(desktopMetrics.activePageId).toBe("group.tenants");
  expect(desktopMetrics.hasTenantId).toBe(false);
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  expect(desktopMetrics.sidebarCategories).toEqual(groupSections);
  expect(desktopMetrics.tenantButtonCount).toBe(0);
  expect(desktopMetrics.tenantCategoryCount).toBe(0);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeLabelsVisibleInBody).toBe(false);
  expect(desktopMetrics.sourceLikeDefaultVisible).toBe(true);
  expect(desktopMetrics.visiblePrimaryValuesClean).toBe(true);
  await saveShot(page, "react-tenant-management-desktop-table.png", true);

  await page.getByTestId("m7-tenant-manage-placeholder").click();
  await expectLocalToast(page, ["管理动作需等待租户明细接入"]);
  const manageMetrics = await collectTenantMetrics(page);
  expect(manageMetrics.sourceLikeManageNoopVisible).toBe(true);
  expect(manageMetrics.runtimeLabelsPresent).toBe(true);
  expect(manageMetrics.runtimeLabelsVisibleInBody).toBe(false);

  await page.getByTestId("m7-tenant-new-button").click();
  await expect(page.getByTestId("m7-tenant-new-modal")).toContainText("创建新租户");
  await expect(page.getByTestId("m7-tenant-new-create")).toBeDisabled();
  await page.getByTestId("m7-tenant-new-name").fill("胡杨跨境百货");
  await page.getByTestId("m7-tenant-new-line").fill("百货 · 中亚");
  await page.getByTestId("m7-tenant-new-cap-orderApi").click();
  await page.getByTestId("m7-tenant-new-template").selectOption("家居通用包");
  await expect(page.getByTestId("m7-tenant-new-create")).toBeEnabled();
  const newModalMetrics = await collectTenantMetrics(page);
  expect(newModalMetrics.sourceLikeNewModalVisible).toBe(true);
  await saveShot(page, "react-tenant-management-new-tenant-modal.png", true);
  await page.getByTestId("m7-tenant-new-create").click();
  await expect(page.getByText("5 个租户")).toBeVisible();
  await expectLocalToast(page, [
    "租户创建已加入预览队列",
    "胡杨跨境百货",
    "租户明细接入后可继续配置渠道与模板"
  ]);
  const createMetrics = await collectTenantMetrics(page);
  expect(createMetrics.sourceLikeLocalCreateVisible).toBe(true);
  expect(createMetrics.runtimeLabelsPresent).toBe(true);
  expect(createMetrics.runtimeLabelsVisibleInBody).toBe(false);

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsedMetrics = await collectTenantMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  expect(collapsedMetrics.tenantButtonCount).toBe(0);
  expect(collapsedMetrics.tenantCategoryCount).toBe(0);
  expect(collapsedMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await saveShot(page, "react-tenant-management-collapsed-sidebar.png", true);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/design");
  await openTenants(page);
  const mobileMetrics = await collectTenantMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.panelWidth).toBeLessThanOrEqual(296);
  expect(mobileMetrics.tableScrollWidth).toBeGreaterThanOrEqual(880);
  await page.getByTestId("m7-tenant-new-button").click();
  await expect(page.getByTestId("m7-tenant-new-modal")).toContainText("创建新租户");
  const mobileModalMetrics = await collectTenantMetrics(page);
  expect(mobileModalMetrics.modalWidth).toBeLessThanOrEqual(296);
  expect(mobileModalMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileModalMetrics.runtimeLabelsVisibleInBody).toBe(false);
  await saveShot(page, "react-tenant-management-mobile-320.png", true);

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    localCreate: createMetrics,
    manageNoop: manageMetrics,
    mobile: mobileMetrics,
    mobileModal: mobileModalMetrics,
    newModal: newModalMetrics,
    ownerDefault: ownerDefault.contains,
    ownerManageAfterClick: ownerManage.contains,
    ownerNewModal: ownerNew.contains,
    sourceMapping: mapping
  });
});

async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

async function openTenants(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "租户管理" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "group.tenants"
  );
  await expect(page.getByTestId("m7-tenant-page")).toBeVisible();
}

async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // The bundled owner HTML may already expose the target text without route click.
  }
}

async function expectLocalToast(page: Page, labels: readonly string[]) {
  const toast = page.getByTestId("m7-tenant-toast");
  await expect(toast).toHaveAttribute("role", "status");
  for (const label of labels) await expect(toast).toContainText(label);
}

async function collectOwnerSourceSample(page: Page) {
  return page.evaluate(
    ({ columns, names }) => {
      const text = document.body.innerText.replace(/\s+/g, " ").trim();
      const contains = (needle: string) => text.includes(needle);
      const exactTextElements = Array.from(document.querySelectorAll("*")).filter(
        (node) => (node.textContent ?? "").trim() === "管理"
      );
      return {
        bodyTextLength: text.length,
        contains: {
          blankManagementAction: exactTextElements.some((node) => {
            const rect = (node as HTMLElement).getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.x > window.innerWidth / 2;
          }),
          capabilityRows: ["Telegram Bot", "Telegram Business", "订单 API"].every(
            (label) => contains(label)
          ),
          disableNote: contains("停用租户须填写原因"),
          drawerFields: contains("默认语言") && contains("默认时区"),
          newTenant: contains("新建租户"),
          tableColumns: columns.every((label) => contains(label)),
          tenantManagement: contains("租户管理"),
          tenantNames: names.every((label) => contains(label))
        },
        sample: text.slice(0, 1200),
        title: document.title
      };
    },
    { columns: ownerColumns, names: tenantNames }
  );
}

async function collectOwnerNewTenantSample(page: Page) {
  return page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, " ").trim();
    const contains = (needle: string) => text.includes(needle);
    return {
      contains: {
        fields: [
          "创建新租户",
          "租户名称",
          "业务线",
          "默认语言",
          "默认时区",
          "渠道能力",
          "初始模板",
          "Telegram Bot",
          "Telegram Business",
          "订单 API",
          "复制所选模板的知识包",
          "取消",
          "创建租户"
        ].every((label) => contains(label))
      },
      sample: text.slice(0, 1600)
    };
  });
}

async function collectTenantMetrics(page: Page) {
  const raw = await page.evaluate<RawTenantMetrics>(() => {
    const one = (selector: string) => document.querySelector(selector);
    const attr = (selector: string, name: string) => one(selector)?.getAttribute(name);
    const box = (selector: string) => {
      const rect = (one(selector) as HTMLElement | null)?.getBoundingClientRect();
      return {
        height: Math.round(rect?.height ?? 0),
        width: Math.round(rect?.width ?? 0)
      };
    };
    const texts = (selector: string) =>
      Array.from(document.querySelectorAll(selector)).map((node) =>
        (node.textContent ?? "").trim()
      );
    const boundaryText = Array.from(
      document.querySelectorAll("[data-runtime-boundary]")
    )
      .map((node) => {
        const element = node as HTMLElement;
        return [
          element.getAttribute("data-runtime-boundary") ?? "",
          element.getAttribute("title") ?? "",
          element.getAttribute("aria-description") ?? "",
          element.textContent ?? ""
        ].join(" ");
      })
      .join(" ");
    const header = box(".uz-tenant-head");
    const panel = box(".uz-tenant-table-panel");
    const table = one(".uz-tenant-table") as HTMLElement | null;
    const modal = box('[data-testid="m7-tenant-new-modal"]');
    const note = box('[data-testid="m7-tenant-source-note"]');
    const topbar = box(".uz-topbar");
    return {
      activePageId: attr('[data-testid="admin-shell"]', "data-active-page-id"),
      bodyScrollWidth: document.body.scrollWidth,
      bodyText: document.body.innerText,
      boundaryText,
      createButtonWidth: box('[data-testid="m7-tenant-new-button"]').width,
      documentScrollWidth: document.documentElement.scrollWidth,
      hasTenantId: !!one('[data-testid="page-outlet"]')?.hasAttribute("data-tenant-id"),
      headerHeight: header.height,
      headerWidth: header.width,
      managementActionWidth: box('[data-testid="m7-tenant-manage-placeholder"]').width,
      modalHeight: modal.height,
      modalWidth: modal.width,
      navButtonLabels: texts('[data-testid="app-shell-nav"] button'),
      navWidth: box('[data-testid="app-shell-nav"]').width,
      panelHeight: panel.height,
      panelWidth: panel.width,
      shellLevel: attr('[data-testid="admin-shell"]', "data-shell-level"),
      sidebarCategories: texts('[data-testid="app-shell-nav"] .uz-nav-group p'),
      sourceNoteHeight: note.height,
      tableHeight: box(".uz-tenant-table").height,
      tableScrollWidth: table?.scrollWidth ?? 0,
      topbarHeight: topbar.height,
      viewportWidth: window.innerWidth,
      visibleText: document.body.innerText
    };
  });
  return buildTenantMetrics(raw);
}

function buildTenantMetrics(raw: RawTenantMetrics) {
  const bodyText = raw.bodyText;
  const visibleText = raw.visibleText;
  const navButtonLabels = raw.navButtonLabels;
  const boundaryText = raw.boundaryText;
  const sourceLike = {
    blankManagementAction:
      raw.managementActionWidth > 0 && visibleText.includes("管理"),
    newButton: raw.createButtonWidth > 0 && visibleText.includes("新建租户"),
    newModal:
      raw.modalWidth > 0 &&
      includesAll(visibleText, [
        "创建新租户",
        "租户名称",
        "业务线",
        "默认语言",
        "默认时区",
        "渠道能力",
        "初始模板"
      ]),
    sourceNote: raw.sourceNoteHeight > 0 && visibleText.includes("停用租户须填写原因"),
    subtitle: visibleText.includes("个租户"),
    tablePanel: raw.panelWidth > 0 && raw.panelHeight > 0 && raw.tableHeight > 0,
    title: visibleText.includes("租户管理")
  };
  return {
    ...raw,
    bodyText: undefined,
    navButtonLabels: undefined,
    pageVisible: raw.headerWidth > 0 && raw.headerHeight > 0,
    runtimeLabelsPresent: includesAll(boundaryText, runtimeLabels),
    runtimeLabelsVisibleInBody: runtimeLabels.some((label) =>
      visibleText.toLowerCase().includes(label.toLowerCase())
    ),
    sourceLike,
    sourceLikeDefaultVisible: Object.values({
      blankManagementAction: sourceLike.blankManagementAction,
      newButton: sourceLike.newButton,
      sourceNote: sourceLike.sourceNote,
      subtitle: sourceLike.subtitle,
      tablePanel: sourceLike.tablePanel,
      title: sourceLike.title
    }).every(Boolean),
    sourceLikeLocalCreateVisible: includesAll(bodyText, [
      "租户创建已加入预览队列",
      "租户明细接入后可继续配置渠道与模板"
    ]),
    sourceLikeManageNoopVisible: bodyText.includes("管理动作需等待租户明细接入"),
    sourceLikeNewModalVisible: sourceLike.newModal,
    tenantButtonCount: tenantLabels.filter((label) => navButtonLabels.includes(label))
      .length,
    tenantCategoryCount: tenantSections.filter((label) =>
      raw.sidebarCategories.includes(label)
    ).length,
    visiblePrimaryValuesClean:
      !oldCardPollution.some((label) => visibleText.includes(label)) &&
      forbiddenVisibleTerms.every(
        (label) => !visibleText.toLowerCase().includes(label.toLowerCase())
      ),
    visibleText: undefined
  };
}

function writeSourceMappingSummary() {
  const sources: Record<keyof typeof sourceFiles, string> = {
    fixtures: readFileSync(sourceFiles.fixtures, "utf8"),
    navigation: readFileSync(sourceFiles.navigation, "utf8"),
    page: readFileSync(sourceFiles.page, "utf8")
  };
  const owner = readFileSync(ownerHtml, "utf8");
  const page = sources.page;
  const fixtures = sources.fixtures;
  const ownerTableTemplate = includesAll(owner, [
    "tenantCols",
    "新建租户",
    "停用租户须填写原因",
    "tenantManageOpen",
    "tenantDisableOpen"
  ]);
  const unpackedCardGrid = includesAll(page, [
    "gridTemplateColumns",
    "repeat(auto-fill",
    "CAP_LABELS",
    "ConfirmModal"
  ]);
  const mapping = {
    conflict: {
      ownerHtmlRenderedCardGrid: false,
      ownerHtmlRenderedTenantRows: false,
      unpackedCardGridConflictsWithOwnerHtml: unpackedCardGrid
    },
    decision: {
      reactFollows: "owner-html-visible-table-state",
      unpacked6Role:
        "secondary conflicting structured source for this page; not the visible baseline"
    },
    filesRead: [ownerHtml, ...Object.values(sourceFiles)],
    ownerHtmlBundle: {
      disableModalTemplatePresent: owner.includes("tenantDisableOpen"),
      managementDrawerTemplatePresent: owner.includes("tenantManageOpen"),
      newTenantModalTemplatePresent: owner.includes("tenantNewOpen"),
      tableColumns: ownerColumns.filter((label) => owner.includes(label)),
      tableTemplatePresent: ownerTableTemplate
    },
    unpacked6: {
      cardGridSourcePresent: unpackedCardGrid,
      drawerSourcePresent: includesAll(page, ["managed", "默认语言", "默认时区"]),
      fixtureTerms: ["GROUP_TENANTS", "TENANT_STATUS_COLORS", "GroupTenant"].filter(
        (term) => fixtures.includes(term)
      ),
      tenantNames: tenantNames.filter((label) => `${page}\n${fixtures}`.includes(label))
    }
  };
  writeJson("unpacked-tenant-management-source-mapping.json", mapping);
  return mapping;
}

const includesAll = (text: string, labels: readonly string[]) =>
  labels.every((label) => text.includes(label));
