import "./AppShell.css";
import { useMemo, useState, type ReactNode } from "react";
import { Bell, PanelLeftClose, UserCircle } from "lucide-react";
import { Button, Heartbeat, IconSlot, SearchInput, StatusBadge } from "../primitives";
import { NavItem } from "../patterns";
import { adminPageNavigation, getAdminPage, type AdminPageId } from "../pages/registry";
import { appShellIcons } from "./AppShellIcons";

type TenantHealth = "healthy" | "degraded" | "attention";
interface AppShellTenant extends Record<"id" | "name" | "status", string> {
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
  attention: { badge: "danger", heartbeat: "warn" },
  degraded: { badge: "warn", heartbeat: "warn" },
  healthy: { badge: "ok", heartbeat: "ok" }
} as const;
const envTone = { local: "info", production: "neutral", staging: "warn" } as const;
const groupNav = adminPageNavigation.group.map(createNavEntry);
const tenantNav = adminPageNavigation.tenant.map(createNavEntry);
const layerConfig = {
  group: ["集团层", "neutral", "is-active", groupNav, "GROUP"],
  tenant: ["租户层", "info", undefined, tenantNav, "TENANT"]
} as const;
const toggleCopy = {
  collapsed: { aria: "Expand navigation", text: "展开" },
  expanded: { aria: "Collapse navigation", text: "收起导航" }
};

export function AppShell({
  children,
  env = "staging",
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
  const [layerBadgeText, layerBadgeTone, buttonClass, activeNav, navLabel] =
    layerConfig[route.level];
  const navToggle = getToggleCopy(expanded);
  const tenantTone = toneByHealth[selectedTenant.health];

  return (
    <main
      className={shellClassName(expanded)}
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
        {envStrip(env)}
        <header className="uz-topbar">
          <div
            className="uz-breadcrumb"
            aria-label="Current scope"
            data-testid="route-breadcrumb"
          >
            <button
              aria-label="Back to group overview"
              className={buttonClass}
              onClick={() => onRouteChange(groupOverviewRoute())}
              type="button"
            >
              集团
            </button>
            <span>/</span>
            <strong>{breadcrumbLabel(route, selectedTenant.name)}</strong>
            <StatusBadge data-testid="active-layer-badge" tone={layerBadgeTone}>
              {layerBadgeText}
            </StatusBadge>
          </div>
          <label className="uz-tenant-select" htmlFor="tenant-switcher">
            <span>Tenant</span>
            <select
              data-testid="tenant-switcher"
              id="tenant-switcher"
              onChange={(event) =>
                onRouteChange(createTenantRoute(route, event.currentTarget.value))
              }
              value={selectedTenant.id}
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - {tenant.status}
                </option>
              ))}
            </select>
            <StatusBadge dot tone={tenantTone.badge}>
              {selectedTenant.status}
            </StatusBadge>
          </label>
          <SearchInput
            aria-label="Search"
            kbdHint="Cmd K"
            readOnly
            value="Search shell"
          />
          <div className="uz-topbar-actions" aria-label="Operator tools">
            <StatusBadge data-testid="environment-marker" tone={envTone[env]}>
              {env.toUpperCase()}
            </StatusBadge>
            <span className="uz-heartbeat-label" data-testid="system-heartbeat">
              <Heartbeat tone={tenantTone.heartbeat} />
              <span>68ms</span>
            </span>
            <button aria-label="Notifications" type="button" disabled>
              <IconSlot icon={Bell} />
            </button>
            <button aria-label="User menu" type="button" disabled>
              <IconSlot icon={UserCircle} />
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

function groupOverviewRoute(): AdminShellRoute {
  return { level: "group", pageId: "group.overview" };
}

function breadcrumbLabel(route: AdminShellRoute, tenantName: string) {
  return route.level === "group" ? getAdminPage(route.pageId).label : tenantName;
}

function shellClassName(expanded: boolean) {
  return `admin-shell m2-admin-shell uz-app-shell${expanded ? "" : " is-nav-collapsed"}`;
}

function getToggleCopy(expanded: boolean) {
  return expanded ? toggleCopy.expanded : toggleCopy.collapsed;
}

function envStrip(env: NonNullable<AppShellProps["env"]>) {
  return env === "staging" ? <div aria-hidden className="uz-env-strip" /> : null;
}
