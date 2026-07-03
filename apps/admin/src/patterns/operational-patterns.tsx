import type { ReactNode, SelectHTMLAttributes } from "react";
import { X } from "lucide-react";
import { Button, IconSlot, SearchInput, StatusBadge } from "../primitives";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface FilterBarSelect extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function FilterBar({
  actions,
  filters = [],
  onSearchChange,
  searchLabel = "Search",
  searchPlaceholder = "Search",
  searchValue = ""
}: {
  actions?: ReactNode;
  filters?: FilterBarSelect[];
  onSearchChange?: (value: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
}) {
  return (
    <div className="uz-filter-bar" data-testid="m7-filter-bar">
      <SearchInput
        aria-label={searchLabel}
        onChange={(event) => onSearchChange?.(event.currentTarget.value)}
        placeholder={searchPlaceholder}
        readOnly={!onSearchChange}
        value={searchValue}
      />
      {filters.map(({ className, label, ...selectProps }) => (
        <label className={cx("uz-filter-bar__select", className)} key={label}>
          <span>{label}</span>
          <select {...selectProps} />
        </label>
      ))}
      {actions ? <div className="uz-filter-bar__actions">{actions}</div> : null}
    </div>
  );
}

export function PageToolbar({
  actions,
  eyebrow,
  meta,
  status,
  title
}: {
  actions?: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  title: ReactNode;
}) {
  return (
    <header className="uz-page-toolbar" data-testid="m7-page-toolbar">
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
        {meta ? <p>{meta}</p> : null}
      </div>
      {status}
      {actions ? <div className="uz-page-toolbar__actions">{actions}</div> : null}
    </header>
  );
}

export interface BatchAction {
  danger?: boolean;
  key: string;
  label: ReactNode;
  onClick: () => void;
}

export function BatchActionBar({
  actions,
  count,
  label = "Selected",
  onClear
}: {
  actions: BatchAction[];
  count: number;
  label?: ReactNode;
  onClear?: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="uz-batch-action-bar" data-testid="m7-batch-action-bar">
      <StatusBadge tone="neutral">
        {label} <strong>{count}</strong>
      </StatusBadge>
      <div className="uz-batch-action-bar__actions">
        {actions.map((action) => (
          <Button
            key={action.key}
            onClick={action.onClick}
            variant={action.danger ? "danger" : "ghost"}
          >
            {action.label}
          </Button>
        ))}
        {onClear ? <Button onClick={onClear} variant="ghost">Clear</Button> : null}
      </div>
    </div>
  );
}

export function SidePanel({
  actions,
  children,
  meta,
  onClose,
  open,
  title
}: {
  actions?: ReactNode;
  children: ReactNode;
  meta?: ReactNode;
  onClose: () => void;
  open: boolean;
  title: ReactNode;
}) {
  if (!open) return null;
  return (
    <aside className="uz-side-panel" data-testid="m7-side-panel">
      <header>
        <div>
          <h3>{title}</h3>
          {meta ? <p>{meta}</p> : null}
        </div>
        <button aria-label="Close side panel" onClick={onClose} type="button">
          <IconSlot icon={X} />
        </button>
      </header>
      <div>{children}</div>
      {actions ? <footer>{actions}</footer> : null}
    </aside>
  );
}

export interface ConfirmReason {
  label?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}

export function ConfirmModal({
  cancelLabel = "Cancel",
  children,
  confirmLabel,
  danger,
  description,
  onCancel,
  onConfirm,
  open,
  reason,
  title
}: {
  cancelLabel?: ReactNode;
  children?: ReactNode;
  confirmLabel: ReactNode;
  danger?: boolean;
  description?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  reason?: ConfirmReason;
  title: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="uz-confirm-modal" data-testid="m7-confirm-modal">
      <div aria-modal="true" role="dialog">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        {children}
        {reason ? (
          <label>
            <span>{reason.label ?? "Reason"}</span>
            <textarea
              onChange={(event) => reason.onChange(event.currentTarget.value)}
              placeholder={reason.placeholder}
              value={reason.value}
            />
          </label>
        ) : null}
        <footer>
          <Button onClick={onCancel} variant="secondary">{cancelLabel}</Button>
          <Button
            disabled={!!reason?.required && reason.value.trim().length === 0}
            onClick={onConfirm}
            variant={danger ? "danger" : "success"}
          >
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
