import { useEffect, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { IconSlot, StatusBadge, Toggle } from "../../primitives";
import {
  badgeTone,
  tenantCapabilities,
  tenantLanguages,
  tenantTimezones,
  toneClass,
  type TenantCapability,
  type TenantCard
} from "./groupTenantFallback";

type GridProps = {
  onOpen: (tenant: TenantCard, trigger: HTMLButtonElement) => void;
  tenants: TenantCard[];
};
type DrawerProps = {
  onChangeLanguage: (tenant: TenantCard, value: string) => void;
  onChangeTimezone: (tenant: TenantCard, value: string) => void;
  onClose: () => void;
  onDisable: (tenant: TenantCard) => void;
  onRestore: (tenant: TenantCard) => void;
  onToggleCapability: (tenant: TenantCard, capability: TenantCapability) => void;
  tenant: TenantCard;
};
type SelectFieldProps = {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  testId: string;
  value: string;
};

const focusableSelector =
  "button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";

export function TenantGrid({ onOpen, tenants }: GridProps) {
  return (
    <section aria-label="租户卡片" className="uz-tenant-grid">
      {tenants.map((tenant) => (
        <button
          aria-label={`管理租户 ${tenant.name} · ${tenant.status}`}
          className={`uz-tenant-card${tenant.disabled ? " is-disabled" : ""}`}
          data-testid={`m7-tenant-card-${tenant.id}`}
          key={tenant.id}
          onClick={(event) => onOpen(tenant, event.currentTarget)}
          type="button"
        >
          <div className="uz-tenant-card-head">
            <span className={`uz-tenant-dot ${toneClass(tenant.dotTone)}`} />
            <strong className="uz-tenant-card-name">{tenant.name}</strong>
            <StatusBadge tone={badgeTone(tenant.statusTone)}>
              {tenant.status}
              <span className="uz-tenant-sr-only">{`mock ${tenant.status}`}</span>
            </StatusBadge>
          </div>
          <div className="uz-tenant-line">
            {tenant.line} · {tenant.template}
          </div>
          <div className="uz-tenant-stats">
            <span>
              <span>成员 </span>
              <span className="uz-tenant-sr-only">mock 成员 </span>
              <span className="uz-tenant-mono">{tenant.members}</span>
            </span>
            <span>
              <span>AI </span>
              <span className="uz-tenant-sr-only">mock AI </span>
              <span className="uz-tenant-mono">{tenant.ai}</span>
            </span>
            <span>
              <span>连接 </span>
              <span className="uz-tenant-sr-only">mock 连接 </span>
              <strong className={`uz-tenant-conn ${toneClass(tenant.connectionTone)}`}>
                {tenant.connection}
              </strong>
            </span>
          </div>
        </button>
      ))}
    </section>
  );
}

export function TenantDrawer({
  onChangeLanguage,
  onChangeTimezone,
  onClose,
  onDisable,
  onRestore,
  onToggleCapability,
  tenant
}: DrawerProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const actionClass = tenant.disabled
    ? "uz-tenant-action uz-tenant-action--restore"
    : "uz-tenant-action";
  const actionLabel = tenant.disabled ? "恢复租户" : "停用租户";
  const actionTestId = tenant.disabled ? "m7-tenant-restore" : "m7-tenant-disable";

  useEffect(() => closeRef.current?.focus(), [tenant.id]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "Tab") trapDialogTab(event, dialogRef.current);
  };

  return (
    <div
      className="uz-tenant-scrim"
      data-testid="m7-tenant-drawer-scrim"
      onClick={onClose}
    >
      <section
        aria-labelledby="m7-tenant-drawer-title"
        aria-modal="true"
        className="uz-tenant-drawer"
        data-testid="m7-tenant-drawer"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <header className="uz-tenant-drawer-head">
          <span className={`uz-tenant-dot ${toneClass(tenant.dotTone)}`} />
          <div className="uz-tenant-drawer-title">
            <h3 id="m7-tenant-drawer-title">{tenant.name}</h3>
            <span className="uz-tenant-muted">{tenant.line}</span>
          </div>
          <StatusBadge tone={badgeTone(tenant.statusTone)}>
            {tenant.status}
            <span className="uz-tenant-sr-only">{`mock ${tenant.status}`}</span>
          </StatusBadge>
          <button
            aria-label="关闭租户管理抽屉"
            className="uz-tenant-close"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <IconSlot icon={X} size="sm" />
          </button>
        </header>
        <div className="uz-tenant-drawer-body">
          <div className="uz-tenant-field-grid">
            <SelectField
              label="默认语言"
              onChange={(value) => onChangeLanguage(tenant, value)}
              options={tenantLanguages}
              testId="m7-tenant-language"
              value={tenant.language}
            />
            <SelectField
              label="默认时区"
              onChange={(value) => onChangeTimezone(tenant, value)}
              options={tenantTimezones}
              testId="m7-tenant-timezone"
              value={tenant.timezone}
            />
          </div>
          <section aria-label="渠道能力">
            <div className="uz-tenant-section-label">渠道能力</div>
            <div className="uz-tenant-cap-list">
              {tenantCapabilities.map((capability) => {
                const enabled = tenant.capabilities[capability.key];
                return (
                  <div className="uz-tenant-cap" key={capability.key}>
                    <strong>{capability.label}</strong>
                    <span>
                      {enabled ? "已启用" : "已停用"}
                      <span className="uz-tenant-sr-only">
                        {enabled ? "mock 已启用" : "mock 已停用"}
                      </span>
                    </span>
                    <Toggle
                      aria-label={`${tenant.name} ${capability.label} browser-local capability`}
                      checked={enabled}
                      data-testid={`m7-tenant-cap-${capability.key}`}
                      onClick={() => onToggleCapability(tenant, capability)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
          <div className="uz-tenant-muted">来源模板：{tenant.template}</div>
          {tenant.disabled ? (
            <div
              className="uz-tenant-disabled-note"
              data-testid="m7-tenant-disabled-note"
            >
              已停用 · {tenant.disabledAt || "browser-local now"} · 原因：
              {tenant.disableReason || "browser-local only"}
            </div>
          ) : null}
          <div className="uz-tenant-section-label">
            停用/恢复仅更新浏览器状态；生产审计未写入
          </div>
        </div>
        <footer className="uz-tenant-drawer-foot">
          <button
            className={actionClass}
            data-testid={actionTestId}
            onClick={() => (tenant.disabled ? onRestore(tenant) : onDisable(tenant))}
            type="button"
          >
            {actionLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}

function SelectField({ label, onChange, options, testId, value }: SelectFieldProps) {
  return (
    <label className="uz-tenant-field">
      <span>{label}</span>
      <select
        data-testid={testId}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function trapDialogTab(event: KeyboardEvent<HTMLElement>, dialog: HTMLElement | null) {
  const focusable = dialog
    ? Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
    : [];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  const shouldWrapBack = event.shiftKey && document.activeElement === first;
  const shouldWrapNext = !event.shiftKey && document.activeElement === last;
  if (!shouldWrapBack && !shouldWrapNext) return;
  event.preventDefault();
  (shouldWrapBack ? last : first).focus();
}
