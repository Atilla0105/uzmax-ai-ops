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
  icon: LucideIcon;
  id: string;
  label: string;
};

const groupNav: NavEntry[] = [
  { id: "overview", label: "集团总览", icon: LayoutDashboard },
  { id: "model-risk", label: "模型/成本/风险", icon: Cpu },
  { id: "templates", label: "模板中心", icon: Copy },
  { id: "connections", label: "连接中心", icon: Plug },
  { id: "release", label: "发布与验收", icon: Rocket },
  { id: "tenants", label: "租户管理", icon: Building2 },
  { id: "group-logs", label: "集团日志", icon: ScrollText }
];

const tenantNav: NavEntry[] = [
  { id: "conversations", label: "对话", icon: MessageSquare, badge: "7" },
  { id: "tickets", label: "工单", icon: ClipboardList, badge: "3" },
  { id: "customers", label: "客户资产", icon: Users },
  { id: "orders", label: "订单", icon: Package },
  { id: "knowledge", label: "知识与资源", icon: BookOpen },
  { id: "queue", label: "确认队列", icon: Inbox, badge: "9" },
  { id: "eval", label: "评测中心", icon: Gauge },
  { id: "ai-members", label: "AI 成员", icon: Bot },
  { id: "team", label: "团队", icon: UsersRound },
  { id: "config", label: "配置", icon: SlidersHorizontal },
  { id: "analytics", label: "分析", icon: BarChart3 },
  { id: "logs", label: "日志", icon: ScrollText }
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
          icon={item.icon}
          key={item.id}
          label={item.label}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </section>
  );
}
