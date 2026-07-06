import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-73-tenant-management-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
export const ownerHtmlUrl = pathToFileURL(ownerHtml).toString();
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts",
  navigation: "/Users/atilla/源码/unpacked 6/shell/navigation.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx"
};
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
export const groupSections = ["总览", "平台", "治理"];
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
export const tenantNames = ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"];
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

export async function saveShot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ fullPage, path: `${artifactDir}/${name}` });
}

export function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

export async function openTenants(page: Page, query = "") {
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

export async function clickFirstVisibleText(page: Page, text: string) {
  const target = page.getByText(text, { exact: true }).first();
  try {
    await target.click({ timeout: 3000 });
  } catch {
    // The bundled owner HTML may already expose the target text without route click.
  }
}

export async function expectLocalToast(page: Page, labels: readonly string[]) {
  const toast = page.getByTestId("m7-tenant-toast");
  await expect(toast).toHaveAttribute("role", "status");
  for (const label of labels) await expect(toast).toContainText(label);
}

export async function collectOwnerSourceSample(page: Page) {
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

export async function collectOwnerNewTenantSample(page: Page) {
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

export async function collectTenantMetrics(page: Page) {
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

export function writeSourceMappingSummary() {
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

const includesAll = (text: string, labels: readonly string[]) =>
  labels.every((label) => text.includes(label));
