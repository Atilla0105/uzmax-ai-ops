import { NavItem } from "../patterns";
import { adminPageNavigation, type AdminPageId } from "../pages/registry";
import { appShellIcons } from "./AppShellIcons";

type AdminNavigationPage =
  (typeof adminPageNavigation)[keyof typeof adminPageNavigation][number];

type NavEntry = {
  badge?: string;
  icon: (typeof appShellIcons)[AdminPageId];
  id: AdminPageId;
  label: string;
  navId: string;
};

type NavGroupConfig = {
  label: string;
  pages: readonly AdminPageId[];
};

type NavGroupEntry = {
  items: NavEntry[];
  label: string;
};

type AppShellNavGroupProps = {
  activePageId: AdminPageId;
  collapsed: boolean;
  group: NavGroupEntry;
  onSelect: (id: AdminPageId) => void;
};

const navBadges: Partial<Record<AdminPageId, string>> = {
  "tenant.conversations": "mock",
  "tenant.queue": "mock",
  "tenant.tickets": "mock"
};

const groupNavConfig = [
  { label: "总览", pages: ["group.overview", "group.modelRisk"] },
  {
    label: "平台",
    pages: ["group.templates", "group.connections", "group.release"]
  },
  { label: "治理", pages: ["group.tenants", "group.logs"] }
] as const satisfies readonly NavGroupConfig[];

const tenantNavConfig = [
  {
    label: "运营",
    pages: ["tenant.conversations", "tenant.tickets", "tenant.queue"]
  },
  {
    label: "数据",
    pages: ["tenant.customers", "tenant.orders", "tenant.knowledge"]
  },
  { label: "智能", pages: ["tenant.eval", "tenant.aiMembers"] },
  { label: "管理", pages: ["tenant.team", "tenant.config"] },
  { label: "洞察", pages: ["tenant.analytics", "tenant.logs"] }
] as const satisfies readonly NavGroupConfig[];

export const appShellNavGroups = {
  group: createNavGroups(groupNavConfig, adminPageNavigation.group),
  tenant: createNavGroups(tenantNavConfig, adminPageNavigation.tenant)
} as const;

export function AppShellNavGroup({
  activePageId,
  collapsed,
  group,
  onSelect
}: AppShellNavGroupProps) {
  return (
    <section className="uz-nav-group">
      <p>{group.label}</p>
      {group.items.map(({ id, navId, ...item }) => (
        <NavItem
          {...item}
          active={activePageId === id}
          collapsed={collapsed}
          data-nav-id={navId}
          key={id}
          onClick={() => onSelect(id)}
        />
      ))}
    </section>
  );
}

function createNavGroups(
  groups: readonly NavGroupConfig[],
  pages: readonly AdminNavigationPage[]
) {
  const pagesById = new Map(pages.map((page) => [page.id, page]));
  return groups.map((group) => ({
    items: group.pages.map((pageId) =>
      createNavEntry(assertNavPage(pageId, pagesById))
    ),
    label: group.label
  }));
}

function createNavEntry(page: AdminNavigationPage): NavEntry {
  return {
    badge: navBadges[page.id],
    icon: appShellIcons[page.id],
    id: page.id,
    label: page.label,
    navId: page.navId ?? page.id
  };
}

function assertNavPage(
  pageId: AdminPageId,
  pagesById: ReadonlyMap<AdminPageId, AdminNavigationPage>
) {
  const page = pagesById.get(pageId);
  if (!page) {
    throw new Error(`Missing AppShell navigation page: ${pageId}`);
  }
  return page;
}
