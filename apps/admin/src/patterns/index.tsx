import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Inbox, Lock, TriangleAlert } from "lucide-react";
import {
  Button,
  CountBadge,
  IconSlot,
  type IconSlotProps,
  StatusBadge
} from "../primitives";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface NavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  badge?: ReactNode;
  collapsed?: boolean;
  icon?: IconSlotProps["icon"];
  label: string;
}

export function NavItem({
  active,
  badge,
  className,
  collapsed,
  icon,
  label,
  ...props
}: NavItemProps) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      className={cx(
        "uz-nav-item",
        active && "is-active",
        collapsed && "is-collapsed",
        className
      )}
      title={collapsed ? label : undefined}
      type="button"
      {...props}
    >
      <IconSlot icon={icon} />
      {!collapsed ? <span className="uz-nav-item__label">{label}</span> : null}
      {!collapsed && badge ? <CountBadge aria-hidden value={badge} /> : null}
    </button>
  );
}

interface TabDef {
  disabled?: boolean;
  key: string;
  label: ReactNode;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  active: string;
  onChange: (key: string) => void;
  tabs: TabDef[];
}

export function Tabs({ active, className, onChange, tabs, ...props }: TabsProps) {
  return (
    <div className={cx("uz-tabs", className)} role="tablist" {...props}>
      {tabs.map((tab) => (
        <button
          aria-selected={tab.key === active}
          className="uz-tab"
          disabled={tab.disabled}
          key={tab.key}
          onClick={() => onChange(tab.key)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  action?: ReactNode;
  description?: ReactNode;
  icon?: IconSlotProps["icon"];
  title: ReactNode;
}

export function EmptyState({
  action,
  className,
  description,
  icon = Inbox,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cx("uz-empty-state", className)} {...props}>
      <IconSlot icon={icon} size="lg" />
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

type PageStateKind = "loading" | "empty" | "error" | "permission" | "degraded";

export interface PageStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  action?: ReactNode;
  kind: PageStateKind;
  message?: ReactNode;
  title?: ReactNode;
}

const stateCopy: Record<
  PageStateKind,
  { icon: IconSlotProps["icon"]; title: string; tone: "neutral" | "warn" | "danger" }
> = {
  degraded: { icon: TriangleAlert, title: "Degraded", tone: "warn" },
  empty: { icon: Inbox, title: "Empty", tone: "neutral" },
  error: { icon: TriangleAlert, title: "Error", tone: "danger" },
  loading: { icon: Inbox, title: "Loading", tone: "neutral" },
  permission: { icon: Lock, title: "Permission denied", tone: "danger" }
};

export function PageState({
  action,
  className,
  kind,
  message,
  title,
  ...props
}: PageStateProps) {
  const copy = stateCopy[kind];

  return (
    <div
      className={cx("uz-page-state", `uz-page-state--${kind}`, className)}
      data-state={kind}
      {...props}
    >
      {kind === "loading" ? (
        <span aria-label="Loading" className="uz-spinner" role="status" />
      ) : (
        <IconSlot icon={copy.icon} size="lg" />
      )}
      <StatusBadge tone={copy.tone}>{title ?? copy.title}</StatusBadge>
      {message ? <p>{message}</p> : null}
      {action ?? (kind === "error" ? <Button variant="secondary">Retry</Button> : null)}
    </div>
  );
}

export interface DegradedBarProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
}

export function DegradedBar({
  action,
  children,
  className,
  ...props
}: DegradedBarProps) {
  return (
    <div className={cx("uz-degraded-bar", className)} role="status" {...props}>
      <IconSlot icon={TriangleAlert} />
      <span>{children}</span>
      {action}
    </div>
  );
}

export { DataTable } from "./data-table";
export type {
  DataTableColumn,
  DataTableProps,
  DataTableSelection
} from "./data-table";
export {
  BatchActionBar,
  ConfirmModal,
  FilterBar,
  PageToolbar,
  SidePanel
} from "./operational-patterns";
export type {
  BatchAction,
  FilterBarSelect,
  ConfirmReason
} from "./operational-patterns";
export {
  MessageBubble,
  ToastHost,
  useToast
} from "./feedback-patterns";
export type {
  MessageBubbleRole,
  ToastEntry,
  ToastTone
} from "./feedback-patterns";
