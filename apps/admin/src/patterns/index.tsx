import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
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
  icon?: IconSlotProps["text"];
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
      <IconSlot text={icon} />
      {!collapsed ? <span className="uz-nav-item__label">{label}</span> : null}
      {!collapsed && badge ? <CountBadge aria-hidden value={badge} /> : null}
    </button>
  );
}

export interface TabDef {
  disabled?: boolean;
  key: string;
  label: ReactNode;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
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

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
  description?: ReactNode;
  iconText?: string;
  title: ReactNode;
}

export function EmptyState({
  action,
  className,
  description,
  iconText = "0",
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cx("uz-empty-state", className)} {...props}>
      <IconSlot size="lg" text={iconText} />
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export type PageStateKind = "loading" | "empty" | "error" | "permission" | "degraded";

export interface PageStateProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
  kind: PageStateKind;
  message?: ReactNode;
  title?: ReactNode;
}

const stateCopy: Record<
  PageStateKind,
  { icon: string; title: string; tone: "neutral" | "warn" | "danger" }
> = {
  degraded: { icon: "DG", title: "Degraded", tone: "warn" },
  empty: { icon: "0", title: "Empty", tone: "neutral" },
  error: { icon: "ER", title: "Error", tone: "danger" },
  loading: { icon: "LD", title: "Loading", tone: "neutral" },
  permission: { icon: "LK", title: "Permission denied", tone: "danger" }
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
        <IconSlot size="lg" text={copy.icon} />
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
      <IconSlot text="DG" />
      <span>{children}</span>
      {action}
    </div>
  );
}
