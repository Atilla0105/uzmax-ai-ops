import "./AppShell.css";
import { useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Building2,
  ClipboardList,
  Copy,
  Cpu,
  Gauge,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Package,
  PanelLeftClose,
  Plug,
  Rocket,
  ScrollText,
  SlidersHorizontal,
  UserCircle,
  Users,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, Heartbeat, IconSlot, SearchInput, StatusBadge } from "../primitives";
import { NavItem } from "../patterns";
import { adminPageNavigation, type AdminPageId } from "../pages/registry";

type TenantHealth = "healthy" | "degraded" | "attention";

interface AppShellTenant {
  health: TenantHealth;
  id: string;
  line: string;
  name: string;
  risk: string;
  status: string;
}

export interface AppShellProps {
  activePageId: AdminPageId;
  children: ReactNode;
  env?: "production" | "staging" | "local";
  onPageChange: (pageId: AdminPageId) => void;
  onTenantChange: (tenantId: AppShellTenant["id"]) => void;
  selectedTenantId: AppShellTenant["id"];
  tenants: readonly [AppShellTenant, ...AppShellTenant[]];
}

type NavEntry = {
  badge?: string;
  icon: LucideIcon;
  id: AdminPageId;
  label: string;
  navId: string;
};

const navIcons: Record<AdminPageId, LucideIcon> = {
  "group.connections": Plug,
  "group.logs": ScrollText,
  "group.modelRisk": Cpu,
  "group.overview": LayoutDashboard,
  "group.release": Rocket,
  "group.templates": Copy,
  "group.tenants": Building2,
  "legacy.evidence": ScrollText,
  "tenant.aiMembers": Bot,
  "tenant.analytics": BarChart3,
  "tenant.config": SlidersHorizontal,
  "tenant.conversations": MessageSquare,
  "tenant.customers": Users,
  "tenant.eval": Gauge,
  "tenant.knowledge": BookOpen,
  "tenant.logs": ScrollText,
  "tenant.orders": Package,
  "tenant.queue": Inbox,
  "tenant.team": UsersRound,
  "tenant.tickets": ClipboardList
};

const navBadges: Partial<Record<AdminPageId, string>> = {
  "tenant.conversations": "7",
  "tenant.queue": "9",
  "tenant.tickets": "3"
};

const groupNav = adminPageNavigation.group.map((page) => ({
  badge: navBadges[page.id],
  icon: navIcons[page.id],
  id: page.id,
  label: page.label,
  navId: page.navId ?? page.id
})) satisfies NavEntry[];

const tenantNav = adminPageNavigation.tenant.map((page) => ({
  badge: navBadges[page.id],
  icon: navIcons[page.id],
  id: page.id,
  label: page.label,
  navId: page.navId ?? page.id
})) satisfies NavEntry[];

const healthTone: Record<TenantHealth, "ok" | "warn" | "danger"> = {
  attention: "danger",
  degraded: "warn",
  healthy: "ok"
};

export function AppShell({
  activePageId,
  children,
  env = "staging",
  onPageChange,
  onTenantChange,
  selectedTenantId,
  tenants
}: AppShellProps) {
  const [expanded, setExpanded] = useState(true);
  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0],
    [selectedTenantId, tenants]
  );

  return (
    <main
      className={`admin-shell m2-admin-shell uz-app-shell${
        expanded ? "" : " is-nav-collapsed"
      }`}
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
            activePageId={activePageId}
            collapsed={!expanded}
            items={groupNav}
            label="GROUP"
            onSelect={onPageChange}
          />
          <NavGroup
            activePageId={activePageId}
            collapsed={!expanded}
            items={tenantNav}
            label="TENANT"
            onSelect={onPageChange}
          />
        </nav>
        <Button
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          className="uz-nav-collapse"
          icon={<IconSlot icon={PanelLeftClose} />}
          onClick={() => setExpanded((current) => !current)}
          variant="ghost"
        >
          {expanded ? "收起导航" : "展开"}
        </Button>
      </aside>

      <section className="uz-app-main">
        {env === "staging" ? <div aria-hidden className="uz-env-strip" /> : null}
        <header className="uz-topbar">
          <div className="uz-breadcrumb" aria-label="Current scope">
            <span className="uz-breadcrumb__compact">
              Group / {selectedTenant.name}
            </span>
            <button type="button">Group</button>
            <span>/</span>
            <strong>{selectedTenant.name}</strong>
          </div>
          <label className="uz-tenant-select" htmlFor="tenant-switcher">
            <span>Tenant</span>
            <select
              data-testid="tenant-switcher"
              id="tenant-switcher"
              onChange={(event) => onTenantChange(event.currentTarget.value)}
              value={selectedTenant.id}
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - {tenant.status}
                </option>
              ))}
            </select>
            <StatusBadge dot tone={healthTone[selectedTenant.health]}>
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
            <StatusBadge
              data-testid="environment-marker"
              tone={env === "production" ? "neutral" : "warn"}
            >
              {env.toUpperCase()}
            </StatusBadge>
            <span className="uz-heartbeat-label" data-testid="system-heartbeat">
              <Heartbeat tone={selectedTenant.health === "healthy" ? "ok" : "warn"} />
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

function NavGroup({
  activePageId,
  collapsed,
  items,
  label,
  onSelect
}: {
  activePageId: AdminPageId;
  collapsed: boolean;
  items: NavEntry[];
  label: string;
  onSelect: (id: AdminPageId) => void;
}) {
  return (
    <section className="uz-nav-group">
      <p>{label}</p>
      {items.map((item) => (
        <NavItem
          active={activePageId === item.id}
          badge={item.badge}
          collapsed={collapsed}
          icon={item.icon}
          key={item.id}
          label={item.label}
          onClick={() => onSelect(item.id)}
          data-nav-id={item.navId}
        />
      ))}
    </section>
  );
}
