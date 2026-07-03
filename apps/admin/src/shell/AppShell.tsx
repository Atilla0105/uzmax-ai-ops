import "./AppShell.css";
import { useMemo, useState, type ReactNode } from "react";
import { Bell, ChevronsUpDown, PanelLeftClose } from "lucide-react";
import { Button, Heartbeat, IconSlot, SearchInput } from "../primitives";
import { NavItem } from "../patterns";
import { adminPageNavigation, getAdminPage, type AdminPageId } from "../pages/registry";
import { appShellIcons } from "./AppShellIcons";

type TenantHealth = "healthy" | "degraded" | "attention" | "breaker";
interface AppShellTenant extends Record<"id" | "line" | "name" | "status", string> {
  health: TenantHealth;
}
export type AdminShellRoute = {
  level: "group" | "tenant";
  pageId: AdminPageId;
  tenantId?: string;
};
export type AppShellProps = {
  children: ReactNode;
  env?: "production" | "staging" | "local";
  onRouteChange: (route: AdminShellRoute) => void;
  route: AdminShellRoute;
  selectedTenantId: AppShellTenant["id"];
  tenants: readonly [AppShellTenant, ...AppShellTenant[]];
};
type AdminNavigationPage =
  (typeof adminPageNavigation)[keyof typeof adminPageNavigation][number];
type NavEntry = ReturnType<typeof createNavEntry>;

const navBadges: Partial<Record<AdminPageId, string>> = {
  "tenant.conversations": "7",
  "tenant.queue": "9",
  "tenant.tickets": "3"
};
const toneByHealth = {
  attention: { heartbeat: "warn" },
  breaker: { heartbeat: "off" },
  degraded: { heartbeat: "warn" },
  healthy: { heartbeat: "ok" }
} as const;
const groupNav = adminPageNavigation.group.map(createNavEntry);
const tenantNav = adminPageNavigation.tenant.map(createNavEntry);
const layerConfig = {
  group: ["集团层", groupNav, "GROUP"],
  tenant: ["租户层", tenantNav, "TENANT"]
} as const;
const toggleCopy = {
  collapsed: { aria: "Expand navigation", text: "展开" },
  expanded: { aria: "Collapse navigation", text: "收起导航" }
};

export function AppShell({
  children,
  env = "production",
  onRouteChange,
  route,
  selectedTenantId,
  tenants
}: AppShellProps) {
  const [expanded, setExpanded] = useState(true);
  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0],
    [selectedTenantId, tenants]
  );
  const [layerBadgeText, activeNav, navLabel] = layerConfig[route.level];
  const navToggle = expanded ? toggleCopy.expanded : toggleCopy.collapsed;
  const tenantTone = toneByHealth[selectedTenant.health];
  const groupPageLabel =
    route.level === "group" ? getAdminPage(route.pageId).label : undefined;

  return (
    <main
      className={`admin-shell m2-admin-shell uz-app-shell${
        expanded ? "" : " is-nav-collapsed"
      }`}
      data-active-page-id={route.pageId}
      data-shell-level={route.level}
      data-testid="admin-shell"
    >
      <aside
        aria-label="Primary navigation"
        className="uz-app-nav"
        data-testid="app-shell-nav"
      >
        <div className="uz-nav-brand">
          <span className="uz-nav-brand__mark">U</span>
          <span className="uz-nav-brand__text">
            <strong>UZMAX</strong>
            <span>运营塔台</span>
          </span>
        </div>
        <nav className="uz-nav-body">
          <NavGroup
            activePageId={route.pageId}
            collapsed={!expanded}
            items={activeNav}
            label={navLabel}
            onSelect={(pageId) =>
              onRouteChange(createPageRoute(pageId, selectedTenant.id))
            }
          />
        </nav>
        <Button
          aria-label={navToggle.aria}
          className="uz-nav-collapse"
          icon={<IconSlot icon={PanelLeftClose} />}
          onClick={() => setExpanded((current) => !current)}
          variant="ghost"
        >
          {navToggle.text}
        </Button>
      </aside>
      <section className="uz-app-main">
        {env === "staging" ? <div aria-hidden className="uz-env-strip" /> : null}
        <header className="uz-topbar">
          <div
            className="uz-breadcrumb"
            aria-label="Current scope"
            data-testid="route-breadcrumb"
          >
            <button
              aria-label="Back to group overview"
              className={route.level === "group" ? "is-active" : undefined}
              onClick={() =>
                onRouteChange({ level: "group", pageId: "group.overview" })
              }
              type="button"
            >
              集团
            </button>
            <span>/</span>
            <label className="uz-tenant-select" htmlFor="tenant-switcher">
              <span className="uz-tenant-capsule" aria-hidden="true">
                <span
                  className={`uz-tenant-dot uz-tenant-dot--${selectedTenant.health}`}
                />
                <span className="uz-tenant-copy">
                  <strong>{selectedTenant.name}</strong>
                  <span>{selectedTenant.line}</span>
                </span>
                <IconSlot icon={ChevronsUpDown} size="sm" />
              </span>
              <select
                aria-label="切换租户"
                data-testid="tenant-switcher"
                id="tenant-switcher"
                onChange={(event) =>
                  onRouteChange(createTenantRoute(route, event.currentTarget.value))
                }
                value={selectedTenant.id}
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} · {tenant.status}
                  </option>
                ))}
              </select>
            </label>
            {groupPageLabel ? (
              <span className="uz-breadcrumb-page">· {groupPageLabel}</span>
            ) : null}
            <span className="uz-layer-badge" data-testid="active-layer-badge">
              {layerBadgeText}
            </span>
          </div>
          <SearchInput
            aria-label="Search"
            className="uz-global-search"
            kbdHint="Cmd K"
            placeholder="搜索会话、客户、订单、工单、知识..."
            readOnly
          />
          <div className="uz-topbar-actions" aria-label="Operator tools">
            <span
              className={`uz-env-marker uz-env-marker--${env}`}
              data-testid="environment-marker"
            >
              {env.toUpperCase()}
            </span>
            <span className="uz-heartbeat-label" data-testid="system-heartbeat">
              <Heartbeat tone={tenantTone.heartbeat} />
              <span>68ms</span>
            </span>
            <button
              className="uz-notification-button"
              aria-label="Notifications"
              type="button"
            >
              <IconSlot icon={Bell} />
              <span className="uz-notification-badge">5</span>
            </button>
            <button className="uz-user-button" aria-label="User menu" type="button">
              <span className="uz-user-avatar">韩</span>
              <span className="uz-user-copy">
                <strong>韩雪</strong>
                <span>运营负责人</span>
              </span>
            </button>
          </div>
        </header>
        <section className="workspace uz-shell-workspace">{children}</section>
      </section>
    </main>
  );
}

type NavGroupProps = {
  activePageId: AdminPageId;
  collapsed: boolean;
  items: NavEntry[];
  label: string;
  onSelect: (id: AdminPageId) => void;
};

function NavGroup({ activePageId, collapsed, items, label, onSelect }: NavGroupProps) {
  return (
    <section className="uz-nav-group">
      <p>{label}</p>
      {items.map(({ id, navId, ...item }) => (
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

function createNavEntry(page: AdminNavigationPage) {
  return {
    badge: navBadges[page.id],
    icon: appShellIcons[page.id],
    id: page.id,
    label: page.label,
    navId: page.navId ?? page.id
  };
}

function createPageRoute(pageId: AdminPageId, tenantId: string): AdminShellRoute {
  const page = getAdminPage(pageId);
  return page.layer === "tenant"
    ? { level: "tenant", pageId, tenantId }
    : { level: "group", pageId: page.layer === "group" ? pageId : "group.overview" };
}

function createTenantRoute(route: AdminShellRoute, tenantId: string): AdminShellRoute {
  const page = getAdminPage(route.pageId);
  const pageId =
    route.level === "tenant" && page.layer === "tenant"
      ? route.pageId
      : "tenant.conversations";
  return { level: "tenant", pageId, tenantId };
}
