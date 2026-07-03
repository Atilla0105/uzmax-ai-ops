import "./AppShell.css";
import { useMemo, useState, type ReactNode } from "react";
import { Button, Heartbeat, IconSlot, SearchInput, StatusBadge } from "../primitives";
import { NavItem } from "../patterns";

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
  children: ReactNode;
  env?: "production" | "staging" | "local";
  onTenantChange: (tenantId: AppShellTenant["id"]) => void;
  selectedTenantId: AppShellTenant["id"];
  tenants: readonly [AppShellTenant, ...AppShellTenant[]];
}

type NavEntry = {
  badge?: string;
  id: string;
  label: string;
  mark: string;
};

const groupNav: NavEntry[] = [
  { id: "overview", label: "集团总览", mark: "总" },
  { id: "model-risk", label: "模型/成本/风险", mark: "模" },
  { id: "templates", label: "模板中心", mark: "模" },
  { id: "connections", label: "连接中心", mark: "连" },
  { id: "release", label: "发布与验收", mark: "发" },
  { id: "tenants", label: "租户管理", mark: "租" },
  { id: "group-logs", label: "集团日志", mark: "志" }
];

const tenantNav: NavEntry[] = [
  { id: "conversations", label: "对话", mark: "对", badge: "7" },
  { id: "tickets", label: "工单", mark: "工", badge: "3" },
  { id: "customers", label: "客户资产", mark: "客" },
  { id: "orders", label: "订单", mark: "订" },
  { id: "knowledge", label: "知识与资源", mark: "知" },
  { id: "queue", label: "确认队列", mark: "确", badge: "9" },
  { id: "eval", label: "评测中心", mark: "评" },
  { id: "ai-members", label: "AI 成员", mark: "AI" },
  { id: "team", label: "团队", mark: "团" },
  { id: "config", label: "配置", mark: "配" },
  { id: "analytics", label: "分析", mark: "析" },
  { id: "logs", label: "日志", mark: "志" }
];

const healthTone: Record<TenantHealth, "ok" | "warn" | "danger"> = {
  attention: "danger",
  degraded: "warn",
  healthy: "ok"
};

export function AppShell({
  children,
  env = "staging",
  onTenantChange,
  selectedTenantId,
  tenants
}: AppShellProps) {
  const [activeNav, setActiveNav] = useState("overview");
  const [expanded, setExpanded] = useState(true);
  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0],
    [selectedTenantId, tenants]
  );

  return (
    <main
      className={`admin-shell m2-admin-shell uz-app-shell${expanded ? "" : " is-nav-collapsed"}`}
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
            activeNav={activeNav}
            collapsed={!expanded}
            items={groupNav}
            label="GROUP"
            onSelect={setActiveNav}
          />
          <NavGroup
            activeNav={activeNav}
            collapsed={!expanded}
            items={tenantNav}
            label="TENANT"
            onSelect={setActiveNav}
          />
        </nav>
        <Button
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          className="uz-nav-collapse"
          icon={<IconSlot text={expanded ? "收" : "展"} />}
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
            <button type="button" disabled>
              Notifications
            </button>
            <button type="button" disabled>
              User menu
            </button>
          </div>
        </header>
        <section className="workspace uz-shell-workspace">{children}</section>
      </section>
    </main>
  );
}

function NavGroup({
  activeNav,
  collapsed,
  items,
  label,
  onSelect
}: {
  activeNav: string;
  collapsed: boolean;
  items: NavEntry[];
  label: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="uz-nav-group">
      <p>{label}</p>
      {items.map((item) => (
        <NavItem
          active={activeNav === item.id}
          badge={item.badge}
          collapsed={collapsed}
          icon={item.mark}
          key={item.id}
          label={item.label}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </section>
  );
}
