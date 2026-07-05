import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const artifactDir = "/tmp/uzmax-m7-ui-75-team-source-parity-refresh";
const ownerHtml = "/Users/atilla/Downloads/运营塔台1.0.html";
const sourceFiles = {
  fixtures: "/Users/atilla/源码/unpacked 6/fixtures/team.ts",
  page: "/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx"
};
const tenantLabels =
  "对话|工单|确认队列|客户资产|订单|知识与资源|评测中心|AI 成员|团队|配置|分析|日志".split(
    "|"
  );
const groupLabels =
  "集团总览|模型/成本/风险|模板中心|连接中心|发布与验收|租户管理|集团日志".split(
    "|"
  );
const tenantSections = ["运营", "数据", "智能", "管理", "洞察"];
const groupSections = ["总览", "平台", "治理"];
const memberColumns =
  "成员|角色|成员类型|分组|在线状态|接待中|今日累计|最近登录".split("|");
const roleColumns = "角色|类型|说明|成员数|创建时间|操作".split("|");
const inviteFields = "昵称|邮箱|成员类型|角色|分组".split("|");
const drawerFields =
  "角色|分组|接待上限|语言偏好|通知偏好|Telegram 绑定".split("|");
const runtimeLabels =
  "degraded|mock|read-only|browser-local only|no production authz write|no team mutation|no invite email send|no Telegram binding change|no audit write".split(
    "|"
  );

mkdirSync(artifactDir, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.route("**/conversation-ticket/conversations", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/confirmation-queue/items?status=pending", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
});

test("captures owner source and React tenant team parity refresh", async ({ page }) => {
  const mapping = writeSourceMappingSummary();
  expect(mapping.unpacked.memberColumns).toEqual(memberColumns);
  expect(mapping.unpacked.roleColumns).toEqual(roleColumns);

  const ownerDefault = await captureOwnerTeam(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await openTeam(page);
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-shell-level",
    "tenant"
  );
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.team"
  );
  await expect(page.getByRole("heading", { name: "团队" })).toBeVisible();
  await expect(page.getByTestId("m7-team-page")).not.toContainText("tenant:");
  await expect(page.getByTestId("m7-team-tab-members")).toContainText("成员");
  await expect(page.getByTestId("m7-team-tab-roles")).toContainText("角色管理");
  await expect(page.getByTestId("m7-team-primary")).toContainText("邀请成员");
  await expect(page.getByTestId("m7-team-search")).toHaveAttribute(
    "placeholder",
    "搜索姓名 / 邮箱 / 分组…"
  );
  for (const label of runtimeLabels) {
    await expect(page.getByTestId("m7-team-runtime-note")).toContainText(label);
  }
  await expect(page.locator(".uz-team-table th")).toHaveText(memberColumns);
  await expectLayerNav(page);
  const desktopMetrics = await collectTeamMetrics(page);
  expect(desktopMetrics.sourceLikeMembersVisible).toBe(true);
  expect(desktopMetrics.runtimeLabelsPresent).toBe(true);
  expect(desktopMetrics.runtimeNoteVisible).toBe(false);
  expect(desktopMetrics.navWidth).toBe(232);
  expect(desktopMetrics.topbarHeight).toBeGreaterThanOrEqual(52);
  expect(desktopMetrics.topbarHeight).toBeLessThanOrEqual(53);
  await saveShot(page, "react-team-desktop-members.png");

  await page.getByTestId("m7-team-tab-roles").click();
  await expect(page.locator(".uz-team-table th")).toHaveText(roleColumns);
  await expect(page.getByTestId("m7-team-primary")).toContainText("新建角色");
  const rolesMetrics = await collectTeamMetrics(page);
  expect(rolesMetrics.sourceLikeRolesVisible).toBe(true);
  await saveShot(page, "react-team-roles-tab.png");

  await page.getByTestId("m7-team-primary").click();
  await expect(page.getByTestId("m7-team-role-editor")).toBeVisible();
  await expect(page.getByTestId("m7-team-role-editor")).toContainText("新建角色");
  await expect(page.getByTestId("m7-team-role-editor")).toContainText("角色名称");
  await expect(page.getByTestId("m7-team-role-editor")).toContainText("说明");
  await expect(page.getByTestId("m7-team-role-editor")).toContainText("权限");
  const roleEditorMetrics = await collectTeamMetrics(page);
  expect(roleEditorMetrics.roleEditorOpen).toBe(true);
  expect(roleEditorMetrics.roleEditorWidth).toBeGreaterThanOrEqual(590);
  expect(roleEditorMetrics.roleEditorWidth).toBeLessThanOrEqual(600);
  await saveShot(page, "react-team-role-editor.png");
  await page.getByRole("button", { name: "取消" }).click();

  await page.getByTestId("m7-team-tab-members").click();
  await page.getByTestId("m7-team-primary").click();
  const invite = page.getByTestId("m7-team-invite-modal");
  await expect(invite).toBeVisible();
  for (const field of inviteFields) await expect(invite).toContainText(field);
  await expect(invite).toContainText("发送邀请");
  const inviteMetrics = await collectTeamMetrics(page);
  expect(inviteMetrics.inviteModalOpen).toBe(true);
  expect(inviteMetrics.inviteModalWidth).toBeGreaterThanOrEqual(450);
  expect(inviteMetrics.inviteModalWidth).toBeLessThanOrEqual(460);
  await saveShot(page, "react-team-invite-modal.png");
  await page.getByRole("button", { name: "取消" }).click();

  await page.locator(".uz-team-row").first().click();
  const drawer = page.getByTestId("m7-team-member-drawer");
  await expect(drawer).toBeVisible();
  for (const field of drawerFields) await expect(drawer).toContainText(field);
  await expect(drawer.getByTestId("m7-team-member-toggle-disable")).toContainText(
    "停用账号"
  );
  const drawerMetrics = await collectTeamMetrics(page);
  expect(drawerMetrics.memberDrawerOpen).toBe(true);
  expect(drawerMetrics.drawerWidth).toBe(400);
  await saveShot(page, "react-team-member-drawer.png");
  await page.getByRole("button", { name: "关闭成员详情" }).click();

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  const collapsedMetrics = await collectTeamMetrics(page);
  expect(collapsedMetrics.navWidth).toBe(68);
  await saveShot(page, "react-team-collapsed-nav.png");

  await page.setViewportSize({ width: 320, height: 900 });
  await openTeam(page);
  await expect(page.locator(".uz-team-card-list")).toBeVisible();
  const mobileMetrics = await collectTeamMetrics(page);
  expect(mobileMetrics.bodyScrollWidth).toBeLessThanOrEqual(320);
  expect(mobileMetrics.documentScrollWidth).toBeLessThanOrEqual(320);
  await saveShot(page, "react-team-mobile-320.png");

  writeJson("metrics.json", {
    collapsed: collapsedMetrics,
    desktop: desktopMetrics,
    drawer: drawerMetrics,
    invite: inviteMetrics,
    mobile: mobileMetrics,
    ownerDefault,
    roleEditor: roleEditorMetrics,
    roles: rolesMetrics,
    sourceMapping: mapping
  });
});

async function captureOwnerTeam(page: Page) {
  const empty = {
    captureError: "",
    ok: false
  };
  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pathToFileURL(ownerHtml).toString());
    await page.waitForLoadState("domcontentloaded");
    await page.getByText("团队", { exact: true }).first().click({ timeout: 3000 });
    await page.waitForTimeout(500);
    await saveShot(page, "owner-html-team-desktop.png");
    const sample = await collectOwnerTeamSample(page);
    writeJson("owner-html-team-rendered-sample.json", sample);
    return sample;
  } catch (error) {
    const failed = { ...empty, captureError: String(error) };
    writeJson("owner-html-team-rendered-sample.json", failed);
    return failed;
  }
}

async function openTeam(page: Page, query = "") {
  await page.goto(`/design${query}`);
  await page.getByTestId("tenant-switcher").selectOption("tenant-b");
  await page
    .getByTestId("app-shell-nav")
    .getByRole("button", { exact: true, name: "团队" })
    .click();
  await expect(page.getByTestId("admin-shell")).toHaveAttribute(
    "data-active-page-id",
    "tenant.team"
  );
}

async function expectLayerNav(page: Page) {
  const nav = page.getByTestId("app-shell-nav");
  await expect
    .poll(() => nav.locator(".uz-nav-group p").allTextContents())
    .toEqual(tenantSections);
  for (const label of tenantLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toBeVisible();
  }
  for (const label of groupLabels) {
    await expect(nav.getByRole("button", { exact: true, name: label })).toHaveCount(0);
  }
  for (const label of groupSections) {
    await expect(nav.locator(".uz-nav-group p").filter({ hasText: label })).toHaveCount(
      0
    );
  }
}

async function collectOwnerTeamSample(page: Page) {
  const data = await page.evaluate(
    ({ cols, roles }) => {
      const text = document.body.innerText.replace(/\s+/g, " ").trim();
      const inputs = Array.from(document.querySelectorAll("input"));
      const headerTexts = Array.from(document.querySelectorAll("th")).map((node) =>
        (node.textContent ?? "").trim()
      );
      const cellTexts = Array.from(document.querySelectorAll("td")).map((node) =>
        (node.textContent ?? "").trim()
      );
      return {
        buttonTexts: Array.from(document.querySelectorAll("button")).map((node) =>
          (node.textContent ?? "").trim()
        ),
        cellTexts,
        contains: {
          blankRenderedTable:
            headerTexts.length > 0 &&
            cellTexts.length > 0 &&
            headerTexts.every((item) => item === "") &&
            cellTexts.every((item) => item === ""),
          inviteButton: text.includes("邀请成员"),
          memberColumns: cols.every((label: string) => text.includes(label)),
          roleColumns: roles.every((label: string) => text.includes(label)),
          tabs: text.includes("成员") && text.includes("角色管理"),
          title: text.includes("团队")
        },
        headerTexts,
        ok: true,
        sample: text.slice(0, 1400),
        searchPlaceholder:
          inputs.find((input) =>
            (input.getAttribute("placeholder") ?? "").includes("搜索姓名")
          )?.getAttribute("placeholder") ?? ""
      };
    },
    { cols: memberColumns, roles: roleColumns }
  );
  return data;
}

async function collectTeamMetrics(page: Page) {
  const raw = await page.evaluate(
    ({ groups, members, runtime, roles, tenants }) => {
      const one = (selector: string) => document.querySelector(selector);
      const texts = (selector: string) =>
        Array.from(document.querySelectorAll(selector)).map((node) =>
          (node.textContent ?? "").trim()
        );
      const textIncludesAll = (value: string, labels: string[]) =>
        labels.every((label) => value.includes(label));
      const listIncludesAll = (value: string[], labels: string[]) =>
        labels.every((label) => value.includes(label));
      const listExcludesAll = (value: string[], labels: string[]) =>
        labels.every((label) => !value.includes(label));
      const box = (selector: string) => {
        const rect = (one(selector) as HTMLElement | null)?.getBoundingClientRect();
        return {
          height: Math.round(rect?.height ?? 0),
          width: Math.round(rect?.width ?? 0)
        };
      };
      const isVisibleBox = (rect: DOMRect | undefined) => {
        if (!rect) return false;
        return rect.width > 1 && rect.height > 1 && rect.x >= 0;
      };
      const bodyText = document.body.innerText;
      const fullText = document.body.textContent ?? "";
      const note = one('[data-testid="m7-team-runtime-note"]') as HTMLElement | null;
      const noteBox = note?.getBoundingClientRect();
      const navButtons = texts('[data-testid="app-shell-nav"] button');
      const navGroups = texts('[data-testid="app-shell-nav"] .uz-nav-group p');
      return {
        activePageId: one('[data-testid="admin-shell"]')?.getAttribute(
          "data-active-page-id"
        ),
        bodyScrollWidth: document.body.scrollWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        drawerWidth: box(".uz-team-drawer").width,
        groupNavLabelsAbsent: listExcludesAll(navButtons, groups),
        inviteModalOpen: !!one('[data-testid="m7-team-invite-modal"]'),
        inviteModalWidth: box('[data-testid="m7-team-invite-modal"] .uz-team-modal-card')
          .width,
        memberColumns: texts(".uz-team-table th"),
        memberDrawerOpen: !!one('[data-testid="m7-team-member-drawer"]'),
        navWidth: box('[data-testid="app-shell-nav"]').width,
        placeholder:
          one('[data-testid="m7-team-search"]')?.getAttribute("placeholder") ?? "",
        roleEditorOpen: !!one('[data-testid="m7-team-role-editor"]'),
        roleEditorWidth: box('[data-testid="m7-team-role-editor"] .uz-team-modal-card')
          .width,
        roleColumns: texts(".uz-team-table th"),
        runtimeLabelsPresent: textIncludesAll(fullText, runtime),
        runtimeNoteVisible: isVisibleBox(noteBox),
        shellLevel: one('[data-testid="admin-shell"]')?.getAttribute("data-shell-level"),
        sidebarCategories: navGroups,
        sourceLikeMembersVisible: textIncludesAll(bodyText, ["团队", ...members]),
        sourceLikeRolesVisible: textIncludesAll(bodyText, ["角色管理", ...roles]),
        tenantCategoryLabelsPresent: listIncludesAll(navGroups, tenants),
        topbarHeight: box(".uz-topbar").height
      };
    },
    {
      groups: groupLabels,
      members: memberColumns,
      roles: roleColumns,
      runtime: runtimeLabels,
      tenants: tenantSections
    }
  );
  return raw;
}

async function saveShot(page: Page, name: string) {
  await page.screenshot({ fullPage: true, path: `${artifactDir}/${name}` });
}

function writeJson(name: string, value: unknown) {
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

function writeSourceMappingSummary() {
  const pageSource = readFileSync(sourceFiles.page, "utf8");
  const fixtureSource = readFileSync(sourceFiles.fixtures, "utf8");
  const mapping = {
    decision: {
      reactFollows:
        "owner-rendered-header-tabs-search-modal-geometry-plus-unpacked-source-table-mapping"
    },
    files: sourceFiles,
    unpacked: {
      inviteFieldsPresent: inviteFields.every((label) => pageSource.includes(label)),
      memberColumns,
      roleColumns,
      roleEditorLabelsPresent:
        pageSource.includes("新建角色") &&
        pageSource.includes("编辑角色") &&
        pageSource.includes("权限"),
      teamFixturePresent:
        fixtureSource.includes("TEAM_MEMBERS") && fixtureSource.includes("TEAM_ROLES")
    }
  };
  writeJson("unpacked-team-source-mapping.json", mapping);
  return mapping;
}
